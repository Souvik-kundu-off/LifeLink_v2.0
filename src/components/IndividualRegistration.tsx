import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { 
  Heart, 
  Shield, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Phone, 
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Droplets
} from 'lucide-react';
import { User, BloodGroup } from '../types';
import { supabaseApi } from '../utils/supabase/client';
import { getDemoUser, isDemoCredentials } from '../utils/demoAuth';

interface IndividualRegistrationProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  age?: string;
  phone?: string;
  address?: string;
  bloodGroup?: string;
}

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function IndividualRegistration({ onLogin, onBack }: IndividualRegistrationProps) {
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
    fullName: '',
    age: '',
    phone: '',
    address: '',
    bloodGroup: '' as BloodGroup,
    medicalHistory: '',
    
    // Donor preferences
    availableForBloodDonation: false,
    
    // Recipient needs
    needsBloodDonation: false,
    
    agreeToTerms: false
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateSignUp = (): boolean => {
    const errors: FormErrors = {};
    
    if (!signUpData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!signUpData.age || parseInt(signUpData.age) < 18 || parseInt(signUpData.age) > 100) {
      errors.age = 'Age must be between 18 and 100';
    }
    
    if (!signUpData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!signUpData.password) {
      errors.password = 'Password is required';
    } else if (signUpData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (signUpData.password !== signUpData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!signUpData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    
    if (!signUpData.address.trim()) {
      errors.address = 'Address is required';
    }
    
    if (!signUpData.bloodGroup) {
      errors.bloodGroup = 'Blood group is required';
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
        if (demoUser && demoUser.role === 'individual') {
          console.log('Using demo individual login');
          onLogin(demoUser);
          return;
        }
      }

      console.log('Attempting individual login with:', signInData.email);
      const user = await supabaseApi.signIn(signInData.email, signInData.password);
      console.log('Supabase login successful, user:', user);
      console.log('User metadata:', user.user_metadata);
      
      // Only check role if it exists and is not empty - allow demo accounts without strict validation
      const userRole = user.user_metadata?.role;
      if (userRole && userRole !== 'individual' && userRole !== '') {
        throw new Error(`Access denied. This account is registered as '${userRole}', not individual user.`);
      }
      
      const transformedUser: User = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || '',
        role: user.user_metadata?.role || 'individual',
        hospitalId: user.user_metadata?.hospital_id,
        createdAt: user.created_at || new Date().toISOString()
      };
      
      console.log('Transformed user for login:', transformedUser);
      onLogin(transformedUser);
    } catch (err) {
      console.error('Individual login error:', err);
      
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError('Backend server unavailable. Please use demo credentials: john.smith@email.com / demo123 or emily.davis@email.com / demo123');
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

    if (!signUpData.availableForBloodDonation && !signUpData.needsBloodDonation) {
      setError('Please select at least one option: available for blood donation or need blood donation');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await supabaseApi.signUp({
        email: signUpData.email,
        password: signUpData.password,
        fullName: signUpData.fullName,
        phone: signUpData.phone,
        role: 'individual'
      });
      
      setSuccess('Account created successfully! Please sign in with your credentials.');
      setActiveTab('signin');
      setSignInData({ email: signUpData.email, password: '' });
      
      // Reset form
      setSignUpData({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        age: '',
        phone: '',
        address: '',
        bloodGroup: '' as BloodGroup,
        medicalHistory: '',
        availableForBloodDonation: false,
        needsBloodDonation: false,
        agreeToTerms: false
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const demoLogins = [
    { email: 'john.smith@email.com', password: 'demo123', role: 'Donor' },
    { email: 'emily.davis@email.com', password: 'demo123', role: 'Recipient' }
  ];

  const handleDemoLogin = async (demoData: typeof demoLogins[0]) => {
    try {
      setLoading(true);
      setError('');
      
      // Try to login directly with demo account
      console.log('Direct demo login attempt for:', demoData.email);
      const user = await supabaseApi.signIn(demoData.email, demoData.password);
      console.log('Demo login successful, user:', user);
      
      const transformedUser: User = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || demoData.email.split('@')[0],
        role: 'individual', // Force the role for demo
        hospitalId: user.user_metadata?.hospital_id,
        createdAt: user.created_at || new Date().toISOString()
      };
      
      console.log('Demo user transformed:', transformedUser);
      onLogin(transformedUser);
    } catch (err) {
      console.error('Demo login failed:', err);
      
      // Instead of showing confusing fallback message, show proper error and try form submission
      setSignInData({ email: demoData.email, password: demoData.password });
      
      // Automatically try form submission after filling the form
      setTimeout(async () => {
        try {
          console.log('Attempting form submission for demo account');
          const user = await supabaseApi.signIn(demoData.email, demoData.password);
          
          const transformedUser: User = {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || demoData.email.split('@')[0],
            role: 'individual',
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-3 rounded-xl shadow-lg">
                <Heart className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  Individual Portal
                </h1>
                <p className="text-gray-600">Donor & Recipient Access</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="register">Create Account</TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin" className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Welcome Back</h3>
                  <p className="text-gray-600">Access your donation and recipient dashboard</p>
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
                    <Label htmlFor="signin-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
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
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                {/* Demo Accounts Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-medium text-red-900 mb-2 flex items-center">
                      <Heart className="h-4 w-4 mr-2" />
                      Try Demo Accounts
                    </h4>
                    <p className="text-sm text-red-700 mb-3">
                      Experience donor and recipient dashboards with sample profiles
                    </p>
                    <div className="space-y-2">
                      {demoLogins.map((demo, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full justify-between text-left hover:bg-red-100 border-red-300"
                          onClick={() => handleDemoLogin(demo)}
                          disabled={loading}
                        >
                          <div className="flex items-center">
                            <Badge variant="secondary" className="mr-2 text-xs bg-red-200 text-red-800">
                              Demo {demo.role}
                            </Badge>
                            <span className="text-sm font-medium">{demo.email}</span>
                          </div>
                          <span className="text-xs text-red-600 font-medium">
                            {loading ? 'Logging in...' : 'Click to login'}
                          </span>
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-red-600 mt-2">
                      Password: demo123 • Includes donation history and profile data
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Registration Tab */}
              <TabsContent value="register" className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Join Our Community</h3>
                  <p className="text-gray-600">Create your donor and recipient profile</p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <UserIcon className="h-4 w-4 mr-2" />
                      Personal Information
                    </h4>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          placeholder="John Smith"
                          className={formErrors.fullName ? 'border-red-300' : ''}
                          value={signUpData.fullName}
                          onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                        />
                        {formErrors.fullName && <p className="text-red-500 text-xs">{formErrors.fullName}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="age">Age *</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="age"
                            type="number"
                            placeholder="25"
                            className={`pl-10 ${formErrors.age ? 'border-red-300' : ''}`}
                            value={signUpData.age}
                            onChange={(e) => setSignUpData({ ...signUpData, age: e.target.value })}
                            min="18"
                            max="100"
                          />
                        </div>
                        {formErrors.age && <p className="text-red-500 text-xs">{formErrors.age}</p>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
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

                    <div className="space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                        <Textarea
                          id="address"
                          placeholder="123 Main Street, City, State, ZIP"
                          className={`pl-10 resize-none ${formErrors.address ? 'border-red-300' : ''}`}
                          rows={2}
                          value={signUpData.address}
                          onChange={(e) => setSignUpData({ ...signUpData, address: e.target.value })}
                        />
                      </div>
                      {formErrors.address && <p className="text-red-500 text-xs">{formErrors.address}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bloodGroup">Blood Group *</Label>
                      <Select
                        value={signUpData.bloodGroup}
                        onValueChange={(value) => setSignUpData({ ...signUpData, bloodGroup: value as BloodGroup })}
                      >
                        <SelectTrigger className={formErrors.bloodGroup ? 'border-red-300' : ''}>
                          <SelectValue placeholder="Select your blood group" />
                        </SelectTrigger>
                        <SelectContent>
                          {BLOOD_GROUPS.map(group => (
                            <SelectItem key={group} value={group}>
                              <div className="flex items-center space-x-2">
                                <Droplets className="h-4 w-4 text-red-500" />
                                <span>{group}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.bloodGroup && <p className="text-red-500 text-xs">{formErrors.bloodGroup}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="medicalHistory">Medical History (Optional)</Label>
                      <Textarea
                        id="medicalHistory"
                        placeholder="Any relevant medical conditions, allergies, or previous surgeries..."
                        className="resize-none"
                        rows={3}
                        value={signUpData.medicalHistory}
                        onChange={(e) => setSignUpData({ ...signUpData, medicalHistory: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Blood Donation Preferences */}
                  <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 flex items-center">
                      <Droplets className="h-4 w-4 mr-2" />
                      Blood Donation Options
                    </h4>
                    
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="availableForBloodDonation"
                        checked={signUpData.availableForBloodDonation}
                        onCheckedChange={(checked) => 
                          setSignUpData({ ...signUpData, availableForBloodDonation: checked as boolean })
                        }
                      />
                      <Label htmlFor="availableForBloodDonation" className="flex items-center">
                        <Heart className="h-4 w-4 mr-2 text-green-600" />
                        I am available for blood donation
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="needsBloodDonation"
                        checked={signUpData.needsBloodDonation}
                        onCheckedChange={(checked) => 
                          setSignUpData({ ...signUpData, needsBloodDonation: checked as boolean })
                        }
                      />
                      <Label htmlFor="needsBloodDonation" className="flex items-center">
                        <Heart className="h-4 w-4 mr-2 text-blue-600" />
                        I need blood donation assistance
                      </Label>
                    </div>
                  </div>

                  {/* Password fields */}
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
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
                            placeholder="Create a strong password"
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
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="agreeToTerms"
                      checked={signUpData.agreeToTerms}
                      onCheckedChange={(checked) => 
                        setSignUpData({ ...signUpData, agreeToTerms: checked as boolean })
                      }
                    />
                    <Label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                      I agree to the{' '}
                      <button type="button" className="text-red-600 hover:text-red-700 underline">
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button type="button" className="text-red-600 hover:text-red-700 underline">
                        Privacy Policy
                      </button>
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
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white text-lg py-3 shadow-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}