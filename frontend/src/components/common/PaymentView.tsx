import React from 'react';
import { ArrowRight, BadgeDollarSign, CreditCard, Landmark, ReceiptText, ShieldCheck } from 'lucide-react';

const paymentCards = [
  { label: 'Wallet balance', value: '₹24,850', meta: 'Available to settle', tone: 'emerald' },
  { label: 'Pending payout', value: '₹8,420', meta: '2 payments due this week', tone: 'amber' },
  { label: 'Card payment', value: 'Visa •••• 4821', meta: 'Default payment method', tone: 'sky' },
];

const paymentHistory = [
  { title: 'Transport booking', amount: '₹4,200', status: 'Paid', date: '30 Sep 2026' },
  { title: 'Cold-chain fee', amount: '₹1,180', status: 'Pending', date: '29 Sep 2026' },
  { title: 'Market settlement', amount: '₹6,560', status: 'Paid', date: '26 Sep 2026' },
  { title: 'Rescue support', amount: '₹2,400', status: 'Scheduled', date: '25 Sep 2026' },
];

export const PaymentView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Payments</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Payment overview</h2>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800">
            <CreditCard className="h-4 w-4" />
            Add payment method
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {paymentCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">{card.label}</span>
              <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                card.tone === 'emerald' ? 'bg-emerald-100 text-emerald-800' :
                card.tone === 'amber' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
              }`}>Live</span>
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900">{card.value}</div>
            <p className="mt-1 text-xs text-slate-500">{card.meta}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Recent payment activity</h3>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><ReceiptText className="h-3.5 w-3.5" /> This month</span>
          </div>
          <div className="mt-4 space-y-3">
            {paymentHistory.map((row) => (
              <div key={row.title} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div>
                  <p className="font-semibold text-slate-900">{row.title}</p>
                  <p className="text-xs text-slate-500">{row.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{row.amount}</p>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    row.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                    row.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                  }`}>{row.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900">Settlement methods</h3>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <BadgeDollarSign className="h-4 w-4 text-emerald-700" />
                Agrilogix Wallet
              </div>
              <p className="mt-1 text-xs text-slate-500">Instant settlements for transport and market payouts.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <ShieldCheck className="h-4 w-4 text-blue-700" />
                UPI / Bank transfer
              </div>
              <p className="mt-1 text-xs text-slate-500">Secure transfers with verification before settlement.</p>
            </div>
          </div>

          <button className="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <span>Manage payment preferences</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
