import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  UploadCloud,
  FileText,
  Trash2,
  Calendar,
  Target,
  Award,
  ArrowRight,
  Eye,
  Play,
  Sparkles,
  MessageSquare,
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Analysis dialog states
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [analyzing, setAnalyzing] = useState(false);

  const roles = [
    "Full Stack Developer",
    "Data Scientist",
    "ML Engineer",
    "Java Developer",
    "DevOps Engineer",
  ];

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get("/resumes/history");
      setHistory(response.data.history || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch resume upload history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this resume?")) {
      try {
        await api.delete(`/resumes/${id}`);
        setHistory(history.filter((item) => item._id !== id));
      } catch (err) {
        console.error(err);
        alert("Failed to delete resume.");
      }
    }
  };

  const handleAnalyzeClick = (id, e) => {
    e.stopPropagation();
    setSelectedResumeId(id);
  };

  const executeAnalysis = async () => {
    if (!selectedResumeId || !targetRole) return;

    setAnalyzing(true);
    try {
      const response = await api.post("/resumes/analyze", {
        resumeId: selectedResumeId,
        targetRole,
      });
      setSelectedResumeId(null);
      navigate(`/report/${selectedResumeId}`);
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          "Analysis failed. Please verify the backend is running and the Groq API key is configured.",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              Your Resume Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage uploaded resumes, scan compatibility, and check
              recommendations.
            </p>
          </div>
          <Link
            to="/upload"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:-translate-y-0.5 transition-all duration-200"
          >
            <UploadCloud size={18} />
            Upload New Resume
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/40 dark:border-rose-800/20 text-rose-600 dark:text-rose-400 text-sm">
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-950/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
            <div className="h-16 w-16 mx-auto bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
              <FileText size={32} />
            </div>
            <h2 className="text-xl font-bold tracking-tight mb-2">
              No Resumes Found
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
              You haven't uploaded any resumes yet. Upload a PDF or Word
              document to parse and calculate your ATS match.
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-xl shadow-sm transition-colors"
            >
              Upload Your First Resume
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {history.map((resume) => {
              const isAnalyzed =
                resume.score && resume.score.overall !== undefined;
              return (
                <div
                  key={resume._id}
                  onClick={() =>
                    isAnalyzed
                      ? navigate(`/report/${resume._id}`)
                      : setSelectedResumeId(resume._id)
                  }
                  className="group relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 p-6 rounded-2xl cursor-pointer hover:shadow-lg dark:hover:shadow-indigo-950/10 hover:border-indigo-500/50 transition-all duration-200"
                >
                  {/* Left Column: File Details */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
                      <FileText size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {resume.filename}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(resume.uploadedAt).toLocaleDateString()}
                        </span>
                        <span>&bull;</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Applicant: {resume.parsedData?.name || "Unknown"}
                        </span>
                      </div>

                      {/* Parsed Skills Preview */}
                      {resume.skills && resume.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {resume.skills.slice(0, 5).map((skill, idx) => (
                            <span
                              key={idx}
                              className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] uppercase font-semibold"
                            >
                              {skill}
                            </span>
                          ))}
                          {resume.skills.length > 5 && (
                            <span className="text-[10px] text-slate-400 pl-1 font-medium">
                              +{resume.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Score Badges / Action */}
                  <div className="flex flex-row items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800/40">
                    {isAnalyzed ? (
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1 justify-end text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <Target size={12} />
                            {resume.recommendations?.targetRole}
                          </div>
                          <div className="text-xs text-indigo-500 font-medium mt-0.5">
                            Click to view report
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/chat?resumeId=${resume._id}`, {
                                state: { resumeId: resume._id },
                              });
                            }}
                            className="flex items-center gap-1 mt-1 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer ml-auto"
                          >
                            <MessageSquare size={12} />
                            Chat with AI
                          </button>
                        </div>

                        <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/10">
                          <div className="text-center">
                            <div className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 leading-none">
                              {resume.score.overall}
                            </div>
                            <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mt-1">
                              Score
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => handleAnalyzeClick(resume._id, e)}
                        className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 dark:text-indigo-400 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors"
                      >
                        <Play size={12} />
                        Analyze ATS Match
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDelete(resume._id, e)}
                      className="p-2.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-500 dark:hover:bg-rose-950/20 transition-colors shrink-0"
                      title="Delete Resume"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Target Role Dialog */}
        {selectedResumeId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200/50 dark:border-slate-800/40 relative">
              <h2 className="text-xl font-bold tracking-tight mb-2 flex items-center gap-1.5">
                <Sparkles size={20} className="text-indigo-500" />
                Select Target Career Role
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Choose a job path to match your resume skills against. We will
                run similarity scores and compute missing elements.
              </p>

              <div className="space-y-4 mb-8">
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => setTargetRole(role)}
                    className={`w-full flex justify-between items-center px-4 py-3 rounded-xl border text-sm font-semibold text-left transition-all
                      ${
                        targetRole === role
                          ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                          : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                  >
                    {role}
                    {targetRole === role && (
                      <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setSelectedResumeId(null)}
                  disabled={analyzing}
                  className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={executeAnalysis}
                  disabled={analyzing}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  {analyzing ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Analyzing...
                    </>
                  ) : (
                    "Run AI Analysis"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
