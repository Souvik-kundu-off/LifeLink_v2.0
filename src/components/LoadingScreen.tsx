import React from 'react';
import { Heart, Shield, Users } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center space-y-8 max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-4">
          <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-4 rounded-2xl shadow-lg animate-pulse">
            <Heart className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              LifeLink
            </h1>
            <p className="text-gray-600 text-lg">Organ & Blood Donation Platform</p>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="relative">
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Initializing secure connection...</p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 gap-4 mt-8">
          <div className="flex items-center space-x-3 text-gray-700 opacity-75">
            <Shield className="h-5 w-5 text-red-600" />
            <span className="text-sm">Loading secure authentication...</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-700 opacity-75">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm">Preparing matching engine...</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-700 opacity-75">
            <Heart className="h-5 w-5 text-green-600" />
            <span className="text-sm">Connecting to life-saving network...</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-gradient-to-r from-red-600 to-pink-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
        </div>
      </div>
    </div>
  );
}