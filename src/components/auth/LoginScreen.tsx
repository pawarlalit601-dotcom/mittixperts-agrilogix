import React, { useState } from 'react';
import { Sprout, ShieldCheck, ArrowRight, Mail, Lock, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

const credentials: Record<string, { password: string; role: UserRole; label: string }> = {
  'farmer@agrilogix.io': { password: 'agrilogix123', role: 'FARMER', label: 'Farmer' },
  'driver@agrilogix.io': { password: 'agrilogix123', role: 'DRIVER', label: 'Driver' },
  'buyer@agrilogix.io': { password: 'agrilogix123', role: 'BUYER', label: 'Buyer' },
  'admin@agrilogix.io': { password: 'agrilogix123', role: 'ADMIN', label: 'Admin' },
};

export const LoginScreen: React.FC = () => {
  const { loginAsRole } = useApp();
  const [email, setEmail] = useState('farmer@agrilogix.io');
  const [password, setPassword] = useState('agrilogix123');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const match = credentials[email.trim().toLowerCase()];
    if (!match || match.password !== password) {
      setError('Invalid email or password. Please use a valid Agrilogix account.');
      return;
    }

    setError('');
    loginAsRole(match.role);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-8 sm:p-10 text-white">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
                <Sprout className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">Agrilogix</p>
                <h1 className="text-2xl font-black tracking-tight">Operations Platform</h1>
              </div>
            </div>

            <div className="max-w-md">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-50">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure access
              </span>

              <h2 className="mt-6 text-3xl font-black leading-tight sm:text-4xl">
                Connect your real farm and logistics operations.
              </h2>

              <p className="mt-4 text-sm text-emerald-50/90 sm:text-base">
                Manage shipments, freshness intelligence, route visibility, and buyer workflows from one secure system built for production data.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  'Live shipment monitoring',
                  'Verified route and freshness data',
                  'Role-based access for farm, driver, buyer, and admin teams',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-emerald-50/95">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-bold">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md">
              <div className="mb-6 text-center">
                <h3 className="text-2xl font-black text-slate-900">Sign in</h3>
                <p className="mt-2 text-sm text-slate-500">Use your Agrilogix account to continue.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                      placeholder="name@agrilogix.io"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Role-based secure login</span>
                  </div>
                  <button type="button" className="font-semibold text-emerald-700 transition hover:text-emerald-800">
                    Forgot password?
                  </button>
                </div>

                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500"
                >
                  Sign in to dashboard
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                <p className="font-bold uppercase tracking-[0.12em] text-slate-500">Sample account access</p>
                <div className="mt-2 space-y-1">
                  <p>farmer@agrilogix.io / agrilogix123</p>
                  <p>driver@agrilogix.io / agrilogix123</p>
                  <p>buyer@agrilogix.io / agrilogix123</p>
                  <p>admin@agrilogix.io / agrilogix123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
