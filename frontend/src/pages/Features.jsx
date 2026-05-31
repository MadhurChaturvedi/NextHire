import React from 'react';
import { BrainCircuit, Layers, Percent, Compass, Sparkles, Terminal, ShieldAlert } from 'lucide-react';

const Features = () => {
  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl font-extrabold tracking-tight">Our Technology & Features</h1>
          <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Discover the inner workings of our AI-powered resume scanner, similarity algorithms, and career roadmaps.
          </p>
        </div>

        {/* NLP Parsing Pipeline */}
        <div className="mb-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <BrainCircuit size={20} />
            </div>
            <h2 className="text-2xl font-bold font-display">Python NLP Parsing Engine</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            Our separate Python service, built with FastAPI, manages the intensive document processing and matching calculations. We execute a structured pipeline:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/30 dark:border-slate-800/20">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase">Step 1: Text Extraction</span>
              <p className="text-xs mt-1 text-slate-500 leading-normal">Using pypdf and python-docx, we extract raw text strings from PDF and Word uploads page-by-page.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/30 dark:border-slate-800/20">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase">Step 2: Preprocessing</span>
              <p className="text-xs mt-1 text-slate-500 leading-normal">Filtering URLs, hashtags, punctuation, and converting strings to lowercase to ensure matching efficiency.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/30 dark:border-slate-800/20">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase">Step 3: Named Entity Recognition</span>
              <p className="text-xs mt-1 text-slate-500 leading-normal">Utilizing spaCy's pre-trained en_core_web_sm model to extract applicant name, phone numbers, and email patterns.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/30 dark:border-slate-800/20">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase">Step 4: Skill Parsing</span>
              <p className="text-xs mt-1 text-slate-500 leading-normal">Matching text tokens against a curated taxonomy of 200+ technologies using strict regex boundary match rules.</p>
            </div>
          </div>
        </div>

        {/* ATS Score Weights */}
        <div className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-sm text-center">
            <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">45%</div>
            <h3 className="font-semibold mt-3 text-lg">Skill Relevance</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Calculates the intersection ratio between your resume's technical skills and those required by the target role template.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-sm text-center">
            <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">35%</div>
            <h3 className="font-semibold mt-3 text-lg">Context Similarity</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Uses Scikit-learn to convert both your resume corpus and the target job template to TF-IDF vectors, evaluating cosine similarity.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-sm text-center">
            <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">20%</div>
            <h3 className="font-semibold mt-3 text-lg">Resume Structure</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Checks for standard sections like contact information, clear experience logs, and educational records to guarantee ATS compatibility.
            </p>
          </div>
        </div>

        {/* Supported Roles */}
        <div className="mb-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 p-8 shadow-sm">
          <h3 className="text-xl font-bold mb-4 font-display">Supported Target Roles</h3>
          <p className="text-sm text-slate-500 mb-6">
            We currently provide high-accuracy templates and analysis systems for these core software engineering positions:
          </p>
          <div className="flex flex-wrap gap-3">
            {["Full Stack Developer", "Data Scientist", "ML Engineer", "Java Developer", "DevOps Engineer"].map((role, idx) => (
              <span key={idx} className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100/50 dark:border-indigo-900/30 px-4 py-2 rounded-xl text-sm font-medium">
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Scalability Future Scope */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-8 sm:p-12 shadow-xl">
          <div className="flex items-center gap-2 text-indigo-300 font-semibold mb-4 uppercase tracking-wide text-xs">
            <Sparkles size={16} />
            Future Scalability Roadmap
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">Expanding to LLMs & RAG</h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Our codebase is architected with scalability in mind. The clean separations between frontend, express, and Python models permit seamless future integrations:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xs font-semibold text-indigo-300 block">LLM Assistant</span>
              <p className="text-[11px] text-slate-300 mt-1">Plug in GPT-4/Llama-3 APIs to offer detailed resume rewriting suggestions directly on screen.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xs font-semibold text-indigo-300 block">Cover Letter Generator</span>
              <p className="text-[11px] text-slate-300 mt-1">Automatically draft optimized cover letters tailored to target roles based on matching skills.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xs font-semibold text-indigo-300 block">AI Interview Prep</span>
              <p className="text-[11px] text-slate-300 mt-1">A mock chat interface using Retrieval Augmented Generation (RAG) to practice role-specific technical questions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
