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
import { UserPlus, Edit, Eye, MapPin, Phone, AlertTriangle, Clock } from 'lucide-react';
import { Recipient, BloodGroup, UrgencyLevel } from '../../types';
import { supabaseApi } from '../../utils/supabase/client';
import { transformRecipientToServer } from '../../utils/dataTransforms';

interface RecipientManagementProps {
  recipients: Recipient[];
  onUpdate: () => void;
}

export default function RecipientManagement({ recipients, onUpdate }: RecipientManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUrgency, setFilterUrgency] = useState<string>('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [loading, setLoading] = useState(false);

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels: UrgencyLevel[] = ['low', 'medium', 'high', 'critical'];

  const filteredRecipients = recipients.filter(recipient => {
    const matchesSearch = recipient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipient.contactNumber?.includes(searchTerm);
    const matchesUrgency = filterUrgency === 'all' || !filterUrgency || recipient.urgencyLevel === filterUrgency;
    return matchesSearch && matchesUrgency;
  });

  const handleAddRecipient = async (formData: FormData) => {
    setLoading(true);
    try {
      const newRecipientData = {
        userId: `user_${Date.now()}`,
        hospitalId: 'h1', // Current hospital
        name: formData.get('name') as string,
        age: parseInt(formData.get('age') as string),
        bloodGroup: formData.get('bloodGroup') as BloodGroup,
        urgencyLevel: formData.get('urgencyLevel') as UrgencyLevel,
        medicalHistory: formData.get('medicalHistory') as string,
        contactNumber: formData.get('contactNumber') as string,
        address: formData.get('address') as string,
        latitude: parseFloat(formData.get('latitude') as string),
        longitude: parseFloat(formData.get('longitude') as string),
        status: 'waiting' as const
      };

      // Transform to server format
      const serverFormatRecipient = transformRecipientToServer(newRecipientData);
      await supabaseApi.createRecipient(serverFormatRecipient);
      setShowAddDialog(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to add recipient:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-blue-100 text-blue-800';
      case 'matched': return 'bg-purple-100 text-purple-800';
      case 'transplanted': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Blood Recipient Management</h2>
          <p className="text-gray-600">Register and manage patients needing blood donations</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Recipient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register New Recipient</DialogTitle>
              <DialogDescription>
                Add a new patient needing blood donation to the system.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddRecipient(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" name="age" type="number" min="1" max="100" required />
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
                  <Label htmlFor="urgencyLevel">Urgency Level</Label>
                  <Select name="urgencyLevel" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      {urgencyLevels.map(level => (
                        <SelectItem key={level} value={level} className="capitalize">
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input id="contactNumber" name="contactNumber" type="tel" required />
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
                  placeholder="Relevant medical condition and history..."
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Recipient'}
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
              <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency Levels</SelectItem>
                  {urgencyLevels.map(level => (
                    <SelectItem key={level} value={level} className="capitalize">
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Recipients ({filteredRecipients.length})</CardTitle>
          <CardDescription>
            Manage patient information and blood donation requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecipients.map((recipient) => (
                <TableRow key={recipient.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      {recipient.urgencyLevel === 'critical' && (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <span>{recipient.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{recipient.age}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {recipient.bloodGroup}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getUrgencyColor(recipient.urgencyLevel)}>
                      {recipient.urgencyLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(recipient.status)}>
                      {recipient.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm">
                      <Phone className="h-3 w-3" />
                      <span>{recipient.contactNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedRecipient(recipient)}
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

      {/* Recipient Details Dialog */}
      {selectedRecipient && (
        <Dialog open={!!selectedRecipient} onOpenChange={() => setSelectedRecipient(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Recipient Details - {selectedRecipient.name}</DialogTitle>
              <DialogDescription>
                Complete patient information and medical requirements
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <p className="text-sm font-medium">{selectedRecipient.name}</p>
                </div>
                <div>
                  <Label>Age</Label>
                  <p className="text-sm font-medium">{selectedRecipient.age} years</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Blood Group</Label>
                  <Badge variant="outline" className="font-mono">
                    {selectedRecipient.bloodGroup}
                  </Badge>
                </div>
                <div>
                  <Label>Contact Number</Label>
                  <p className="text-sm font-medium">{selectedRecipient.contactNumber}</p>
                </div>
              </div>

              <div>
                <Label>Address</Label>
                <p className="text-sm font-medium">{selectedRecipient.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Urgency Level</Label>
                  <Badge className={getUrgencyColor(selectedRecipient.urgencyLevel)}>
                    {selectedRecipient.urgencyLevel}
                  </Badge>
                </div>
                <div>
                  <Label>Current Status</Label>
                  <Badge className={getStatusColor(selectedRecipient.status)}>
                    {selectedRecipient.status}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Medical History</Label>
                <p className="text-sm">{selectedRecipient.medicalHistory}</p>
              </div>

              <div>
                <Label>Registration Date</Label>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(selectedRecipient.registrationDate).toLocaleDateString()}</span>
                  <span>({Math.floor((Date.now() - new Date(selectedRecipient.registrationDate).getTime()) / (1000 * 60 * 60 * 24))} days ago)</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}