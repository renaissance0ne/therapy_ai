import React from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { dark } from '@clerk/themes';
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "therapyAI",
  description: "Therapist for everyone!",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={`${inter.className} bg-dark-1`}>
        <ClerkProvider 
          appearance={{
            baseTheme: dark,
            elements: {
              formButtonPrimary: 'bg-purple-600 hover:bg-purple-700 py-1.5',
              formFieldInput: 'h-8',
              formField: 'mb-2',
              socialButtonsIconButton: 'h-8',
              footerActionLink: 'text-xs',
              dividerRow: 'my-2',
              dividerText: 'text-xs',
              formFieldLabel: 'text-xs mb-1',
              formFieldError: 'text-xs',
              identityPreviewText: 'text-xs',
              identityPreviewEditButton: 'text-xs',
              formFieldWarning: 'text-xs',
              otpCodeFieldInput: 'h-8',
              socialButtonsBlockButton: 'h-8 text-xs',
              socialButtonsBlockButtonText: 'text-xs',
              socialButtonsProviderIcon: 'w-4 h-4',
              formHeaderTitle: 'text-base',
              formHeaderSubtitle: 'text-xs',
              avatarBox: 'w-8 h-8',
              card: {
                boxShadow: 'none',
                marginBottom: '0',
                marginTop: '0',
                width: '320px',
                transform: 'scale(0.75)',
                transformOrigin: 'top'
              },
              form: {
                gap: '0.5rem'
              }
            },
            layout: {
              socialButtonsPlacement: 'bottom',
              socialButtonsVariant: 'iconButton'
            }
          }}>
          <main className="relative">
            {children}
          </main>
        </ClerkProvider>
      </body>
    </html>
  );
}