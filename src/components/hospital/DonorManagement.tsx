import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Textarea } from '../ui/textarea';
import { UserPlus, Edit, Eye, MapPin, Phone, Mail } from 'lucide-react';
import { Donor, BloodGroup } from '../../types';
import { supabaseApi } from '../../utils/supabase/client';
import { transformDonorToServer } from '../../utils/dataTransforms';

interface DonorManagementProps {
  donors: Donor[];
  onUpdate: () => void;
}

export default function DonorManagement({ donors, onUpdate }: DonorManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState<string>('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [loading, setLoading] = useState(false);

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = donor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donor.contactNumber?.includes(searchTerm);
    const matchesBloodGroup = filterBloodGroup === 'all' || !filterBloodGroup || donor.bloodGroup === filterBloodGroup;
    return matchesSearch && matchesBloodGroup;
  });

  const handleAddDonor = async (formData: FormData) => {
    setLoading(true);
    try {
      const newDonorData = {
        userId: `user_${Date.now()}`,
        hospitalId: 'h1', // Current hospital
        name: formData.get('name') as string,
        age: parseInt(formData.get('age') as string),
        bloodGroup: formData.get('bloodGroup') as BloodGroup,
        medicalHistory: formData.get('medicalHistory') as string,
        contactNumber: formData.get('contactNumber') as string,
        address: formData.get('address') as string,
        latitude: parseFloat(formData.get('latitude') as string),
        longitude: parseFloat(formData.get('longitude') as string),
        isActive: true,
        verificationStatus: 'pending' as const
      };

      // Transform to server format
      const serverFormatDonor = transformDonorToServer(newDonorData);
      await supabaseApi.createDonor(serverFormatDonor);
      setShowAddDialog(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to add donor:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Blood Donor Management</h2>
          <p className="text-gray-600">Register and manage blood donors</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Donor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register New Donor</DialogTitle>
              <DialogDescription>
                Add a new donor to the system. All information will require verification.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddDonor(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" name="age" type="number" min="18" max="65" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select name="bloodGroup" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map(group => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input id="contactNumber" name="contactNumber" type="tel" required />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input 
                    id="latitude" 
                    name="latitude" 
                    type="number" 
                    step="any" 
                    placeholder="40.7128"
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input 
                    id="longitude" 
                    name="longitude" 
                    type="number" 
                    step="any" 
                    placeholder="-74.0060"
                    required 
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="medicalHistory">Medical History</Label>
                <Textarea 
                  id="medicalHistory" 
                  name="medicalHistory" 
                  placeholder="Any relevant medical history..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Donor'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name or contact number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Select value={filterBloodGroup} onValueChange={setFilterBloodGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by blood group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Blood Groups</SelectItem>
                  {bloodGroups.map(group => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Donors ({filteredDonors.length})</CardTitle>
          <CardDescription>
            Manage donor information and verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDonors.map((donor) => (
                <TableRow key={donor.id}>
                  <TableCell className="font-medium">{donor.name}</TableCell>
                  <TableCell>{donor.age}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {donor.bloodGroup}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm">
                      <Phone className="h-3 w-3" />
                      <span>{donor.contactNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge 
                        variant={donor.isActive ? "default" : "secondary"}
                        className={donor.isActive ? "bg-green-100 text-green-800" : ""}
                      >
                        {donor.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge 
                        variant={donor.verificationStatus === 'verified' ? "default" : "outline"}
                        className={donor.verificationStatus === 'verified' ? "bg-blue-100 text-blue-800" : ""}
                      >
                        {donor.verificationStatus}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedDonor(donor)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Donor Details Dialog */}
      {selectedDonor && (
        <Dialog open={!!selectedDonor} onOpenChange={() => setSelectedDonor(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Donor Details - {selectedDonor.name}</DialogTitle>
              <DialogDescription>
                Complete donor information and medical history
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <p className="text-sm font-medium">{selectedDonor.name}</p>
                </div>
                <div>
                  <Label>Age</Label>
                  <p className="text-sm font-medium">{selectedDonor.age} years</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Blood Group</Label>
                  <Badge variant="outline" className="font-mono">
                    {selectedDonor.bloodGroup}
                  </Badge>
                </div>
                <div>
                  <Label>Contact Number</Label>
                  <p className="text-sm font-medium">{selectedDonor.contactNumber}</p>
                </div>
              </div>

              <div>
                <Label>Address</Label>
                <p className="text-sm font-medium">{selectedDonor.address}</p>
              </div>

              <div>
                <Label>Medical History</Label>
                <p className="text-sm">{selectedDonor.medicalHistory || 'No medical history provided'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <div className="space-y-1">
                    <Badge variant={selectedDonor.isActive ? "default" : "secondary"}>
                      {selectedDonor.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Verification</Label>
                  <Badge variant={selectedDonor.verificationStatus === 'verified' ? "default" : "outline"}>
                    {selectedDonor.verificationStatus}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Last Updated</Label>
                <p className="text-sm text-gray-600">
                  {new Date(selectedDonor.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}