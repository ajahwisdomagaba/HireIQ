import React from 'react';
import './globals.css';

export const metadata = {
  title: 'HireIQ - Recruitment Intelligence',
  description: 'AI-native Applicant Tracking System for the African Tech Ecosystem',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}