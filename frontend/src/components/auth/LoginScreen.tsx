import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Mail, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import agrilogixLogo from '../../assets/agrilogix-logo.svg';
import { apiClient, AuthenticatedUser, KycAccountType, PreferredLanguage } from '../../services/apiClient';

interface GoogleIdentity {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        callback: (response: { credential: string }) => void;
      }) => void;
      renderButton: (element: HTMLElement, options: Record<string, string | number>) => void;
    };
  };
}

export const LoginScreen: React.FC = () => {
  const { loginAsUser } = useApp();
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [accountType, setAccountType] = useState<KycAccountType>('FARMER');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    if (isRegistering || !googleClientId || !googleButtonRef.current) return;

    const host = googleButtonRef.current;
    let active = true;
    const renderGoogleButton = () => {
      const google = (window as unknown as { google?: GoogleIdentity }).google;
      if (!active || !google) return;

      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: ({ credential }) => {
          setError('');
          setIsSubmitting(true);
          void apiClient.loginWithGoogle(credential)
            .then(({ user }) => loginAsUser(user))
            .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Google sign-in could not be completed. Please try again or use email and password.'))
            .finally(() => setIsSubmitting(false));
        },
      });
      google.accounts.id.renderButton(host, {
        theme: 'outline',
        size: 'large',
        shape: 'rect',
        text: 'continue_with',
        width: Math.min(360, host.clientWidth || 360),
      });
    };

    const scriptUrl = 'https://accounts.google.com/gsi/client';
    let script = document.querySelector<HTMLScriptElement>(`script[src="${scriptUrl}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', renderGoogleButton);
    renderGoogleButton();

    return () => {
      active = false;
      script?.removeEventListener('load', renderGoogleButton);
      host.replaceChildren();
    };
  }, [googleClientId, isRegistering, loginAsUser]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (isRegistering && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (isRegistering) {
        const role: AuthenticatedUser['role'] = accountType === 'FARMER'
          ? 'FARMER'
          : accountType === 'DRIVER'
            ? 'DRIVER'
            : 'BUSINESS';
        await apiClient.register({
            email: email.trim(),
            fullName: fullName.trim(),
            password,
            role,
            accountType,
            mobileNumber: mobileNumber.trim(),
            village: village.trim(),
            district: district.trim(),
            state: state.trim(),
            preferredLanguage: 'en',
          });
        const { user } = await apiClient.login(email.trim(), password);
        setPassword('');
        setConfirmPassword('');
        loginAsUser(user);
      } else {
        const { user } = await apiClient.login(email.trim(), password);
        loginAsUser(user);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to authenticate. Check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4 py-8">
      <section className="w-full max-w-md rounded-lg border border-sky-100 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-7 text-center">
          <img src={agrilogixLogo} alt="AGRILOGIX" className="mx-auto h-16 w-60 object-contain" />
          <p className="mt-2 text-sm font-semibold text-emerald-800">India&apos;s Dedicated Agricultural Freight Corridor</p>
          <p className="mt-1 text-xs text-slate-500">Smart Agriculture Logistics</p>
          <h1 className="mt-6 text-2xl font-bold text-slate-900">{isRegistering ? 'Create your account' : 'Welcome to AGRILOGIX'}</h1>
          <p className="mt-2 text-sm text-slate-600">{isRegistering ? 'Set up your account to move produce with confidence.' : 'Sign in to manage your produce and deliveries.'}</p>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-md bg-sky-50 p-1 text-sm font-semibold">
          <button type="button" onClick={() => { setIsRegistering(false); setError(''); setSuccess(''); }} className={`min-h-10 rounded ${!isRegistering ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500'}`}>Sign in</button>
          <button type="button" onClick={() => { setIsRegistering(true); setError(''); setSuccess(''); }} className={`min-h-10 rounded ${isRegistering ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500'}`}>Create account</button>
        </div>

        {success && <div role="status" className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && <label className="block text-sm font-semibold text-slate-700">Your role<select value={accountType} onChange={(event) => setAccountType(event.target.value as KycAccountType)} className="mt-1.5 h-12 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-600"><option value="FARMER">Farmer</option><option value="TRANSPORTER">Driver / Transporter</option><option value="DRIVER">Driver</option><option value="WHOLESALER">Wholesaler</option><option value="RETAILER">Retailer</option><option value="FPO">FPO / Farmer Organization</option><option value="BUYER_BUSINESS">Buyer / Business</option></select></label>}
          {isRegistering && <label htmlFor="full-name" className="block text-sm font-semibold text-slate-700">Full name<input id="full-name" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} required minLength={2} maxLength={120} className="mt-1.5 h-12 w-full rounded-md border border-slate-200 px-3 text-sm font-normal text-slate-900 outline-none focus:border-emerald-600" placeholder="Your full name" /></label>}
          {isRegistering && <label htmlFor="mobile-number" className="block text-sm font-semibold text-slate-700">Mobile number<input id="mobile-number" type="tel" autoComplete="tel" value={mobileNumber} onChange={(event) => setMobileNumber(event.target.value)} required minLength={8} maxLength={20} className="mt-1.5 h-12 w-full rounded-md border border-slate-200 px-3 text-sm font-normal text-slate-900 outline-none focus:border-emerald-600" placeholder="+91 98765 43210" /></label>}
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700">Email address<span className="relative mt-1.5 block"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="h-12 w-full rounded-md border border-slate-200 pl-10 pr-3 text-sm font-normal text-slate-900 outline-none focus:border-emerald-600" placeholder="name@example.com" /></span></label>
          <label htmlFor="password" className="block text-sm font-semibold text-slate-700">{isRegistering ? 'Set password (12+ characters)' : 'Password'}<span className="relative mt-1.5 block"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input id="password" type="password" autoComplete={isRegistering ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={isRegistering ? 12 : 1} maxLength={128} className="h-12 w-full rounded-md border border-slate-200 pl-10 pr-3 text-sm font-normal text-slate-900 outline-none focus:border-emerald-600" placeholder="Enter your password" /></span></label>
          {isRegistering && <label htmlFor="confirm-password" className="block text-sm font-semibold text-slate-700">Confirm password<span className="relative mt-1.5 block"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={12} maxLength={128} className="h-12 w-full rounded-md border border-slate-200 pl-10 pr-3 text-sm font-normal text-slate-900 outline-none focus:border-emerald-600" placeholder="Re-enter your password" /></span></label>}
          {isRegistering && <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label htmlFor="village" className="block text-sm font-semibold text-slate-700">Village<input id="village" autoComplete="address-level3" value={village} onChange={(event) => setVillage(event.target.value)} required minLength={2} maxLength={120} className="mt-1.5 h-12 w-full rounded-md border border-slate-200 px-3 text-sm font-normal text-slate-900 outline-none focus:border-emerald-600" placeholder="Village" /></label><label htmlFor="district" className="block text-sm font-semibold text-slate-700">District<input id="district" autoComplete="address-level2" value={district} onChange={(event) => setDistrict(event.target.value)} required minLength={2} maxLength={120} className="mt-1.5 h-12 w-full rounded-md border border-slate-200 px-3 text-sm font-normal text-slate-900 outline-none focus:border-emerald-600" placeholder="District" /></label></div>}
          {isRegistering && <label htmlFor="state" className="block text-sm font-semibold text-slate-700">State<input id="state" autoComplete="address-level1" value={state} onChange={(event) => setState(event.target.value)} required minLength={2} maxLength={120} className="mt-1.5 h-12 w-full rounded-md border border-slate-200 px-3 text-sm font-normal text-slate-900 outline-none focus:border-emerald-600" placeholder="State" /></label>}
          {error && <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>}
          <button type="submit" disabled={isSubmitting} className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-60">{isSubmitting ? 'Please wait...' : isRegistering ? 'Create account' : 'Sign in'}<ArrowRight className="h-4 w-4" /></button>
        </form>

        {!isRegistering && <div className="mt-5">
          <div className="mb-4 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" /></div>
          {googleClientId ? <div ref={googleButtonRef} className="flex min-h-10 justify-center" /> : <button type="button" onClick={() => setError('Google sign-in is not configured for this deployment.')} className="h-12 w-full rounded-md border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-sky-50">Continue with Google</button>}
        </div>}
        <p className="mt-6 text-center text-xs text-slate-500">Administrator accounts are provisioned by the system operator.</p>
      </section>
    </main>
  );
};
