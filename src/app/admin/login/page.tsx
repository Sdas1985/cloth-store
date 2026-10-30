'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@roxy.com');
  const [password, setPassword] = useState('admin123456');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'লগইন ব্যর্থ হয়েছে। ইমেইল ও পাসওয়ার্ড যাচাই করুন।');
        setIsLoading(false);
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError('সার্ভারে যোগাযোগ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1917] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#292524] p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#F7EAEF] text-[#631322] rounded-full flex items-center justify-center mx-auto mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#1C1917]">
            Roxy Fashion Admin Portal
          </h1>
          <p className="text-xs text-[#57534E]">
            নিরাপদ প্রশাসনিক ড্যাশবোর্ড (Super Admin & Staff)
          </p>
        </div>

        {/* Demo Seed Credentials Box */}
        <div className="p-3 bg-[#FAF9F5] border border-[#E7E5E4] rounded-lg text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#631322]">
            <ShieldCheck className="w-4 h-4" />
            <span>Default Seed Credentials</span>
          </div>
          <div className="text-[#57534E]">
            Email: <strong className="text-[#1C1917]">admin@roxy.com</strong><br />
            Password: <strong className="text-[#1C1917]">admin123456</strong>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-xs text-[#B91C1C] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#1C1917]">
              অ্যাডমিন ইমেইল (Email)
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2.5 pl-9 pr-3 bg-white border border-[#D6D3D1] focus:border-[#631322] rounded-lg text-xs focus:outline-hidden text-[#1C1917]"
              />
              <Mail className="w-4 h-4 text-[#78716C] absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#1C1917]">
              পাসওয়ার্ড (Password)
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-2.5 pl-9 pr-3 bg-white border border-[#D6D3D1] focus:border-[#631322] rounded-lg text-xs focus:outline-hidden text-[#1C1917]"
              />
              <Lock className="w-4 h-4 text-[#78716C] absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#631322] hover:bg-[#4E0E1A] disabled:bg-[#A8A29E] text-white font-bold rounded-lg text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            {isLoading ? (
              <span>প্রবেশ করা হচ্ছে...</span>
            ) : (
              <>
                <span>লগইন করুন (Secure Sign In)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <a href="/" className="text-xs text-[#78716C] hover:text-[#631322] transition-colors">
            ← Return to Storefront (ওয়েবসাইটে ফিরুন)
          </a>
        </div>
      </div>
    </div>
  );
}
