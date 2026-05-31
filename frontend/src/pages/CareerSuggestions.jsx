import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, ArrowRight, Sparkles, Target, CheckCircle, XCircle, Calendar, Award } from 'lucide-react';

const CareerSuggestions = () => {
  const { role } = useParams(); // expected role name from route e.g., /career/:role
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/career-roles/${encodeURIComponent(role)}`);
        setData(response.data.role);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load career role data.');
        setLoading(false);
      }
    };
    fetchData();
  }, [role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <p className="text-rose-600 dark:text-rose-400 mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl">
          Go Back
        </button>
      </div>
    );
  }

  const { roadmap, recommendedProjects, recommendedCertifications, requiredSkills } = data || {};

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
          <h1 className="font-display text-3xl font-bold">{role} – Learning Roadmap</h1>
        </div>

        {/* Required Skills */}
        {requiredSkills && requiredSkills.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Target size={20} className="text-purple-600" />
              Core Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {requiredSkills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Roadmap */}
        {roadmap && roadmap.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-600" />
              Step‑by‑Step Roadmap
            </h2>
            <ol className="space-y-4">
              {roadmap.map((step, idx) => (
                <li key={idx} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/40 dark:border-slate-800/40 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold">
                      {step.step}
                    </span>
                    <h3 className="font-medium text-slate-800 dark:text-slate-200">{step.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{step.description}</p>
                  {step.resources && <p className="text-xs text-indigo-600 dark:text-indigo-400">Resources: {step.resources}</p>}
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Project Recommendations */}
        {recommendedProjects && recommendedProjects.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-emerald-600" />
              Project Ideas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedProjects.map((proj, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/40 dark:border-slate-800/40 shadow-sm">
                  <h3 className="font-medium text-indigo-600 dark:text-indigo-400 mb-1">{proj.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{proj.description}</p>
                  {proj.techStack && <p className="text-xs text-slate-500">Tech Stack: {proj.techStack}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {recommendedCertifications && recommendedCertifications.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Award size={20} className="text-amber-600" />
              Recommended Certifications
            </h2>
            <ul className="list-disc list-inside space-y-1">
              {recommendedCertifications.map((cert, idx) => (
                <li key={idx} className="text-slate-700 dark:text-slate-300">{cert}</li>
              ))}
            </ul>
          </section>
        )}

        <div className="flex justify-end">
          <Link to="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors">
            Back to Dashboard
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CareerSuggestions;
