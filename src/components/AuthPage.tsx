import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Heart, 
  Shield, 
  Users, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Phone, 
  MapPin, 
  Building2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { User, UserRole } from '../types';
import { supabaseApi } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  phone?: string;
  role?: string;
  hospitalName?: string;
}

const ROLE_DESCRIPTIONS = {
  hospital_staff: {
    title: 'Hospital Staff',
    description: 'Manage donors, recipients, and coordinate organ/blood donations',
    icon: Building2,
    badge: 'Healthcare Provider'
  },
  donor: {
    title: 'Donor',
    description: 'Register as a donor and respond to donation requests',
    icon: Heart,
    badge: 'Life Saver'
  },
  recipient: {
    title: 'Recipient',
    description: 'Find compatible donors and track your medical needs',
    icon: Users,
    badge: 'Patient'
  }
};

export default function AuthPage({ onLogin }: AuthPageProps) {
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
    phone: '',
    role: '' as UserRole,
    hospitalName: '',
    agreeToTerms: false
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateSignUp = (): boolean => {
    const errors: FormErrors = {};
    
    if (!signUpData.fullName.trim()) {
      errors.fullName = 'Full name is required';
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
    
    if (!signUpData.role) {
      errors.role = 'Please select your role';
    }
    
    if (signUpData.role === 'hospital_staff' && !signUpData.hospitalName.trim()) {
      errors.hospitalName = 'Hospital name is required for staff members';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await supabaseApi.signIn(signInData.email, signInData.password);
      
      // Transform Supabase user to our User type
      const transformedUser: User = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || '',
        role: user.user_metadata?.role || 'individual',
        hospitalId: user.user_metadata?.hospital_id,
        createdAt: user.created_at || new Date().toISOString()
      };
      
      onLogin(transformedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
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
        fullName: signUpData.fullName,
        phone: signUpData.phone,
        role: signUpData.role,
        hospitalName: signUpData.hospitalName,
        hospitalId: signUpData.role === 'hospital_staff' ? `h_${Date.now()}` : undefined
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
        phone: '',
        role: '' as UserRole,
        hospitalName: '',
        agreeToTerms: false
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const demoLogins = [
    { email: 'staff@citygeneral.com', password: 'demo123', role: 'Hospital Staff', color: 'blue' },
    { email: 'john.smith@email.com', password: 'demo123', role: 'Donor', color: 'green' },
    { email: 'emily.davis@email.com', password: 'demo123', role: 'Recipient', color: 'purple' }
  ];

  const handleDemoLogin = async (demoData: typeof demoLogins[0]) => {
    setSignInData({ email: demoData.email, password: demoData.password });
    setError('');
    
    // Auto-login with demo credentials
    setLoading(true);
    try {
      const user = await supabaseApi.signIn(demoData.email, demoData.password);
      
      const transformedUser: User = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || '',
        role: user.user_metadata?.role || 'individual',
        hospitalId: user.user_metadata?.hospital_id,
        createdAt: user.created_at || new Date().toISOString()
      };
      
      onLogin(transformedUser);
    } catch (err) {
      // If demo account doesn't exist, try to create it first
      if (err instanceof Error && err.message.includes('Invalid login credentials')) {
        try {
          // Initialize demo accounts
          await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8be7e5d1/init-demo`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
            }
          });
          
          // Try login again
          const user = await supabaseApi.signIn(demoData.email, demoData.password);
          const transformedUser: User = {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || '',
            role: user.user_metadata?.role || 'individual',
            hospitalId: user.user_metadata?.hospital_id,
            createdAt: user.created_at || new Date().toISOString()
          };
          
          onLogin(transformedUser);
        } catch (initError) {
          setError('Demo accounts are being set up. Please try again in a moment.');
        }
      } else {
        setError(err instanceof Error ? err.message : 'Demo login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl grid lg:grid-cols-5 gap-8 items-start lg:items-center">
        {/* Left side - Hero Section */}
        <div className="lg:col-span-3 space-y-6 lg:space-y-8 order-2 lg:order-1">
          {/* Brand Header */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-4 mb-4 lg:mb-6">
              <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-3 lg:p-4 rounded-xl lg:rounded-2xl shadow-lg">
                <Heart className="h-8 w-8 lg:h-10 lg:w-10" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  LifeLink
                </h1>
                <p className="text-gray-600 text-base lg:text-lg">Organ & Blood Donation Platform</p>
              </div>
            </div>
            
            <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-3 lg:mb-4">
              Connecting Lives,<br />
              <span className="text-red-600">Saving Futures</span>
            </h2>
            
            <p className="text-lg lg:text-xl text-gray-600 mb-6 lg:mb-8 max-w-2xl">
              Join our comprehensive platform that connects donors, recipients, and healthcare providers 
              to save lives through efficient organ and blood donation management.
            </p>
          </div>

          {/* Hero Image - Hidden on mobile to save space */}
          <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl lg:shadow-2xl max-w-2xl mx-auto lg:mx-0 hidden md:block">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1697192156499-d85cfe1452c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwaGVhbHRoY2FyZSUyMGRvbmF0aW9ufGVufDF8fHx8MTc1NjA1NzczNHww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Medical professionals in a hospital setting"
              className="w-full h-60 lg:h-72 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 max-w-2xl mx-auto lg:mx-0">
            <div className="flex flex-col items-center text-center p-4 lg:p-6 bg-white rounded-lg lg:rounded-xl shadow-md lg:shadow-lg border border-gray-100">
              <div className="bg-red-100 text-red-600 p-2 lg:p-3 rounded-full mb-3 lg:mb-4">
                <Shield className="h-5 w-5 lg:h-6 lg:w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm lg:text-base">Secure & Compliant</h3>
              <p className="text-gray-600 text-xs lg:text-sm">HIPAA-compliant medical data handling with enterprise-grade security</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 lg:p-6 bg-white rounded-lg lg:rounded-xl shadow-md lg:shadow-lg border border-gray-100">
              <div className="bg-blue-100 text-blue-600 p-2 lg:p-3 rounded-full mb-3 lg:mb-4">
                <Users className="h-5 w-5 lg:h-6 lg:w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm lg:text-base">Real-time Matching</h3>
              <p className="text-gray-600 text-xs lg:text-sm">Advanced algorithms for donor-recipient compatibility matching</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 lg:p-6 bg-white rounded-lg lg:rounded-xl shadow-md lg:shadow-lg border border-gray-100 md:col-span-1">
              <div className="bg-green-100 text-green-600 p-2 lg:p-3 rounded-full mb-3 lg:mb-4">
                <Heart className="h-5 w-5 lg:h-6 lg:w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm lg:text-base">Life-saving Network</h3>
              <p className="text-gray-600 text-xs lg:text-sm">Connect with hospitals and save lives in your community</p>
            </div>
          </div>
        </div>

        {/* Right side - Auth Forms */}
        <div className="lg:col-span-2 flex justify-center order-1 lg:order-2 w-full">
          <Card className="w-full max-w-lg lg:shadow-2xl border-0 lg:border bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-4 px-4 lg:px-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-2 rounded-lg">
                  <Lock className="h-4 w-4 lg:h-5 lg:w-5" />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 px-4 lg:px-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 lg:mb-6">
                  <TabsTrigger value="signin" className="text-sm">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" className="text-sm">Sign Up</TabsTrigger>
                </TabsList>

                {/* Sign In Tab */}
                <TabsContent value="signin" className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Welcome Back</h3>
                    <p className="text-gray-600 text-sm">Access your account to continue saving lives</p>
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
                          placeholder="Enter your email"
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

                  {/* Demo Accounts */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3 font-medium">Try Demo Accounts:</p>
                    <div className="space-y-2">
                      {demoLogins.map((demo, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full justify-between text-left hover:bg-gray-50"
                          onClick={() => handleDemoLogin(demo)}
                          disabled={loading}
                        >
                          <div className="flex items-center">
                            <Badge variant="secondary" className="mr-2 text-xs">
                              {demo.role}
                            </Badge>
                            <span className="text-sm">{demo.email}</span>
                          </div>
                          <span className="text-xs text-gray-400">Click to fill</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Sign Up Tab */}
                <TabsContent value="signup" className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Join LifeLink</h3>
                    <p className="text-gray-600 text-sm">Create your account and start making a difference</p>
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-4">
                    {/* Role Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="role">I am a...</Label>
                      <Select
                        value={signUpData.role}
                        onValueChange={(value) => setSignUpData({ ...signUpData, role: value as UserRole })}
                      >
                        <SelectTrigger className={formErrors.role ? 'border-red-300' : ''}>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLE_DESCRIPTIONS).map(([key, role]) => {
                            const Icon = role.icon;
                            return (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center space-x-3">
                                  <Icon className="h-4 w-4" />
                                  <div>
                                    <div className="font-medium">{role.title}</div>
                                    <div className="text-xs text-gray-500">{role.description}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {formErrors.role && <p className="text-red-500 text-xs">{formErrors.role}</p>}
                    </div>

                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="fullName"
                          placeholder="Enter your full name"
                          className={`pl-10 ${formErrors.fullName ? 'border-red-300' : ''}`}
                          value={signUpData.fullName}
                          onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                        />
                      </div>
                      {formErrors.fullName && <p className="text-red-500 text-xs">{formErrors.fullName}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          className={`pl-10 ${formErrors.email ? 'border-red-300' : ''}`}
                          value={signUpData.email}
                          onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        />
                      </div>
                      {formErrors.email && <p className="text-red-500 text-xs">{formErrors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          className={`pl-10 ${formErrors.phone ? 'border-red-300' : ''}`}
                          value={signUpData.phone}
                          onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                        />
                      </div>
                      {formErrors.phone && <p className="text-red-500 text-xs">{formErrors.phone}</p>}
                    </div>

                    {/* Hospital Name (conditional) */}
                    {signUpData.role === 'hospital_staff' && (
                      <div className="space-y-2">
                        <Label htmlFor="hospitalName">Hospital Name</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="hospitalName"
                            placeholder="Enter your hospital name"
                            className={`pl-10 ${formErrors.hospitalName ? 'border-red-300' : ''}`}
                            value={signUpData.hospitalName}
                            onChange={(e) => setSignUpData({ ...signUpData, hospitalName: e.target.value })}
                          />
                        </div>
                        {formErrors.hospitalName && <p className="text-red-500 text-xs">{formErrors.hospitalName}</p>}
                      </div>
                    )}

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password"
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

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="confirm-password"
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

                    {/* Terms and Conditions */}
                    <div className="flex items-start space-x-3 py-2">
                      <Checkbox
                        id="terms"
                        checked={signUpData.agreeToTerms}
                        onCheckedChange={(checked) => 
                          setSignUpData({ ...signUpData, agreeToTerms: checked as boolean })
                        }
                      />
                      <Label htmlFor="terms" className="text-sm leading-5">
                        I agree to the{' '}
                        <a href="#" className="text-red-600 hover:underline">Terms of Service</a>{' '}
                        and{' '}
                        <a href="#" className="text-red-600 hover:underline">Privacy Policy</a>.
                        I understand that my medical information will be handled according to HIPAA guidelines.
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
                      className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg"
                      disabled={loading || !signUpData.agreeToTerms}
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

              {/* Security Notice */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <Shield className="h-3 w-3" />
                  <span>Secured with 256-bit SSL encryption</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}