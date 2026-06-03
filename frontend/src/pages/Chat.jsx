import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../utils/api';
import { 
  Send, Sparkles, FileText, Target, Cpu, 
  ArrowRight, BrainCircuit, CheckCircle, AlertTriangle, 
  MessageSquare, User, HelpCircle, RefreshCw, ChevronLeft 
} from 'lucide-react';

const Chat = () => {
  const location = useLocation();
  
  // States
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedResume, setSelectedResume] = useState(null);
  
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your **NextHire AI Career Assistant & Interview Coach**. \n\nSelect one of your uploaded resumes on the left, and I can:\n- Conduct a **mock interview** tailored to your target role\n- Explain the steps in your **custom learning roadmap**\n- Explain how to build the recommended **portfolio projects**\n- Draft a personalized **cover letter** matching your profile'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  // Parse location state for initial resume selection (passed when redirecting from Report/Dashboard)
  useEffect(() => {
    const fetchResumes = async () => {
      setLoadingResumes(true);
      try {
        const response = await api.get('/resumes/history');
        const list = response.data.history || [];
        setResumes(list);
        
        // Check if redirect passed a resumeId
        const queryParams = new URLSearchParams(location.search);
        const urlResumeId = queryParams.get('resumeId');
        const stateResumeId = location.state?.resumeId;
        const initialId = urlResumeId || stateResumeId;
        
        if (initialId && list.some(r => r._id === initialId)) {
          setSelectedResumeId(initialId);
        } else if (list.length > 0) {
          // Select most recent by default
          setSelectedResumeId(list[0]._id);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch resumes. Please upload a resume first.');
      } finally {
        setLoadingResumes(false);
      }
    };
    
    fetchResumes();
  }, [location]);

  // Fetch full details of selected resume
  useEffect(() => {
    const fetchSelectedDetails = async () => {
      if (!selectedResumeId) {
        setSelectedResume(null);
        return;
      }
      try {
        const response = await api.get(`/resumes/${selectedResumeId}`);
        const resumeData = response.data.resume;
        setSelectedResume(resumeData);
        
        // Add a message about the switch
        const isAnalyzed = resumeData.score && resumeData.score.overall !== undefined;
        let welcomeMsg = `I've loaded your resume **${resumeData.filename}**.`;
        if (isAnalyzed) {
          welcomeMsg += ` I see your target role is **${resumeData.recommendations.targetRole}** (ATS Score: **${resumeData.score.overall}/100**).\n\nWhat would you like to practice or learn about today?`;
        } else {
          welcomeMsg += ` This resume hasn't been analyzed for an ATS match yet. You can ask general questions or click "Analyze" on the Dashboard.`;
        }
        
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: welcomeMsg }
        ]);
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchSelectedDetails();
  }, [selectedResumeId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || sending) return;

    // Add user message
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSending(true);

    try {
      // Build conversation history (limit to last 10 messages for prompt size)
      const chatHistory = messages
        .filter(m => m.role !== 'system')
        .slice(-10)
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const response = await api.post('/chat', {
        message: text,
        resumeId: selectedResumeId || undefined,
        history: chatHistory
      });

      // Add assistant message
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response.data.response }
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: '❌ **Error**: Failed to get response from AI. Please ensure the Python service is active.' 
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  // Quick Action triggers
  const triggerQuickPrompt = (promptType) => {
    if (!selectedResume) {
      alert('Please upload/select a resume on the left first!');
      return;
    }
    
    const role = selectedResume.recommendations?.targetRole || 'Software Engineer';
    let promptText = '';
    
    switch (promptType) {
      case 'mock':
        promptText = `Let's start a mock interview for the ${role} position. Ask me a technical question related to my target stack or missing skills.`;
        break;
      case 'roadmap':
        promptText = `Please detail my learning roadmap and recommend how I can master the required technologies.`;
        break;
      case 'projects':
        promptText = `Explain the recommended portfolio projects in detail and help me understand how to structure them.`;
        break;
      case 'cover':
        promptText = `Can you write a professional cover letter for a ${role} position tailored to my resume?`;
        break;
      default:
        return;
    }
    
    handleSend(promptText);
  };

  // Inline Custom Markdown Formatter
  const formatMessageContent = (content) => {
    if (!content) return '';
    
    // Split by code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, idx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeLines = part.slice(3, -3).trim().split('\n');
        let lang = 'code';
        if (codeLines[0] && codeLines[0].length < 10 && !codeLines[0].includes(' ') && !codeLines[0].includes('(')) {
          lang = codeLines[0];
          codeLines.shift();
        }
        const code = codeLines.join('\n');
        return (
          <div key={idx} className="my-3 rounded-xl overflow-hidden border border-slate-200/40 dark:border-slate-800/40 bg-slate-950 text-slate-100 font-mono text-xs">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800/40">
              <span>{lang}</span>
              <button 
                onClick={() => navigator.clipboard.writeText(code)}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Copy
              </button>
            </div>
            <pre className="p-4 overflow-x-auto whitespace-pre"><code>{code}</code></pre>
          </div>
        );
      }
      
      // Split by newlines for regular paragraphs and bullet points
      const lines = part.split('\n');
      return (
        <div key={idx} className="space-y-2">
          {lines.map((line, lineIdx) => {
            let renderedLine = line;
            
            // Header check
            if (line.startsWith('### ')) {
              return <h4 key={lineIdx} className="text-sm font-bold text-slate-900 dark:text-white mt-4 mb-1">{line.replace('### ', '')}</h4>;
            }
            if (line.startsWith('## ')) {
              return <h3 key={lineIdx} className="text-base font-bold text-slate-900 dark:text-white mt-5 mb-2">{line.replace('## ', '')}</h3>;
            }
            if (line.startsWith('# ')) {
              return <h2 key={lineIdx} className="text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2">{line.replace('# ', '')}</h2>;
            }
            
            // Bullet point check
            const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
            if (isBullet) {
              renderedLine = line.replace(/^[\s]*[-*]\s+/, '');
            }
            
            // Parse bold text **something**
            const boldParts = renderedLine.split(/(\*\*.*?\*\*)/g);
            const elements = boldParts.map((bp, bpIdx) => {
              if (bp.startsWith('**') && bp.endsWith('**')) {
                return <strong key={bpIdx} className="font-bold text-slate-900 dark:text-white">{bp.slice(2, -2)}</strong>;
              }
              // Parse inline code `something`
              const codeParts = bp.split(/(`.*?`)/g);
              return codeParts.map((cp, cpIdx) => {
                if (cp.startsWith('`') && cp.endsWith('`')) {
                  return <code key={cpIdx} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-[11px] font-semibold">{cp.slice(1, -1)}</code>;
                }
                return cp;
              });
            });
            
            if (isBullet) {
              return (
                <div key={lineIdx} className="flex items-start gap-2 pl-3">
                  <span className="text-indigo-500 dark:text-indigo-400 mt-1.5 shrink-0 select-none">•</span>
                  <span className="flex-1 text-slate-700 dark:text-slate-300">{elements}</span>
                </div>
              );
            }
            
            return line.trim() ? <p key={lineIdx} className="leading-relaxed text-slate-700 dark:text-slate-300">{elements}</p> : <div key={lineIdx} className="h-1"></div>;
          })}
        </div>
      );
    });
  };

  const isAnalyzed = selectedResume?.score?.overall !== undefined;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6 min-h-[calc(100vh-4rem)]">
        
        {/* Left Panel: Profile Context & Resume Selector */}
        <div className="w-full md:w-80 shrink-0 flex flex-col gap-4">
          <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 p-5 rounded-2xl flex flex-col gap-4 shadow-sm">
            <div>
              <h2 className="font-display font-extrabold text-lg flex items-center gap-2">
                <BrainCircuit size={20} className="text-indigo-500" />
                Resume Selector
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Select a profile to load into RAG context.</p>
            </div>
            
            {loadingResumes ? (
              <div className="flex justify-center py-4">
                <RefreshCw className="animate-spin text-slate-400" size={20} />
              </div>
            ) : resumes.length === 0 ? (
              <div className="text-center py-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-2">No resumes found</p>
                <Link to="/upload" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                  Upload now →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Select Resume</label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="" disabled>-- Choose a Resume --</option>
                  {resumes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.filename}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Active Context Card */}
          {selectedResume && (
            <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 p-5 rounded-2xl shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FileText size={16} className="text-indigo-600 dark:text-indigo-400" />
                  Active Profile Context
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{selectedResume.filename}</p>
              </div>

              {isAnalyzed ? (
                <div className="flex flex-col gap-4">
                  {/* Score & Role */}
                  <div className="flex items-center gap-3 bg-slate-100/50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/30 dark:border-slate-800/10">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 font-extrabold text-indigo-600 dark:text-indigo-400">
                      {selectedResume.score.overall}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Target Role</div>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                        {selectedResume.recommendations.targetRole}
                      </div>
                    </div>
                  </div>

                  {/* Missing Skills clickable tags */}
                  {selectedResume.recommendations.missingSkills && selectedResume.recommendations.missingSkills.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Missing Skills (click to ask)</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedResume.recommendations.missingSkills.slice(0, 8).map((skill, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(`How can I master ${skill} and build projects with it?`)}
                            className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions shortcut list */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Quick Actions</span>
                    <button
                      onClick={() => triggerQuickPrompt('mock')}
                      className="w-full flex justify-between items-center text-xs font-semibold px-3 py-2 bg-indigo-50/50 hover:bg-indigo-50 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 border border-indigo-100/40 dark:border-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400 text-left transition-colors cursor-pointer"
                    >
                      <span>🤖 Start Mock Interview</span>
                      <ArrowRight size={12} />
                    </button>
                    <button
                      onClick={() => triggerQuickPrompt('roadmap')}
                      className="w-full flex justify-between items-center text-xs font-semibold px-3 py-2 bg-indigo-50/50 hover:bg-indigo-50 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 border border-indigo-100/40 dark:border-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400 text-left mt-1.5 transition-colors cursor-pointer"
                    >
                      <span>📈 Learning Roadmap breakdown</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50/50 dark:bg-amber-950/15 border border-amber-200/40 dark:border-amber-900/10 p-3.5 rounded-xl">
                  <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span>
                      Resume not analyzed. Visit the <Link to="/dashboard" className="font-bold underline">Dashboard</Link> to run analysis.
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel: Chat Pane */}
        <div className="flex-1 flex flex-col glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-3xl shadow-sm overflow-hidden min-h-[500px]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/40 flex items-center justify-between bg-white/40 dark:bg-slate-900/20 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/10 shrink-0">
                <Cpu size={20} className="animate-pulse-slow" />
              </div>
              <div>
                <h2 className="font-display font-extrabold text-sm text-slate-800 dark:text-white">AI Career Assistant</h2>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold uppercase tracking-wider mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  RAG Knowledge Retrieval Online
                </div>
              </div>
            </div>
          </div>

          {/* Conversation history */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(100vh-21rem)] md:max-h-[calc(100vh-17rem)]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border text-xs
                  ${m.role === 'user' 
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300' 
                    : 'bg-indigo-50 dark:bg-indigo-950/55 border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold'
                  }`}
                >
                  {m.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                </div>

                {/* Text Bubble */}
                <div className={`p-4 rounded-2xl text-sm border transition-all duration-200 shadow-sm
                  ${m.role === 'user'
                    ? 'bg-indigo-600 text-white border-indigo-700 rounded-tr-none'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200/50 dark:border-slate-800/40 rounded-tl-none'
                  }`}
                >
                  {m.role === 'user' ? (
                    <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  ) : (
                    <div className="space-y-1.5">
                      {formatMessageContent(m.content)}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Sparkles size={14} className="animate-spin" />
                </div>
                <div className="bg-white dark:bg-slate-900 text-slate-400 border border-slate-200/50 dark:border-slate-800/40 px-4 py-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-1.5 font-medium shadow-sm">
                  <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                  <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                  Retrieving resume chunks and consulting assistant...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick-select Chip Suggestions */}
          {selectedResume && isAnalyzed && (
            <div className="px-6 pb-2 pt-1 flex flex-wrap gap-1.5 overflow-x-auto">
              <button
                onClick={() => triggerQuickPrompt('mock')}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-800/40 transition-colors cursor-pointer shrink-0"
              >
                🤖 Mock Interview
              </button>
              <button
                onClick={() => triggerQuickPrompt('roadmap')}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-800/40 transition-colors cursor-pointer shrink-0"
              >
                📈 Roadmap Steps
              </button>
              <button
                onClick={() => triggerQuickPrompt('projects')}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-800/40 transition-colors cursor-pointer shrink-0"
              >
                🛠️ Project Breakdown
              </button>
              <button
                onClick={() => triggerQuickPrompt('cover')}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-800/40 transition-colors cursor-pointer shrink-0"
              >
                📝 Write Cover Letter
              </button>
            </div>
          )}

          {/* Form input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-4 border-t border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/20 backdrop-blur-sm flex items-center gap-3"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                selectedResume 
                  ? `Ask about your ${selectedResume.recommendations?.targetRole || 'Software Engineer'} roadmap, profile...`
                  : "Select a resume on the left or type a general query..."
              }
              className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200 transition-colors"
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl h-11 w-11 flex items-center justify-center shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:shadow-none hover:-translate-y-0.5 disabled:translate-y-0 transition-all cursor-pointer"
            >
              <Send size={18} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Chat;
