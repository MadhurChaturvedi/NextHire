import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { UploadCloud, FileText, AlertCircle, ArrowRight, X, Check } from 'lucide-react';

const Upload = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowed.includes(selected.type)) {
        setError('Only PDF or Word documents are allowed.');
        setFile(null);
        return;
      }
      setError(null);
      setFile(selected);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const response = await api.post('/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess(true);
      // Redirect after a short pause to allow user to see success state
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Upload failed. Please try again.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 grid-bg transition-colors">
      {/* Decorative gradients */}
      <div className="absolute top-1/4 left-1/3 -z-10 h-64 w-64 rounded-full bg-indigo-400/5 blur-3xl dark:bg-indigo-600/5 animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/3 -z-10 h-64 w-64 rounded-full bg-purple-400/5 blur-3xl dark:bg-purple-600/5 animate-pulse-slow"></div>

      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-slate-200/40 dark:border-slate-800/40">
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-4 shadow-md">
            <UploadCloud size={28} />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Upload Your Resume</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Supported formats: PDF, DOC, DOCX (max 5 MB)</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/40 dark:border-rose-800/20 text-rose-600 dark:text-rose-400 flex items-start gap-2 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-800/20 text-emerald-600 dark:text-emerald-400 flex items-start gap-2 text-sm">
            <Check size={16} className="mt-0.5 shrink-0" />
            Resume uploaded successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="flex items-center gap-2">
            <label className="flex-1 cursor-pointer bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              {file ? (
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{file.name}</span>
              ) : (
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Click to select a file</span>
              )}
              <input type="file" name="resume" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
            </label>
            {file && (
              <button type="button" onClick={() => setFile(null)} className="p-2 rounded-xl text-slate-600 hover:bg-rose-50 dark:hover:bg-rose-950/20">
                <X size={18} />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none transition-all"
          >
            {uploading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : (
              <>
                Upload Resume
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
