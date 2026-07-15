import React, { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import api from "../utils/api";

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! I'm NextHire — how can I help you today? Try: 'Analyze my resume'",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text) => {
    if (!text) return;
    const userMsg = { from: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const resp = await api.post("/chat/public", {
        message: text,
        history: [],
      });
      const botText = resp.data?.response || "Sorry, no response.";
      setMessages((m) => [...m, { from: "bot", text: botText }]);
    } catch (e) {
      const serverMsg =
        e?.response?.data?.message || e.message || "Failed to reach server.";
      setMessages((m) => [...m, { from: "bot", text: serverMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
  };

  return (
    <div className="fixed right-6 bottom-6 z-50">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-full shadow-lg"
          aria-label="Open chat"
        >
          <MessageSquare size={16} />
          Help
        </button>
      )}

      {open && (
        <div className="w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/40 dark:border-slate-800/40 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800/30">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-indigo-600" />
              <div className="font-semibold">NextHire Assistant</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 text-slate-500 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          </div>
          <div className="px-3 py-2 max-h-64 overflow-y-auto space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.from === "bot" ? "" : "justify-end"}`}
              >
                <div
                  className={`text-sm p-2 rounded-lg ${m.from === "bot" ? "bg-slate-100 dark:bg-slate-800/40 text-slate-800" : "bg-indigo-600 text-white"}`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <form
            onSubmit={onSubmit}
            className="p-2 border-t border-slate-100 dark:border-slate-800/30"
          >
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={loading ? "Waiting..." : "Ask me something..."}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-3 py-2 rounded-lg"
              >
                {loading ? "..." : "Send"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
