import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { 
  Heart, 
  Shield, 
  Building2,
  Mail, 
  Lock, 
  User as UserIcon, 
  Phone, 
  MapPin,
  FileText,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Upload
} from 'lucide-react';
import { User } from '../types';
import { supabaseApi } from '../utils/supabase/client';
import { getDemoUser, isDemoCredentials } from '../utils/demoAuth';

interface HospitalRegistrationProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  contactPersonName?: string;
  hospitalName?: string;
  phone?: string;
  address?: string;
  licenseNumber?: string;
  description?: string;
}

export default function HospitalRegistration({ onLogin, onBack }: HospitalRegistrationProps) {
  const [activeTab, setActiveTab] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });
  
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    contactPersonName: '',
    hospitalName: '',
    phone: '',
    address: '',
    licenseNumber: '',
    description: '',
    agreeToTerms: false
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateSignUp = (): boolean => {
    const errors: FormErrors = {};
    
    if (!signUpData.contactPersonName.trim()) {
      errors.contactPersonName = 'Contact person name is required';
    }
    
    if (!signUpData.hospitalName.trim()) {
      errors.hospitalName = 'Hospital name is required';
    }
    
    if (!signUpData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!signUpData.password) {
      errors.password = 'Password is required';
    } else if (signUpData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (signUpData.password !== signUpData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!signUpData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    
    if (!signUpData.address.trim()) {
      errors.address = 'Hospital address is required';
    }
    
    if (!signUpData.licenseNumber.trim()) {
      errors.licenseNumber = 'Medical license number is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Try demo authentication first
      if (isDemoCredentials(signInData.email, signInData.password)) {
        const demoUser = getDemoUser(signInData.email, signInData.password);
        if (demoUser && demoUser.role === 'hospital_staff') {
          console.log('Using demo hospital login');
          onLogin(demoUser);
          return;
        }
      }

      console.log('Attempting hospital login with:', signInData.email);
      const user = await supabaseApi.signIn(signInData.email, signInData.password);
      console.log('Supabase login successful, user:', user);
      console.log('User metadata:', user.user_metadata);
      
      // Only check role if it exists and is not empty - allow demo accounts without strict validation
      const userRole = user.user_metadata?.role;
      if (userRole && userRole !== 'hospital_staff' && userRole !== '') {
        throw new Error(`Access denied. This account is registered as '${userRole}', not hospital staff.`);
      }
      
      const transformedUser: User = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || '',
        role: user.user_metadata?.role || 'hospital_staff',
        hospitalId: user.user_metadata?.hospital_id,
        createdAt: user.created_at || new Date().toISOString()
      };
      
      console.log('Transformed user for login:', transformedUser);
      onLogin(transformedUser);
    } catch (err) {
      console.error('Hospital login error:', err);
      
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError('Backend server unavailable. Please use demo credentials: staff@citygeneral.com / demo123');
      } else {
        setError(err instanceof Error ? err.message : 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignUp()) return;
    
    if (!signUpData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await supabaseApi.signUp({
        email: signUpData.email,
        password: signUpData.password,
        fullName: signUpData.contactPersonName,
        phone: signUpData.phone,
        role: 'hospital_staff',
        hospitalName: signUpData.hospitalName
      });
      
      setSuccess('Hospital account created successfully! You can now sign in with your credentials.');
      setActiveTab('signin');
      setSignInData({ email: signUpData.email, password: '' });
      
      // Reset form
      setSignUpData({
        email: '',
        password: '',
        confirmPassword: '',
        contactPersonName: '',
        hospitalName: '',
        phone: '',
        address: '',
        licenseNumber: '',
        description: '',
        agreeToTerms: false
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = { email: 'staff@citygeneral.com', password: 'demo123' };

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Try to login directly with demo account
      console.log('Direct demo login attempt for:', demoLogin.email);
      const user = await supabaseApi.signIn(demoLogin.email, demoLogin.password);
      console.log('Demo login successful, user:', user);
      
      const transformedUser: User = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || 'Demo Hospital Staff',
        role: 'hospital_staff', // Force the role for demo
        hospitalId: user.user_metadata?.hospital_id,
        createdAt: user.created_at || new Date().toISOString()
      };
      
      console.log('Demo user transformed:', transformedUser);
      onLogin(transformedUser);
    } catch (err) {
      console.error('Demo login failed:', err);
      
      // Instead of showing confusing fallback message, show proper error and try form submission
      setSignInData({ email: demoLogin.email, password: demoLogin.password });
      
      // Automatically try form submission after filling the form
      setTimeout(async () => {
        try {
          console.log('Attempting form submission for demo account');
          const user = await supabaseApi.signIn(demoLogin.email, demoLogin.password);
          
          const transformedUser: User = {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || 'Demo Hospital Staff',
            role: 'hospital_staff',
            hospitalId: user.user_metadata?.hospital_id,
            createdAt: user.created_at || new Date().toISOString()
          };
          
          onLogin(transformedUser);
        } catch (formErr) {
          console.error('Form submission also failed:', formErr);
          setError(`Demo login failed: ${formErr instanceof Error ? formErr.message : 'Unknown error'}. You can try the form manually or check the demo setup tool on the home page.`);
        }
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-xl shadow-lg">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Hospital Portal
                </h1>
                <p className="text-gray-600">Healthcare Provider Access</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="register">Register Hospital</TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin" className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Welcome Back</h3>
                  <p className="text-gray-600">Access your hospital management dashboard</p>
                </div>

                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Hospital Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="hospital@example.com"
                        className="pl-10"
                        value={signInData.email}
                        onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        className="pl-10 pr-10"
                        value={signInData.password}
                        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Signing in...
                      </>
                    ) : (
                      'Sign In to Dashboard'
                    )}
                  </Button>
                </form>

                {/* Demo Account Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                      <Heart className="h-4 w-4 mr-2" />
                      Try Demo Account
                    </h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Experience the full hospital dashboard with pre-populated demo data
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between text-left hover:bg-blue-100 border-blue-300"
                      onClick={handleDemoLogin}
                      disabled={loading}
                    >
                      <div className="flex items-center">
                        <Badge variant="secondary" className="mr-2 text-xs bg-blue-200 text-blue-800">
                          Demo Hospital
                        </Badge>
                        <span className="text-sm font-medium">{demoLogin.email}</span>
                      </div>
                      <span className="text-xs text-blue-600 font-medium">
                        {loading ? 'Logging in...' : 'Click to login'}
                      </span>
                    </Button>
                    <p className="text-xs text-blue-600 mt-2">
                      Password: {demoLogin.password} • Includes sample donors, recipients, and alerts
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Registration Tab */}
              <TabsContent value="register" className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Register Your Hospital</h3>
                  <p className="text-gray-600">Join our network of healthcare providers</p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  {/* Hospital Information */}
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 flex items-center">
                      <Building2 className="h-4 w-4 mr-2" />
                      Hospital Information
                    </h4>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hospitalName">Hospital Name *</Label>
                        <Input
                          id="hospitalName"
                          placeholder="General Hospital"
                          className={formErrors.hospitalName ? 'border-red-300' : ''}
                          value={signUpData.hospitalName}
                          onChange={(e) => setSignUpData({ ...signUpData, hospitalName: e.target.value })}
                        />
                        {formErrors.hospitalName && <p className="text-red-500 text-xs">{formErrors.hospitalName}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="licenseNumber">Medical License Number *</Label>
                        <Input
                          id="licenseNumber"
                          placeholder="ML-123456789"
                          className={formErrors.licenseNumber ? 'border-red-300' : ''}
                          value={signUpData.licenseNumber}
                          onChange={(e) => setSignUpData({ ...signUpData, licenseNumber: e.target.value })}
                        />
                        {formErrors.licenseNumber && <p className="text-red-500 text-xs">{formErrors.licenseNumber}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Hospital Address *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                        <Textarea
                          id="address"
                          placeholder="123 Medical Center Drive, City, State, ZIP"
                          className={`pl-10 resize-none ${formErrors.address ? 'border-red-300' : ''}`}
                          rows={2}
                          value={signUpData.address}
                          onChange={(e) => setSignUpData({ ...signUpData, address: e.target.value })}
                        />
                      </div>
                      {formErrors.address && <p className="text-red-500 text-xs">{formErrors.address}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Hospital Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of your hospital and specialties..."
                        className="resize-none"
                        rows={3}
                        value={signUpData.description}
                        onChange={(e) => setSignUpData({ ...signUpData, description: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <UserIcon className="h-4 w-4 mr-2" />
                      Primary Contact Information
                    </h4>

                    <div className="space-y-2">
                      <Label htmlFor="contactPersonName">Contact Person Name *</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="contactPersonName"
                          placeholder="Dr. John Smith"
                          className={`pl-10 ${formErrors.contactPersonName ? 'border-red-300' : ''}`}
                          value={signUpData.contactPersonName}
                          onChange={(e) => setSignUpData({ ...signUpData, contactPersonName: e.target.value })}
                        />
                      </div>
                      {formErrors.contactPersonName && <p className="text-red-500 text-xs">{formErrors.contactPersonName}</p>}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Official Email *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="admin@hospital.com"
                            className={`pl-10 ${formErrors.email ? 'border-red-300' : ''}`}
                            value={signUpData.email}
                            onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                          />
                        </div>
                        {formErrors.email && <p className="text-red-500 text-xs">{formErrors.email}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            className={`pl-10 ${formErrors.phone ? 'border-red-300' : ''}`}
                            value={signUpData.phone}
                            onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                          />
                        </div>
                        {formErrors.phone && <p className="text-red-500 text-xs">{formErrors.phone}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Security */}
                  <div className="space-y-4 p-4 bg-red-50 rounded-lg">
                    <h4 className="font-semibold text-red-900 flex items-center">
                      <Lock className="h-4 w-4 mr-2" />
                      Account Security
                    </h4>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Minimum 8 characters"
                            className={`pl-10 pr-10 ${formErrors.password ? 'border-red-300' : ''}`}
                            value={signUpData.password}
                            onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {formErrors.password && <p className="text-red-500 text-xs">{formErrors.password}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm your password"
                            className={`pl-10 pr-10 ${formErrors.confirmPassword ? 'border-red-300' : ''}`}
                            value={signUpData.confirmPassword}
                            onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {formErrors.confirmPassword && <p className="text-red-500 text-xs">{formErrors.confirmPassword}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-start space-x-3 py-4">
                    <Checkbox
                      id="terms"
                      checked={signUpData.agreeToTerms}
                      onCheckedChange={(checked) => 
                        setSignUpData({ ...signUpData, agreeToTerms: checked as boolean })
                      }
                    />
                    <Label htmlFor="terms" className="text-sm leading-5">
                      I agree to the{' '}
                      <a href="#" className="text-blue-600 hover:underline">Healthcare Provider Agreement</a>,{' '}
                      <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>{' '}
                      and{' '}
                      <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                      I confirm that all provided information is accurate and that our hospital is licensed to operate.
                    </Label>
                  </div>

                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg py-6"
                    disabled={loading || !signUpData.agreeToTerms}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting Application...
                      </>
                    ) : (
                      'Submit Hospital Registration'
                    )}
                  </Button>

                  <div className="text-center text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                    <p className="font-medium text-yellow-800">⚠️ Manual Review Required</p>
                    <p>Hospital registrations are manually reviewed for security and compliance. 
                    You will receive confirmation within 2-3 business days.</p>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            {/* Security Notice */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <Shield className="h-3 w-3" />
                <span>HIPAA-compliant • SOC 2 certified • 256-bit SSL encryption</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}