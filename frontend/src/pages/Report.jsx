import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  ArrowLeft, CheckCircle, XCircle, Sparkles, Target,
  ArrowRight, FileText, Award, MessageSquare,
  User, Mail, Phone, Clock, BookOpen, Briefcase, Zap,
} from "lucide-react";

/* ── Circular SVG Score Ring ──────────────────────────────────── */
const ScoreRing = ({ value = 0, size = 108, stroke = 9, color, label, suffix = "" }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(value / 100, 1) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none"
            className="stroke-slate-100 dark:stroke-slate-800" strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            {value}{suffix}
          </span>
        </div>
      </div>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 text-center">{label}</p>
    </div>
  );
};

/* ── Skill Chip ───────────────────────────────────────────────── */
const Chip = ({ label, variant = "indigo" }) => {
  const cls = {
    indigo: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40",
    rose:   "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30",
    emerald:"bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
    amber:  "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
  }[variant];
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {label}
    </span>
  );
};

/* ── Section Card ─────────────────────────────────────────────── */
const Section = ({ icon, title, accent = "indigo", children }) => {
  const iconCls = {
    indigo:  "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400",
    rose:    "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400",
    purple:  "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
    emerald: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
    amber:   "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
    sky:     "bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400",
  }[accent];
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/40 shadow-sm mb-6">
      <h2 className="flex items-center gap-3 text-base font-bold text-slate-800 dark:text-slate-100 mb-4">
        <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${iconCls}`}>
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   Report Page
══════════════════════════════════════════════════════════════ */
const Report = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/resumes/${id}`)
      .then(r => { setResume(r.data.resume); setLoading(false); })
      .catch(() => { setError("Failed to load resume report."); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      <p className="text-sm text-slate-500 dark:text-slate-400">Loading your report…</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <XCircle size={40} className="text-rose-500" />
      <p className="text-rose-600 dark:text-rose-400 font-semibold">{error}</p>
      <button onClick={() => navigate("/dashboard")}
        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-colors">
        Back to Dashboard
      </button>
    </div>
  );

  const { score, recommendations, filename, uploadedAt, parsedData, skills } = resume || {};
  const isAnalyzed = score?.overall !== undefined;

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

        {/* Back button */}
        <button onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* Page title */}
        <h1 className="font-display text-3xl font-extrabold tracking-tight mb-8
          bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Resume Analysis Report
        </h1>

        {/* ── Info Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* File Details */}
          <div className="rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/40 shadow-sm">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/20">
                <FileText size={17} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">File Details</p>
                <p className="text-indigo-100 text-xs mt-0.5 truncate max-w-[200px]">{filename}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { icon: <User size={13} />,   label: "Name",     val: parsedData?.name },
                { icon: <Mail size={13} />,   label: "Email",    val: parsedData?.email },
                { icon: <Phone size={13} />,  label: "Phone",    val: parsedData?.phone },
                { icon: <Clock size={13} />,  label: "Uploaded", val: uploadedAt ? new Date(uploadedAt).toLocaleString() : null },
              ].map(({ icon, label, val }) => (
                <div key={label} className="flex items-center gap-3 px-5 py-3 text-sm">
                  <span className="text-indigo-500 dark:text-indigo-400 shrink-0">{icon}</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300 w-16 shrink-0">{label}</span>
                  <span className="text-slate-500 dark:text-slate-400 truncate">{val || "Not provided"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Target Role */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 shadow-sm flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40">
              <Target size={22} className="text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Target Role
            </p>
            <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 leading-tight">
              {recommendations?.targetRole || "Not set"}
            </p>
          </div>
        </div>

        {/* ── Score Rings ── */}
        {isAnalyzed ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 shadow-sm p-6 mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6 text-center">
              ATS Score Breakdown
            </h2>
            <div className="flex flex-wrap justify-around items-center gap-8">
              <ScoreRing value={score.overall}              color="#4f46e5" label="Overall ATS Score"    size={120} stroke={10} />
              <div className="w-px h-20 bg-slate-100 dark:bg-slate-800 hidden md:block" />
              <ScoreRing value={score.skillRelevance ?? 0} color="#7c3aed" label="Skill Relevance"      suffix="%" />
              <div className="w-px h-20 bg-slate-100 dark:bg-slate-800 hidden md:block" />
              <ScoreRing value={score.keywordDensity ?? 0} color="#0ea5e9" label="Keyword Similarity"   suffix="%" />
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-7 mb-6 text-center">
            <Zap size={32} className="text-amber-500 mx-auto mb-3" />
            <p className="font-bold text-amber-800 dark:text-amber-300 mb-1">Not Analyzed Yet</p>
            <p className="text-sm text-amber-700 dark:text-amber-400 mb-5">
              Go to Dashboard → click "Analyze ATS Match" to score this resume.
            </p>
            <button onClick={() => navigate("/dashboard")}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-colors">
              Go to Dashboard
            </button>
          </div>
        )}

        {/* ── Extracted Skills ── */}
        {skills?.length > 0 && (
          <Section icon={<Sparkles size={15} />} title={`Extracted Skills (${skills.length})`} accent="indigo">
            <div className="flex flex-wrap gap-2">
              {skills.map((sk, i) => <Chip key={i} label={sk} variant="indigo" />)}
            </div>
          </Section>
        )}

        {/* ── Missing Skills ── */}
        {recommendations?.missingSkills?.length > 0 && (
          <Section icon={<XCircle size={15} />} title="Missing Core Skills" accent="rose">
            <div className="flex flex-wrap gap-2">
              {recommendations.missingSkills.map((sk, i) => <Chip key={i} label={sk} variant="rose" />)}
            </div>
          </Section>
        )}

        {/* ── Learning Roadmap ── */}
        {recommendations?.roadmap?.length > 0 && (
          <Section icon={<BookOpen size={15} />} title="Learning Roadmap" accent="purple">
            <ol className="space-y-4">
              {recommendations.roadmap.map((step, idx) => (
                <li key={idx} className="flex gap-4 relative">
                  {idx < recommendations.roadmap.length - 1 && (
                    <div className="absolute left-[17px] top-9 w-0.5 h-full bg-gradient-to-b from-indigo-300 dark:from-indigo-700 to-transparent" />
                  )}
                  <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm z-10">
                    {step.step}
                  </div>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/40">
                    <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-1">{step.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.description}</p>
                    {step.resources && (
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">
                        📎 {step.resources}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* ── Project Recommendations ── */}
        {recommendations?.recommendedProjects?.length > 0 && (
          <Section icon={<Briefcase size={15} />} title="Project Recommendations" accent="emerald">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.recommendedProjects.map((proj, idx) => (
                <div key={idx} className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/30">
                  <h3 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 mb-1">{proj.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">{proj.description}</p>
                  {proj.techStack && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {proj.techStack.split(",").map((t, i) => (
                        <Chip key={i} label={t.trim()} variant="emerald" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Certifications ── */}
        {recommendations?.recommendedCertifications?.length > 0 && (
          <Section icon={<Award size={15} />} title="Suggested Certifications" accent="amber">
            <div className="flex flex-col gap-2">
              {recommendations.recommendedCertifications.map((cert, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl px-4 py-3 border border-amber-100 dark:border-amber-900/30">
                  <Award size={15} className="text-amber-500 shrink-0" />
                  <span className="text-sm font-medium text-amber-800 dark:text-amber-300">{cert}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Interview Prep ── */}
        {recommendations?.interviewPrep && (
          <Section icon={<MessageSquare size={15} />} title="Interview Preparation" accent="sky">
            {recommendations.interviewPrep.technical_questions?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Technical Questions
                </p>
                <div className="space-y-2">
                  {recommendations.interviewPrep.technical_questions.map((q, i) => (
                    <div key={i} className="flex gap-3 items-start bg-sky-50 dark:bg-sky-950/20 rounded-xl px-4 py-3 border border-sky-100 dark:border-sky-900/30">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {recommendations.interviewPrep.behavioral_guidance && (
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 py-3 border border-slate-200/60 dark:border-slate-700/40 text-sm text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Behavioral Guidance: </span>
                {recommendations.interviewPrep.behavioral_guidance}
              </div>
            )}
          </Section>
        )}

        {/* ── Action Buttons ── */}
        <div className="flex justify-end gap-3 mt-2">
          <Link to={`/chat?resumeId=${id}`} state={{ resumeId: id }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
              bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400
              border border-indigo-100 dark:border-indigo-900/40
              hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition-colors">
            <MessageSquare size={15} /> Chat with AI
          </Link>
          <Link to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
              bg-indigo-600 hover:bg-indigo-500 text-white transition-colors
              shadow-md shadow-indigo-600/20">
            Back to Dashboard <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Report;
