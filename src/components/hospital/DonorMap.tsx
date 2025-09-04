import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { MapPin, Users, Heart, Filter, Layers } from 'lucide-react';
import { Donor, Recipient, BloodGroup, OrganType } from '../../types';

interface DonorMapProps {
  donors: Donor[];
  recipients: Recipient[];
}

export default function DonorMap({ donors, recipients }: DonorMapProps) {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('');
  const [viewMode, setViewMode] = useState<'donors' | 'recipients' | 'both'>('both');
  
  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const organTypes: OrganType[] = ['heart', 'liver', 'kidney', 'lung', 'pancreas', 'cornea', 'bone_marrow'];

  const filteredDonors = donors.filter(donor => {
    const bloodMatch = selectedBloodGroup === 'all' || !selectedBloodGroup || donor.bloodGroup === selectedBloodGroup;
    return bloodMatch && donor.isActive;
  });

  const filteredRecipients = recipients.filter(recipient => {
    const bloodMatch = selectedBloodGroup === 'all' || !selectedBloodGroup || recipient.bloodGroup === selectedBloodGroup;
    return bloodMatch && recipient.status === 'waiting';
  });

  // Mock coordinate bounds for NYC area
  const mapBounds = {
    minLat: 40.7,
    maxLat: 40.8,
    minLng: -74.1,
    maxLng: -73.9
  };

  const normalizeCoordinate = (value: number, min: number, max: number) => {
    return ((value - min) / (max - min)) * 100;
  };

  const getBloodGroupColor = (bloodGroup: BloodGroup) => {
    const colors: Record<BloodGroup, string> = {
      'O+': '#ef4444', 'O-': '#dc2626',
      'A+': '#3b82f6', 'A-': '#2563eb',
      'B+': '#10b981', 'B-': '#059669',
      'AB+': '#f59e0b', 'AB-': '#d97706'
    };
    return colors[bloodGroup] || '#6b7280';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Geographic Map View</h2>
        <p className="text-gray-600">Visualize donor and recipient locations with filtering capabilities</p>
      </div>

      {/* Map Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Map Filters & Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">View Mode</label>
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Both Donors & Recipients</SelectItem>
                  <SelectItem value="donors">Donors Only</SelectItem>
                  <SelectItem value="recipients">Recipients Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Blood Group</label>
              <Select value={selectedBloodGroup} onValueChange={setSelectedBloodGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="All blood groups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Blood Groups</SelectItem>
                  {bloodGroups.map(group => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedBloodGroup('all');
                  setViewMode('both');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Location Map</span>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              {(viewMode === 'donors' || viewMode === 'both') && (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <span>Donors ({filteredDonors.length})</span>
                </div>
              )}
              {(viewMode === 'recipients' || viewMode === 'both') && (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-red-600"></div>
                  <span>Recipients ({filteredRecipients.length})</span>
                </div>
              )}
            </div>
          </CardTitle>
          <CardDescription>
            Interactive map showing geographical distribution of donors and recipients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gray-100 rounded-lg" style={{ height: '500px' }}>
            {/* Mock Map Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg">
              {/* Grid lines to simulate map */}
              <svg className="absolute inset-0 w-full h-full opacity-20">
                {Array.from({ length: 10 }, (_, i) => (
                  <g key={i}>
                    <line
                      x1={`${i * 10}%`}
                      y1="0%"
                      x2={`${i * 10}%`}
                      y2="100%"
                      stroke="#6b7280"
                      strokeWidth="1"
                    />
                    <line
                      x1="0%"
                      y1={`${i * 10}%`}
                      x2="100%"
                      y2={`${i * 10}%`}
                      stroke="#6b7280"
                      strokeWidth="1"
                    />
                  </g>
                ))}
              </svg>
            </div>

            {/* Donors */}
            {(viewMode === 'donors' || viewMode === 'both') && 
              filteredDonors.map((donor) => {
                const x = normalizeCoordinate(donor.longitude, mapBounds.minLng, mapBounds.maxLng);
                const y = 100 - normalizeCoordinate(donor.latitude, mapBounds.minLat, mapBounds.maxLat);
                
                return (
                  <div
                    key={`donor-${donor.id}`}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    title={`${donor.name} - ${donor.bloodGroup} - Blood Donor`}
                  >
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                      style={{ backgroundColor: getBloodGroupColor(donor.bloodGroup) }}
                    />
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg shadow-lg p-3 text-xs whitespace-nowrap z-10">
                      <div className="font-medium">{donor.name}</div>
                      <div>Age: {donor.age}</div>
                      <div>Blood: {donor.bloodGroup}</div>
                      <div>Type: Blood Donor</div>
                    </div>
                  </div>
                );
              })
            }

            {/* Recipients */}
            {(viewMode === 'recipients' || viewMode === 'both') && 
              filteredRecipients.map((recipient) => {
                const x = normalizeCoordinate(recipient.longitude, mapBounds.minLng, mapBounds.maxLng);
                const y = 100 - normalizeCoordinate(recipient.latitude, mapBounds.minLat, mapBounds.maxLat);
                
                return (
                  <div
                    key={`recipient-${recipient.id}`}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    title={`${recipient.name} - ${recipient.bloodGroup} - Blood Recipient`}
                  >
                    <div 
                      className="w-4 h-4 border-2 border-white shadow-md"
                      style={{ 
                        backgroundColor: getUrgencyColor(recipient.urgencyLevel),
                        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                      }}
                    />
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg shadow-lg p-3 text-xs whitespace-nowrap z-10">
                      <div className="font-medium">{recipient.name}</div>
                      <div>Age: {recipient.age}</div>
                      <div>Blood: {recipient.bloodGroup}</div>
                      <div>Needs: Blood Donation</div>
                      <div>Urgency: {recipient.urgencyLevel}</div>
                    </div>
                  </div>
                );
              })
            }

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 text-xs">
              <div className="font-medium mb-2">Legend</div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <span>Donors (Circle)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-600" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                  <span>Recipients (Triangle)</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t">
                <div className="font-medium mb-2">Blood Groups</div>
                <div className="grid grid-cols-2 gap-1">
                  {bloodGroups.map(group => (
                    <div key={group} className="flex items-center space-x-1">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: getBloodGroupColor(group) }}
                      />
                      <span className="font-mono">{group}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Map Controls */}
            <div className="absolute top-4 right-4 space-y-2">
              <Button size="sm" variant="outline" className="bg-white">
                <Layers className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Donor Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bloodGroups.map(group => {
                const count = filteredDonors.filter(d => d.bloodGroup === group).length;
                return (
                  <div key={group} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getBloodGroupColor(group) }}
                      />
                      <span className="font-mono text-sm">{group}</span>
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <span>Recipient Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bloodGroups.map(group => {
                const count = filteredRecipients.filter(r => r.bloodGroup === group).length;
                return (
                  <div key={group} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3" 
                        style={{ 
                          backgroundColor: getBloodGroupColor(group),
                          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                        }}
                      />
                      <span className="font-mono text-sm">{group}</span>
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coverage Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Donor Coverage</span>
                  <span>{Math.round((filteredDonors.length / donors.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(filteredDonors.length / donors.length) * 100}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Recipient Coverage</span>
                  <span>{Math.round((filteredRecipients.length / recipients.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ width: `${(filteredRecipients.length / recipients.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t text-sm text-gray-600">
                <div>Active Donors: {filteredDonors.length}</div>
                <div>Waiting Recipients: {filteredRecipients.length}</div>
                <div>Ratio: {filteredRecipients.length > 0 ? (filteredDonors.length / filteredRecipients.length).toFixed(1) : 'N/A'}:1</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}