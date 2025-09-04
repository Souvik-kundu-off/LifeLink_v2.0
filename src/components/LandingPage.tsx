import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Heart, 
  Shield, 
  Users, 
  Building2,
  ArrowRight,
  Stethoscope,
  CheckCircle,
  Settings,
  AlertCircle,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { supabaseApi } from '../utils/supabase/client';

interface LandingPageProps {
  onSelectUserType: (type: 'hospital' | 'individual' | 'admin') => void;
}

export default function LandingPage({ onSelectUserType }: LandingPageProps) {
  const [showDemoSetup, setShowDemoSetup] = useState(false);
  const [setupStatus, setSetupStatus] = useState('');
  const [setupError, setSetupError] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [adminInitialized, setAdminInitialized] = useState(false);

  // Initialize admin user on component mount
  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        console.log('Testing admin initialization...');
        
        const result = await supabaseApi.initializeAdmin();
        console.log('Admin initialization result:', result);
        
        if (result && result.success) {
          console.log('Admin initialization successful');
          setAdminInitialized(true);
        } else {
          console.log('Admin initialization completed with result:', result);
          setAdminInitialized(true);
        }
      } catch (error) {
        console.log('Admin initialization handled gracefully, enabling offline/demo mode:', error.message);
        
        // For any error, just mark as initialized and use demo mode
        console.log('Network connectivity issue or server not deployed - running in offline demo mode');
        setSetupStatus('Running in offline demo mode - authentication will use demo accounts and local auth');
        
        // Always mark as initialized to allow login attempts with demo accounts
        setAdminInitialized(true);
      }
    };
    
    // Initialize immediately
    initializeAdmin();
  }, []);

  const initializeDemoAccounts = async () => {
    setSetupLoading(true);
    setSetupError('');
    setSetupStatus('Initializing demo accounts...');

    try {
      // First, test server connectivity
      setSetupStatus('Checking server connection...');
      await supabaseApi.healthCheck();

      // Check existing demo accounts status
      setSetupStatus('Checking existing demo accounts...');
      try {
        const statusResult = await supabaseApi.demoStatus();
        console.log('Demo account status:', statusResult);
        
        const existingAccounts = statusResult.accounts.filter(acc => acc.status === 'exists');
        if (existingAccounts.length > 0) {
          setSetupStatus(`Found ${existingAccounts.length} existing demo accounts. Updating them...`);
        }
      } catch (statusError) {
        console.warn('Could not check demo status:', statusError);
      }

      // Initialize/update demo accounts
      setSetupStatus('Creating/updating demo accounts...');
      const result = await supabaseApi.initializeDemo();
      console.log('Demo initialization result:', result);

      // Wait a moment for accounts to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Test each demo account
      const demoAccounts = [
        { email: 'staff@citygeneral.com', password: 'demo123', type: 'Hospital Staff' },
        { email: 'john.smith@email.com', password: 'demo123', type: 'Donor' },
        { email: 'emily.davis@email.com', password: 'demo123', type: 'Recipient' }
      ];

      setSetupStatus('Testing demo account logins...');
      const testResults = [];

      for (const account of demoAccounts) {
        try {
          const testResult = await supabaseApi.testDemoAccount(account.email, account.password);
          testResults.push({ 
            ...account, 
            success: testResult.success, 
            error: testResult.error 
          });
          console.log(`${account.type} (${account.email}):`, testResult.success ? 'SUCCESS' : 'FAILED');
        } catch (error) {
          testResults.push({ 
            ...account, 
            success: false, 
            error: error.message 
          });
          console.error(`${account.type} test failed:`, error);
        }
      }

      const successCount = testResults.filter(r => r.success).length;
      setSetupStatus(`Demo setup complete! ${successCount}/${testResults.length} accounts working properly.`);
      
      if (successCount < testResults.length) {
        const failures = testResults.filter(r => !r.success);
        setSetupError(`Some accounts failed: ${failures.map(f => `${f.type}: ${f.error}`).join(', ')}`);
        
        // If all failed, suggest waiting and trying again
        if (successCount === 0) {
          setSetupError(`All accounts failed to authenticate. This might be a temporary issue with account creation. Please wait a minute and try the demo buttons on the login pages.`);
        }
      } else {
        // All successful - clear any previous errors
        setSetupError('');
      }

    } catch (error) {
      console.error('Demo initialization failed:', error);
      setSetupError(`Demo setup failed: ${error.message}. The demo accounts might still work - try the login pages directly.`);
      setSetupStatus('');
    } finally {
      setSetupLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
      {/* Offline Mode Banner */}
      {setupStatus.includes('offline') && (
        <div className="bg-yellow-100 border-b border-yellow-200 py-2 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-sm text-yellow-800">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              Demo Mode: Running with sample data - full backend features unavailable
            </p>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          {/* Brand Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-4 rounded-2xl shadow-lg">
                <Heart className="h-12 w-12" />
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  LifeLink
                </h1>
                <p className="text-xl text-gray-600">Blood Donation Platform</p>
              </div>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Connecting Lives,<br />
              <span className="text-red-600">Saving Futures</span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join our comprehensive platform that connects donors, recipients, and healthcare providers 
              to save lives through efficient blood donation management.
            </p>
          </div>

          {/* User Type Selection */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
            {/* Hospital Registration */}
            <Card className="relative overflow-hidden border-2 border-transparent hover:border-blue-200 hover:shadow-2xl transition-all duration-300 group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative z-10 text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 text-blue-600 p-6 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <Building2 className="h-12 w-12" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  Hospital & Healthcare Provider
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Manage donors, recipients, and coordinate life-saving donations
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-6">
                {/* Hero Image */}
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1589104759909-e355f8999f7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwdGVhbSUyMGhvc3BpdGFsJTIwY29sbGFib3JhdGlvbnxlbnwxfHx8fDE3NTYwNTgzNzN8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Medical team collaboration in hospital"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span>Advanced matching algorithms for donor-recipient compatibility</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span>Real-time alert system for urgent donation needs</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span>Comprehensive patient and donor management</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span>HIPAA-compliant medical data security</span>
                  </div>
                </div>

                <Button 
                  onClick={() => onSelectUserType('hospital')}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg py-6 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                >
                  Register as Healthcare Provider
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>

            {/* Individual Registration */}
            <Card className="relative overflow-hidden border-2 border-transparent hover:border-red-200 hover:shadow-2xl transition-all duration-300 group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative z-10 text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="bg-red-100 text-red-600 p-6 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                    <Heart className="h-12 w-12" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  Individual Donor & Recipient
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Save lives by donating or find compatible donors for your needs
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-6">
                {/* Hero Image */}
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1560220604-1985ebfe28b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjB2b2x1bnRlZXJzJTIwaGVscGluZyUyMHBlb3BsZXxlbnwxfHx8fDE3NTYwNTgzNzh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Community volunteers helping people"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <span>Register as both donor and recipient in one account</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <span>Create blood donation requests</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <span>Receive instant alerts for donation opportunities</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <span>Connect with nearby hospitals and other donors</span>
                  </div>
                </div>

                <Button 
                  onClick={() => onSelectUserType('individual')}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white text-lg py-6 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                >
                  Join as Individual
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Demo Notice */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-xl p-8 max-w-4xl mx-auto mb-8">
            <div className="text-center">
              <div className="bg-green-100 text-green-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Experience Our Platform</h3>
              <p className="text-gray-600 mb-4">
                Try our Blood Donation Platform with pre-populated demo accounts - no setup required!
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-700 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Hospital Dashboard with sample donors & recipients</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Individual profiles with donation history</span>
                </div>
              </div>
              
              {/* Demo Setup Section */}
              <div className="border-t border-gray-200 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDemoSetup(!showDemoSetup)}
                  className="mb-4"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Demo Setup & Troubleshooting
                </Button>
                
                {showDemoSetup && (
                  <div className="bg-white rounded-lg p-6 text-left">
                    <h4 className="font-semibold mb-4">Demo Account Setup</h4>
                    
                    {setupStatus && (
                      <Alert className="mb-4 border-blue-200 bg-blue-50">
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-700">{setupStatus}</AlertDescription>
                      </Alert>
                    )}
                    
                    {setupError && (
                      <Alert className="mb-4 border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-700">{setupError}</AlertDescription>
                      </Alert>
                    )}
                    
                    <p className="text-gray-600 text-sm mb-4">
                      If you're having trouble with demo accounts, click below to reinitialize them:
                    </p>
                    
                    <Button 
                      onClick={initializeDemoAccounts}
                      disabled={setupLoading}
                      className="w-full"
                    >
                      {setupLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Setting up demo accounts...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Initialize Demo Accounts
                        </>
                      )}
                    </Button>
                    
                    <div className="mt-4 text-xs text-gray-500">
                      <p><strong>Demo Accounts:</strong></p>
                      <p>• Hospital: staff@citygeneral.com (password: demo123)</p>
                      <p>• Donor: john.smith@email.com (password: demo123)</p>
                      <p>• Recipient: emily.davis@email.com (password: demo123)</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Trusted by Healthcare Professionals</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-green-100 text-green-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">HIPAA Compliant</h4>
                <p className="text-gray-600">Enterprise-grade security for medical data protection</p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 text-blue-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="h-8 w-8" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Medical Grade</h4>
                <p className="text-gray-600">Built with healthcare professionals for accurate matching</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 text-purple-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Community Driven</h4>
                <p className="text-gray-600">Connecting communities to save lives together</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer with Admin Login */}
      <footer className="bg-gray-100 border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p className="mb-4">© 2025 LifeLink Blood Donation Platform. All rights reserved.</p>
            <div className="flex items-center justify-center space-x-4">
              <button 
                onClick={() => onSelectUserType('admin')}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Admin Login
              </button>
              {adminInitialized && (
                <span className="text-xs text-green-600 flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Admin Ready</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}