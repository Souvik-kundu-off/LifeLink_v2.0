import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Users,
  Settings,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  UserX,
  AlertTriangle,
  TrendingUp,
  Activity,
  Heart,
  ChevronLeft,
  ChevronRight,
  Filter,
  Menu,
  X
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User } from '../types';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

// Mock data for demonstration
const mockMetrics = {
  totalHospitals: 45,
  totalUsers: 1234,
  activeDonors: 567,
  activeRequests: 89
};

const mockChartData = [
  { month: 'Jan', donations: 120, users: 200 },
  { month: 'Feb', donations: 135, users: 245 },
  { month: 'Mar', donations: 165, users: 289 },
  { month: 'Apr', donations: 190, users: 334 },
  { month: 'May', donations: 210, users: 378 },
  { month: 'Jun', donations: 245, users: 423 }
];

const mockPendingHospitals = [
  { id: '1', name: 'Metro General Hospital', address: '123 Health Ave, City', contact: 'Dr. Sarah Johnson', email: 'admin@metrogeneral.com', phone: '(555) 0123', dateSubmitted: '2025-01-15' },
  { id: '2', name: 'St. Mary\'s Medical Center', address: '456 Care Blvd, City', contact: 'Dr. Michael Chen', email: 'contact@stmarys.org', phone: '(555) 0124', dateSubmitted: '2025-01-14' },
  { id: '3', name: 'Regional Blood Center', address: '789 Donation St, City', contact: 'Dr. Emily Rodriguez', email: 'info@regionalblood.com', phone: '(555) 0125', dateSubmitted: '2025-01-13' }
];

const mockHospitals = [
  { id: '1', name: 'City General Hospital', status: 'approved', contact: 'Dr. John Smith', phone: '(555) 0101', email: 'admin@citygeneral.com' },
  { id: '2', name: 'University Medical Center', status: 'approved', contact: 'Dr. Lisa Wang', phone: '(555) 0102', email: 'contact@umc.edu' },
  { id: '3', name: 'Emergency Care Clinic', status: 'suspended', contact: 'Dr. Robert Brown', phone: '(555) 0103', email: 'info@emergencycare.com' },
  { id: '4', name: 'Children\'s Hospital', status: 'approved', contact: 'Dr. Maria Garcia', phone: '(555) 0104', email: 'admin@childrenshospital.org' }
];

