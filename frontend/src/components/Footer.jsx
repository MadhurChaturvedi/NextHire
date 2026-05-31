import React from 'react';
import { Cpu } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200/50 dark:bg-slate-950 dark:border-slate-900/60 py-8 mt-auto transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <Cpu size={16} />
            </div>
            <span className="font-display font-semibold text-slate-900 dark:text-white">
              Next<span className="text-indigo-600">Hire</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} NextHire. AI-powered Resume Parser & Career Assistant. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="hover:text-indigo-600 cursor-pointer">Privacy Policy</span>
            <span>&bull;</span>
            <span className="hover:text-indigo-600 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
