import type { Metadata } from 'next';
import './globals.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Sessions Marketplace',
  description: 'Book and manage sessions effortlessly',
};

import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy-client-id'}>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'rounded-2xl font-bold text-sm bg-white shadow-2xl border border-gray-50 p-4',
              duration: 4000,
            }}
          />
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
