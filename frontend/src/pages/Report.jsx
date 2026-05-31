import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, CheckCircle, XCircle, Sparkles, Target, Calendar, ArrowRight, FileText, Award } from 'lucide-react';

const Report = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await api.get(`/resumes/${id}`);
        setResume(response.data.resume);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load resume report.');
        setLoading(false);
      }
    };
    fetchResume();
  }, [id]);

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
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const { score, recommendations, filename, uploadedAt, parsedData, skills } = resume || {};

  // If no score yet (resume uploaded but not analyzed), show a prompt
  const isAnalyzed = score && score.overall !== undefined;

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
          <h1 className="font-display text-3xl font-bold">Resume Analysis Report</h1>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/40 dark:border-slate-800/40">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText size={18} className="text-indigo-600" />
              File Details
            </h2>
            <p className="text-sm"><strong>Name:</strong> {parsedData?.name || 'N/A'}</p>
            <p className="text-sm"><strong>Email:</strong> {parsedData?.email || 'N/A'}</p>
            <p className="text-sm"><strong>Phone:</strong> {parsedData?.phone || 'N/A'}</p>
            <p className="text-sm"><strong>Uploaded:</strong> {new Date(uploadedAt).toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/40 dark:border-slate-800/40">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Target size={18} className="text-purple-600" />
              Target Role
            </h2>
            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{recommendations?.targetRole || 'N/A'}</p>
          </div>
        </div>

        {/* Score Card */}
        {isAnalyzed ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/40 dark:border-slate-800/40 text-center">
            <div className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">{score?.overall || '—'}</div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Overall ATS Score</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/40 dark:border-slate-800/40 text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{score?.skillRelevance || '—'}%</div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Skill Relevance</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/40 dark:border-slate-800/40 text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{score?.keywordDensity || '—'}%</div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Keyword Similarity</p>
          </div>
        </div>
        ) : (
        <div className="mb-8 p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/40 dark:border-amber-800/20 text-center">
          <p className="text-amber-700 dark:text-amber-400 font-medium mb-2">This resume hasn't been analyzed yet.</p>
          <p className="text-sm text-amber-600 dark:text-amber-500 mb-4">Go back to the Dashboard and click "Analyze ATS Match" to run an analysis against a target role.</p>
          <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors">Go to Dashboard</button>
        </div>
        )}

        {/* Skills */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Sparkles size={20} className="text-indigo-600" />
            Extracted Skills ({skills?.length || 0})
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills && skills.length > 0 ? (
              skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-500">No skills detected.</p>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        {recommendations?.missingSkills && recommendations.missingSkills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <XCircle size={20} className="text-rose-600" />
              Missing Core Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {recommendations.missingSkills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Roadmap */}
        {recommendations?.roadmap && recommendations.roadmap.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Target size={20} className="text-purple-600" />
              Learning Roadmap
            </h2>
            <ol className="space-y-4">
              {recommendations.roadmap.map((step, idx) => (
                <li key={idx} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/40 dark:border-slate-800/40 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold">
                      {step.step}
                    </span>
                    <h3 className="font-medium text-slate-800 dark:text-slate-200">{step.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{step.description}</p>
                  {step.resources && (
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">Resources: {step.resources}</p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Recommended Projects */}
        {recommendations?.recommendedProjects && recommendations.recommendedProjects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-emerald-600" />
              Project Recommendations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.recommendedProjects.map((proj, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/40 dark:border-slate-800/40 shadow-sm">
                  <h3 className="font-medium text-indigo-600 dark:text-indigo-400 mb-1">{proj.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{proj.description}</p>
                  {proj.techStack && (<p className="text-xs text-slate-500">Tech Stack: {proj.techStack}</p>)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {recommendations?.recommendedCertifications && recommendations.recommendedCertifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Award size={20} className="text-amber-600" />
              Suggested Certifications
            </h2>
            <ul className="list-disc list-inside space-y-1">
              {recommendations.recommendedCertifications.map((cert, idx) => (
                <li key={idx} className="text-slate-700 dark:text-slate-300">{cert}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Interview Prep */}
        {recommendations?.interviewPrep && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ArrowRight size={20} className="text-indigo-600" />
              Interview Preparation
            </h2>
            <div className="space-y-4">
              {recommendations.interviewPrep.technical_questions && recommendations.interviewPrep.technical_questions.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Technical Questions</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {recommendations.interviewPrep.technical_questions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
              {recommendations.interviewPrep.behavioral_guidance && (
                <p className="text-sm">{recommendations.interviewPrep.behavioral_guidance}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors"
          >
            Back to Dashboard
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Report;
