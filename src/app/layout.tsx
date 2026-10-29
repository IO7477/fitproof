import type { Metadata } from 'next';
import './globals.css';
import { getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'FitProof — Evidence-Backed Laptop RAM & SSD Compatibility Checker',
  description:
    'Confirm exact laptop RAM and SSD compatibility backed by documented specifications and verified bench test evidence.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar currentUser={currentUser} />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 space-y-1">
            <p className="font-semibold text-slate-700">
              FitProof Prototype — Deterministic Compatibility Decision Support System
            </p>
            <p>
              Strict Non-Fabrication Guarantee: All initial records use fictional brands (ApexVolt, Nexura, ProForma)
              and synthetic evidence.
            </p>
            <p className="text-slate-400">
              Rule Engine v1.0.0-deterministic • Offline-capable local SQLite architecture
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

