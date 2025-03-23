'use client'

import * as Clerk from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';
import SpotlightCard from '@/components/effects/SpotlightCard';
import React, { useState, ChangeEvent, ReactElement } from 'react';
import Image from 'next/image';

export default function SignInPage(): ReactElement {
  const [identifier, setIdentifier] = useState<string>('');

  const handleIdentifierChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setIdentifier(e.target.value);
  };

  return (
    <div className="min-h-screen flex bg-black">
      {/* Left side with sign-in component */}
      <div className="w-1/2 flex flex-col items-center justify-center p-8">
        <div className="relative w-full max-w-md">
          {/* Black overlay with 40% transparency */}
          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl"></div>
          
          <SpotlightCard 
            spotlightColor="rgba(111, 45, 168, 0.4)"
            className="w-full relative z-10"
          >
            <SignIn.Root>
              <SignIn.Step
                name="start"
                className="py-10 px-8 space-y-6"
              >
                <div className="space-y-2 text-center">
                  <h2 className="text-xl font-semibold text-white">Sign in to therapyAi</h2>
                  <p className="text-sm text-gray-400">Welcome back! Please sign in to continue</p>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4">
                  <Clerk.Connection
                    name="google"
                    className="flex items-center gap-x-3 justify-center font-medium border border-gray-700 hover:bg-gray-800 transition-colors text-white py-2 px-4 rounded-lg"
                  >
                    <Clerk.Icon className="size-4" />
                    Google
                  </Clerk.Connection>
                  
                  <Clerk.Connection
                    name="facebook"
                    className="flex items-center gap-x-3 justify-center font-medium border border-gray-700 hover:bg-gray-800 transition-colors text-white py-2 px-4 rounded-lg"
                  >
                    <Clerk.Icon className="size-4" />
                    Facebook
                  </Clerk.Connection>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-neutral-900 text-gray-400">or</span>
                  </div>
                </div>

                <Clerk.Field name="identifier" className="space-y-2">
                  <Clerk.Label className="text-sm font-medium text-gray-300">
                    Email address
                  </Clerk.Label>
                  <Clerk.Input 
                    className="w-full bg-neutral-800 border-gray-700 text-white rounded-lg py-2 px-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter email"
                    value={identifier}
                    onChange={handleIdentifierChange}
                  />
                  <Clerk.FieldError className="text-red-400 text-sm" />
                </Clerk.Field>

                <SignIn.Action 
                  submit 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg py-2 px-4 transition-colors"
                >
                  Continue
                </SignIn.Action>

                <p className="text-center text-sm text-gray-400">
                  Don't have an account?{' '}
                  <a href="/sign-up" className="text-purple-400 hover:text-purple-300">Sign up</a>
                </p>
              </SignIn.Step>

              <SignIn.Step name="verifications" className="py-10 px-8 space-y-6">
                <Clerk.Field name="code" className="space-y-2">
                  <Clerk.Label className="text-sm font-medium text-gray-300">
                    Enter the verification code
                  </Clerk.Label>
                  <Clerk.Input 
                    className="w-full bg-neutral-800 border-gray-700 text-white rounded-lg py-2 px-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                    placeholder="Enter verification code"
                  />
                  <Clerk.FieldError className="text-red-400 text-sm" />
                </Clerk.Field>
                
                <SignIn.Action 
                  submit 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg py-2 px-4 transition-colors"
                >
                  Verify
                </SignIn.Action>
              </SignIn.Step>
            </SignIn.Root>
          </SpotlightCard>
        </div>
        
        {/* Added TherapyAI statement below the component */}
        <div className="mt-8 text-center max-w-md">
          <p className="text-purple-400 font-medium text-lg mb-2">TherapyAI - Your personal therapist</p>
          <p className="text-gray-400 text-sm">
            Experience the power of AI-guided therapy with our advanced chatbot. 
            TherapyAI provides personalized support, mindfulness exercises, 
            and emotional guidance whenever you need it, all in complete privacy.
          </p>
        </div>
      </div>
      
      {/* Right side with image */}
      <div className="w-1/2 relative">
        <Image
          src="/assets/signinbg.jpg"
          alt="Sign in background"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}