import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  MessageSquare,
  X,
  Send,
  Cpu,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  Package,
  Clock,
  ShieldAlert,
  ArrowRight,
  User,
  CheckCircle2
} from 'lucide-react';
import { AiAgent } from '../../types';

interface Message {
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
  status?: string;
  approvalId?: string;
  isApprovalNotice?: boolean;
}

export const AiStorefrontChat: React.FC = () => {
  const { addToast } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [agents, setAgents] = useState<AiAgent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent_sales');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'agent',
      text: 'Salam! Main aapka AI Storefront Assistant hoon. Main aapki shopping, refund ya order cancellations mein madad kar sakta hoon. Koi bhi sawal poochhein!',
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch active agents list for selection
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch('/api/agents');
        if (res.ok) {
          const data = await res.json();
          // Filter only active customer-facing agents
          const filtered = data.filter((a: any) =>
            ['agent_sales', 'agent_support', 'agent_order', 'agent_return_refund'].includes(a.id)
          );
          setAgents(filtered);
        }
      } catch (err) {
        console.error('Failed to load agents in storefront chat', err);
      }
    };
    fetchAgents();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');

    try {
      setIsTyping(true);

      const response = await fetch('/api/agents/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgentId,
          customerQuery: textToSend
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add agent response
        const agentMsg: Message = {
          sender: 'agent',
          text: data.agentResponse,
          timestamp: new Date()
        };
        
        setMessages((prev) => [...prev, agentMsg]);

        // If approval triggers, add a special system notification message
        if (data.approvalRequired) {
          const approvalMsg: Message = {
            sender: 'agent',
            isApprovalNotice: true,
            text: `⚠️ Human Admin review required. Status: PENDING.`,
            status: 'PENDING_APPROVAL',
            approvalId: data.approvalId,
            timestamp: new Date()
          };
          setMessages((prev) => [...prev, approvalMsg]);
          addToast('Action flagged! Admin verification request created.', 'info');
        }
      } else {
        throw new Error('Failed response');
      }
    } catch (err) {
      addToast('AI Agent currently unavailable. Please try again.', 'error');
      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: 'Maazrat! Server connection issue ki wajah se response nahi generate ho saka.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const getAgentIcon = (id: string) => {
    switch (id) {
      case 'agent_sales': return <ShoppingBag className="w-4 h-4 text-amber-500" />;
      case 'agent_support': return <MessageSquare className="w-4 h-4 text-indigo-500" />;
      case 'agent_order': return <Package className="w-4 h-4 text-emerald-500" />;
      case 'agent_return_refund': return <RotateCcw className="w-4 h-4 text-rose-500" />;
      default: return <Cpu className="w-4 h-4 text-slate-500" />;
    }
  };

  const activeAgent = agents.find(a => a.id === selectedAgentId);

  const samplePrompts = [
    { label: '🛍️ Suggest premium laptop', query: 'Recommend a premium high-performance laptop for graphic design work.' },
    { label: '💬 Refund policy info', query: 'What is your store refund policy? Can I return an item?' },
    { label: '📦 Cancel my order', query: 'Mera high-value order AURA-29831 cancel kar do please.' },
    { label: '🔄 Ask for refund', query: 'Initiate dynamic refund process for my purchase.' }
  ];

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105 group active:scale-95"
          id="storefront-ai-agent-chat-btn"
          title="Talk to AI Storefront Assistant"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 font-extrabold text-[9px] px-1.5 py-0.5 rounded-full border-2 border-white animate-bounce">
              AI
            </span>
          )}
        </button>
      </div>

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          id="storefront-ai-agent-chat-window"
          className="fixed bottom-24 right-6 w-[380px] h-[550px] bg-white rounded-3xl border border-slate-200/80 shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
                  <Cpu className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm leading-none flex items-center gap-1.5">
                    Aura AI Assistant <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  </h3>
                  <span className="text-[10px] text-indigo-300 font-semibold mt-0.5 block">Store compliance agent framework</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Agent Selection Pill */}
            <div className="bg-slate-800 rounded-xl p-2 flex items-center gap-2 border border-slate-700/50">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider shrink-0 pl-1">Talk To:</span>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="flex-1 bg-slate-950 text-slate-100 text-xs font-bold border-none rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {agents.length > 0 ? (
                  agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="agent_sales">🛍️ Sales & Recommendation Agent</option>
                    <option value="agent_support">💬 Customer Support Agent</option>
                    <option value="agent_order">📦 Order Tracker & Cancel Agent</option>
                    <option value="agent_return_refund">🔄 Returns & Refund Agent</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scrollbar-thin">
            {messages.map((msg, index) => {
              if (msg.isApprovalNotice) {
                return (
                  <div key={index} className="bg-amber-50 border border-amber-200/80 p-3 rounded-2xl space-y-2 text-xs">
                    <p className="font-extrabold text-amber-800 flex items-center gap-1">
                      <ShieldAlert className="w-4 h-4 text-amber-500" /> {msg.text}
                    </p>
                    <div className="flex items-center justify-between font-mono text-[10px] text-amber-700 bg-amber-100/50 px-2 py-1 rounded-lg">
                      <span>ID: {msg.approvalId}</span>
                      <span className="bg-amber-500 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-wider scale-90">Pending Admin</span>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">Go to Admin Sidebar &gt; AI Agent Permissions &gt; Approvals to sign off this request!</p>
                  </div>
                );
              }

              const isUser = msg.sender === 'user';
              return (
                <div key={index} className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-7 h-7 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm">
                      AI
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-2xl max-w-[80%] text-xs leading-relaxed font-bold shadow-xs ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200/60 rounded-tl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className={`block text-[9px] mt-1 font-semibold ${isUser ? 'text-indigo-200 text-right' : 'text-slate-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {isUser && (
                    <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 border border-slate-300/40">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-7 h-7 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm animate-pulse">
                  AI
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick templates wrapper */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 shrink-0">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Suggested Prompts:</p>
              <div className="flex flex-col gap-1">
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p.query)}
                    className="text-left bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-slate-700 truncate cursor-pointer transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-100 shrink-0 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask ${activeAgent?.name.split(' ').slice(1).join(' ') || 'Agent'}...`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 text-white p-2.5 rounded-xl cursor-pointer transition-colors active:scale-95 flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
