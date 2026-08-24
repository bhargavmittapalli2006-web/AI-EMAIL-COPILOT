import React from 'react';
import { Sparkles, ShieldCheck, Lock } from 'lucide-react';

export const TrustIndicators = () => {
  const indicators = [
    {
      icon: Sparkles,
      title: 'AI-Powered',
      desc: 'Local & Cloud ML inference with zero private data retention.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure by Design',
      desc: 'SOC-2 compliant end-to-end encryption across all inbound protocols.',
    },
    {
      icon: Lock,
      title: 'Real-Time Protection',
      desc: 'Sub-second SPF, DKIM, and URL spoofing heuristic detection.',
    },
  ];

  return (
    <section id="trust" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800/80">
      <div className="max-w-6xl mx-auto space-y-8 text-center">
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Built for safer, smarter email decisions.
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enterprise-grade cyber security intelligence seamlessly integrated into daily productivity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {indicators.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-[#0B1020] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center space-y-2.5"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/60">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;