const mockUsers = [
  { id: '1', name: 'John Smith', email: 'john.smith@email.com', role: 'donor', status: 'active', joinDate: '2024-12-01' },
  { id: '2', name: 'Emily Davis', email: 'emily.davis@email.com', role: 'recipient', status: 'active', joinDate: '2024-11-15' },
  { id: '3', name: 'Michael Johnson', email: 'michael.j@email.com', role: 'donor', status: 'flagged', joinDate: '2024-10-20' },
  { id: '4', name: 'Sarah Wilson', email: 'sarah.wilson@email.com', role: 'donor', status: 'active', joinDate: '2024-09-05' }
];

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'verifications', label: 'Verifications', icon: ShieldCheck },
    { id: 'hospitals', label: 'Hospital Management', icon: Building2 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      active: 'bg-green-100 text-green-800',
      flagged: 'bg-orange-100 text-orange-800'
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  const handleApproveHospital = (hospitalId: string) => {
    console.log('Approving hospital:', hospitalId);
    // Here you would update the hospital status in Supabase
  };

  const handleRejectHospital = (hospitalId: string) => {
    console.log('Rejecting hospital:', hospitalId);
    // Here you would update the hospital status in Supabase
  };

  const handleSuspendHospital = (hospitalId: string) => {
    console.log('Suspending hospital:', hospitalId);
    // Here you would update the hospital status in Supabase
  };

  const handleSuspendUser = (userId: string) => {
    console.log('Suspending user:', userId);
    // Here you would update the user status in Supabase
  };

  const filteredHospitals = mockHospitals.filter(hospital => 
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-2 rounded-lg">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">LifeLink Admin</h2>
                  <p className="text-xs text-gray-500">Blood Donation Platform</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8 p-0"
            >
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                className={`w-full justify-start ${!sidebarOpen && 'px-2'}`}
                onClick={() => setActiveSection(item.id)}
              >
                <Icon className="h-4 w-4" />
                {sidebarOpen && <span className="ml-2">{item.label}</span>}
              </Button>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          {sidebarOpen && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
              <Button variant="outline" size="sm" onClick={onLogout} className="w-full">
                Sign Out
              </Button>
            </div>
          )}
          {!sidebarOpen && (
            <Button variant="outline" size="sm" onClick={onLogout} className="w-full p-2">
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Dashboard Overview */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-600">Monitor platform activity and key metrics</p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Hospitals</CardTitle>
                    <Building2 className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockMetrics.totalHospitals}</div>
                    <p className="text-xs text-muted-foreground">+2 from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockMetrics.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">+12% from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Donors</CardTitle>
                    <Heart className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockMetrics.activeDonors}</div>
                    <p className="text-xs text-muted-foreground">+8% from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
                    <Activity className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockMetrics.activeRequests}</div>
                    <p className="text-xs text-muted-foreground">-5% from last month</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Blood Donations Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={mockChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="donations" stroke="#dc2626" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={mockChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="users" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Verifications */}
          {activeSection === 'verifications' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Verification Management</h1>
                <p className="text-gray-600">Review and approve pending hospital applications</p>
              </div>

              <Tabs defaultValue="hospitals" className="w-full">
                <TabsList>
                  <TabsTrigger value="hospitals">Pending Hospitals</TabsTrigger>
                  <TabsTrigger value="users">Flagged Users</TabsTrigger>
                </TabsList>

                <TabsContent value="hospitals" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pending Hospital Applications</CardTitle>
                      <CardDescription>Review and approve hospital registrations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Hospital Name</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Contact Person</TableHead>
                            <TableHead>Date Submitted</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockPendingHospitals.map((hospital) => (
                            <TableRow key={hospital.id}>
                              <TableCell className="font-medium">{hospital.name}</TableCell>
                              <TableCell>{hospital.address}</TableCell>
                              <TableCell>{hospital.contact}</TableCell>
                              <TableCell>{hospital.dateSubmitted}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4 mr-1" />
                                        Review
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Hospital Application Review</DialogTitle>
                                        <DialogDescription>
                                          Review the details of {hospital.name}
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label className="text-right">Name:</Label>
                                          <span className="col-span-3">{hospital.name}</span>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label className="text-right">Address:</Label>
                                          <span className="col-span-3">{hospital.address}</span>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label className="text-right">Contact:</Label>
                                          <span className="col-span-3">{hospital.contact}</span>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label className="text-right">Email:</Label>
                                          <span className="col-span-3">{hospital.email}</span>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label className="text-right">Phone:</Label>
                                          <span className="col-span-3">{hospital.phone}</span>
                                        </div>
                                      </div>
                                      <DialogFooter>
                                        <Button variant="outline" onClick={() => handleRejectHospital(hospital.id)}>
                                          <XCircle className="h-4 w-4 mr-2" />
                                          Reject
                                        </Button>
                                        <Button onClick={() => handleApproveHospital(hospital.id)}>
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Approve
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Flagged Users</CardTitle>
                      <CardDescription>Review users that have been flagged for suspicious activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No flagged users at this time</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Hospital Management */}
          {activeSection === 'hospitals' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Hospital Management</h1>
                  <p className="text-gray-600">Manage all registered hospitals</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search hospitals..."
                      className="pl-10 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hospital Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Primary Contact</TableHead>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHospitals.map((hospital) => (
                        <TableRow key={hospital.id}>
                          <TableCell className="font-medium">{hospital.name}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(hospital.status)}>
                              {hospital.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{hospital.contact}</TableCell>
                          <TableCell>{hospital.phone}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              {hospital.status !== 'suspended' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleSuspendHospital(hospital.id)}
                                >
                                  <UserX className="h-4 w-4 mr-1" />
                                  Suspend
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* User Management */}
          {activeSection === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                  <p className="text-gray-600">Manage individual users (donors and recipients)</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      className="pl-10 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(user.status)}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.joinDate}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View Profile
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              {user.status !== 'suspended' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleSuspendUser(user.id)}
                                >
                                  <UserX className="h-4 w-4 mr-1" />
                                  Suspend
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* System Settings */}
          {activeSection === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
                <p className="text-gray-600">Configure platform settings and preferences</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Configuration</CardTitle>
                    <CardDescription>Manage general platform settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="platform-name">Platform Name</Label>
                      <Input id="platform-name" defaultValue="LifeLink Blood Donation Platform" />
                    </div>
                    <div>
                      <Label htmlFor="admin-email">Admin Email</Label>
                      <Input id="admin-email" type="email" defaultValue="admin@lifelink.com" />
                    </div>
                    <div>
                      <Label htmlFor="max-distance">Maximum Matching Distance (km)</Label>
                      <Input id="max-distance" type="number" defaultValue="50" />
                    </div>
                    <Button>Save Settings</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Configure alert and notification preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="alert-frequency">Alert Frequency (minutes)</Label>
                      <Input id="alert-frequency" type="number" defaultValue="15" />
                    </div>
                    <div>
                      <Label htmlFor="sms-provider">SMS Provider</Label>
                      <Input id="sms-provider" defaultValue="Twilio" />
                    </div>
                    <div>
                      <Label htmlFor="email-provider">Email Provider</Label>
                      <Input id="email-provider" defaultValue="SendGrid" />
                    </div>
                    <Button>Update Notifications</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage platform security configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                      <Input id="session-timeout" type="number" defaultValue="8" />
                    </div>
                    <div>
                      <Label htmlFor="password-policy">Minimum Password Length</Label>
                      <Input id="password-policy" type="number" defaultValue="8" />
                    </div>
                    <div>
                      <Label htmlFor="login-attempts">Max Login Attempts</Label>
                      <Input id="login-attempts" type="number" defaultValue="5" />
                    </div>
                    <Button>Apply Security Settings</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>Manage data retention and backup settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="data-retention">Data Retention Period (months)</Label>
                      <Input id="data-retention" type="number" defaultValue="24" />
                    </div>
                    <div>
                      <Label htmlFor="backup-frequency">Backup Frequency</Label>
                      <Input id="backup-frequency" defaultValue="Daily" />
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline">Export Data</Button>
                      <Button variant="outline">Run Backup</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}