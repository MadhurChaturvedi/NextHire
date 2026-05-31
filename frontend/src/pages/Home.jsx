import React from 'react';
import { Link } from 'react-router-dom';
import { FileSearch, Target, Compass, Sparkles, Shield, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <FileSearch className="text-indigo-600 dark:text-indigo-400" size={24} />,
      title: "ATS Scoring Engine",
      description: "Analyze your resume compatibility against industry standard filters with detailed section checks."
    },
    {
      icon: <Target className="text-purple-600 dark:text-purple-400" size={24} />,
      title: "Skill Gap Analysis",
      description: "Match your technical skills against target jobs and discover exactly what technologies are missing."
    },
    {
      icon: <Compass className="text-indigo-600 dark:text-indigo-400" size={24} />,
      title: "Interactive Roadmaps",
      description: "Follow customized learning steps with recommended resources to bridge your professional gaps."
    },
    {
      icon: <Sparkles className="text-purple-600 dark:text-purple-400" size={24} />,
      title: "Project & Prep Recommender",
      description: "Get curated suggestions for portfolio projects, certifications, and technical interview questions."
    }
  ];

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24 grid-bg">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-600/5 animate-pulse-slow"></div>
        <div className="absolute top-1/3 right-1/4 -z-10 h-72 w-72 rounded-full bg-purple-400/10 blur-3xl dark:bg-purple-600/5 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide mb-8 border border-indigo-100/50 dark:border-indigo-900/30">
            <Sparkles size={12} className="animate-spin" style={{ animationDuration: '4s' }} />
            Next Generation AI Recruiting Companion
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Optimize Your Resume & <br/>
            <span className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Accelerate Your Career
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Upload your resume, analyze your ATS score, map your skill gaps, and follow personalized learning roadmaps to unlock your dream role.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to={user ? "/upload" : "/register"}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-200 hover:-translate-y-0.5"
            >
              Analyze Resume Now
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/features"
              className="bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-medium px-8 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              Explore Capabilities
            </Link>
          </div>

          {/* Mini Dashboard Preview */}
          <div className="mt-16 max-w-4xl mx-auto rounded-2xl glass-card p-4 sm:p-6 shadow-2xl relative border border-slate-200/40 dark:border-slate-800/40 hover:scale-[1.01] transition-transform duration-300">
            <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/40 pb-3 mb-4">
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
              </div>
              <span className="text-xs font-medium text-slate-400">NextHire ATS Analysis Report</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/30 dark:border-indigo-900/10">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">ATS Match Rating</span>
                <div className="text-4xl font-extrabold mt-2 text-indigo-700 dark:text-indigo-300">82%</div>
                <p className="text-xs mt-1 text-slate-500">Strong compatibility</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100/30 dark:border-purple-900/10">
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">Target Role</span>
                <div className="text-xl font-bold mt-3 text-purple-700 dark:text-purple-300">Full Stack Dev</div>
                <p className="text-xs mt-1 text-slate-500">Node, React, Typescript</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/30 dark:border-emerald-900/10">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Skill Gap</span>
                <div className="text-sm font-medium mt-2 text-slate-700 dark:text-slate-300">
                  <span className="bg-emerald-200 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded text-[10px] mr-1">React</span>
                  <span className="bg-emerald-200 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded text-[10px] mr-1">Node</span>
                  <span className="bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 px-1.5 py-0.5 rounded text-[10px] line-through">Docker</span>
                </div>
                <p className="text-xs mt-2.5 text-rose-500">1 Missing Core Skill</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white dark:bg-slate-900 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Powerful Core Features
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              We leverage modern Natural Language Processing (NLP) models to parse entities, calculate cosine context similarity, and construct skill-gap pathways.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, index) => (
              <div key={index} className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 bg-slate-50 dark:bg-slate-950/40 hover:-translate-y-1 transition-transform duration-250 hover:shadow-lg dark:hover:shadow-indigo-950/10">
                <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 flex items-center justify-center shadow-sm">
                  {feat.icon}
                </div>
                <h3 className="font-display font-bold mt-5 text-lg">{feat.title}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-indigo-600/5 dark:bg-indigo-950/20 border border-indigo-200/20 dark:border-indigo-900/10 p-8 sm:p-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold mb-2">
                <Shield size={18} />
                Secure & Confidential
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Your data privacy is our priority</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                All uploaded resumes are sanitized and stored securely. We use JSON Web Tokens to protect access routes, ensuring your credentials and career data remain safe.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 w-32 shadow-sm">
                <UserCheck className="text-indigo-500" size={24} />
                <span className="text-[10px] font-bold mt-2 uppercase tracking-wide">JWT Secured</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 w-32 shadow-sm">
                <Shield className="text-purple-500" size={24} />
                <span className="text-[10px] font-bold mt-2 uppercase tracking-wide">Rate Limited</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
