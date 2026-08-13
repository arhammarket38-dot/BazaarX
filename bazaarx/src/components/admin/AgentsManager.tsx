import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Cpu,
  ShoppingBag,
  MessageSquare,
  Package,
  Search,
  CreditCard,
  Truck,
  RotateCcw,
  BarChart3,
  Warehouse,
  Megaphone,
  ShieldAlert,
  Briefcase,
  GitMerge,
  Shield,
  Check,
  X,
  Sliders,
  Database,
  BookOpen,
  Coins,
  Clock,
  Activity,
  ArrowRight,
  Lock,
  Unlock,
  Send,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { AiAgent, AgentApprovalRequest, AgentActivityLog, AgentPermissionLevel } from '../../types';

export const AgentsManager: React.FC = () => {
  const { addToast } = useStore();
  const [agents, setAgents] = useState<AiAgent[]>([]);
  const [approvals, setApprovals] = useState<AgentApprovalRequest[]>([]);
  const [activityLogs, setActivityLogs] = useState<AgentActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs: 'agents' | 'approvals' | 'sandbox' | 'dashboard'
  const [activeTab, setActiveTab] = useState<'agents' | 'approvals' | 'sandbox' | 'dashboard'>('dashboard');
  
  // Selected Agent
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent_sales');

  // Interactive Sandbox state
  const [sandboxAgentId, setSandboxAgentId] = useState<string>('agent_order');
  const [customQuery, setCustomQuery] = useState<string>('');
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    success: boolean;
    agentResponse: string;
    stepOutputs: string[];
    approvalRequired: boolean;
    approvalId?: string;
    status: string;
  } | null>(null);

  // Rejection modal state
  const [rejectionRequestId, setRejectionRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Fetch all agents and logs
  const fetchData = async () => {
    try {
      setLoading(true);
      const [agentsRes, approvalsRes, logsRes] = await Promise.all([
        fetch('/api/agents'),
        fetch('/api/agents/approvals'),
        fetch('/api/agents/logs')
      ]);

      if (agentsRes.ok && approvalsRes.ok && logsRes.ok) {
        const agentsData = await agentsRes.json();
        const approvalsData = await approvalsRes.json();
        const logsData = await logsRes.json();

        setAgents(agentsData);
        setApprovals(approvalsData);
        setActivityLogs(logsData);

        // Fallback selection if current doesn't exist
        if (agentsData.length > 0 && !agentsData.find((a: AiAgent) => a.id === selectedAgentId)) {
          setSelectedAgentId(agentsData[0].id);
        }
      }
    } catch {
      addToast('Failed fetching AI agent permission registries', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  // Toggle status (Active / Inactive)
  const handleToggleStatus = async (agent: AiAgent) => {
    const nextStatus = agent.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        addToast(`${agent.name} is now ${nextStatus}`, 'success');
        fetchData();
      }
    } catch {
      addToast('Failed to change agent status', 'error');
    }
  };

  // Save full configurations
  const handleSaveConfig = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAgent) return;

    const formData = new FormData(e.currentTarget);
    const updatedFields = {
      permissionLevel: formData.get('permissionLevel') as AgentPermissionLevel,
      humanApprovalRequired: formData.get('humanApprovalRequired') === 'true',
      tokenLimitPerDay: parseInt(formData.get('tokenLimitPerDay') as string) || 500000,
      monthlyBudgetUsd: parseFloat(formData.get('monthlyBudgetUsd') as string) || 50.00,
      aiModel: formData.get('aiModel') as string,
    };

    try {
      const res = await fetch(`/api/agents/${selectedAgent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      if (res.ok) {
        addToast('Agent security parameters saved successfully!', 'success');
        fetchData();
      }
    } catch {
      addToast('Failed to update agent configurations', 'error');
    }
  };

  // Add assigned task or knowledge source
  const handleAddMetadata = async (type: 'assignedTasks' | 'knowledgeSources', value: string) => {
    if (!selectedAgent || !value.trim()) return;
    const newList = [...selectedAgent[type], value.trim()];
    try {
      const res = await fetch(`/api/agents/${selectedAgent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [type]: newList }),
      });
      if (res.ok) {
        addToast(`Added item to ${type === 'assignedTasks' ? 'Tasks' : 'Knowledge Sources'}`, 'success');
        fetchData();
      }
    } catch {
      addToast('Failed updating metadata', 'error');
    }
  };

  // Delete metadata item
  const handleDeleteMetadata = async (type: 'assignedTasks' | 'knowledgeSources', index: number) => {
    if (!selectedAgent) return;
    const newList = [...selectedAgent[type]];
    newList.splice(index, 1);
    try {
      const res = await fetch(`/api/agents/${selectedAgent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [type]: newList }),
      });
      if (res.ok) {
        addToast('Removed item successfully', 'success');
        fetchData();
      }
    } catch {
      addToast('Failed deleting item', 'error');
    }
  };

  // Respond to approvals (Approve / Reject)
  const handleRespondApproval = async (id: string, status: 'APPROVED' | 'REJECTED', reason = '') => {
    try {
      const res = await fetch(`/api/agents/approvals/${id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejectionReason: reason }),
      });

      if (res.ok) {
        addToast(`Request ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully!`, 'success');
        setRejectionRequestId(null);
        setRejectionReason('');
        fetchData();
      }
    } catch {
      addToast('Failed responding to approval request', 'error');
    }
  };

  // Run Simulator Sandbox query
  const handleRunSimulation = async (queryText?: string) => {
    const q = queryText || customQuery;
    if (!q.trim()) {
      addToast('Please enter a query or select a template', 'info');
      return;
    }

    try {
      setSimulating(true);
      setSimulationResult(null);
      const res = await fetch('/api/agents/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: sandboxAgentId,
          customerQuery: q,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSimulationResult(data);
        fetchData(); // reload logs & any new approvals
      }
    } catch {
      addToast('Failed to execute agent simulation', 'error');
    } finally {
      setSimulating(false);
    }
  };

  // Render correct icon based on name
  const getAgentIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5 text-amber-500" />;
      case 'MessageSquare': return <MessageSquare className="w-5 h-5 text-indigo-500" />;
      case 'Package': return <Package className="w-5 h-5 text-emerald-500" />;
      case 'Search': return <Search className="w-5 h-5 text-blue-500" />;
      case 'CreditCard': return <CreditCard className="w-5 h-5 text-rose-500" />;
      case 'Truck': return <Truck className="w-5 h-5 text-amber-500" />;
      case 'RotateCcw': return <RotateCcw className="w-5 h-5 text-orange-500" />;
      case 'BarChart3': return <BarChart3 className="w-5 h-5 text-cyan-500" />;
      case 'Warehouse': return <Warehouse className="w-5 h-5 text-violet-500" />;
      case 'Megaphone': return <Megaphone className="w-5 h-5 text-teal-500" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-pink-500" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-slate-500" />;
      case 'GitMerge': return <GitMerge className="w-5 h-5 text-fuchsia-500" />;
      default: return <Cpu className="w-5 h-5 text-slate-500" />;
    }
  };

  // Permission descriptions
  const getPermissionDesc = (level: AgentPermissionLevel) => {
    switch (level) {
      case 'READ_ONLY': return 'Products, category catalogs aur client orders ko retrieve aur view karne ka limited access.';
      case 'ASSIST': return 'Customer inquiries par natural response, recommendations generate karna, aur simple management analysis compile karna.';
      case 'ACTION': return 'Shopping carts draft karna, new active orders initiate karna, system coupons apply karna, aur notification process triggers.';
      case 'ADVANCED_ACTION': return 'Active orders modify karna, refunds trigger process karna, product stock levels change karna, aur dynamic marketing coupon and campaign create execution.';
      case 'ADMIN_APPROVAL_REQUIRED': return 'State changes are calculated, but locked until a human Administrator explicitly signs-off from the approval grid.';
      case 'FULL_ACCESS': return 'Complete backend capabilities. Direct unmodified write privileges, requiring active Super Admin sign-off.';
      default: return '';
    }
  };

  // Quick simulation template list
  const templates = [
    { label: '🛍️ Recommend Laptop', query: 'Recommend me a premium high-performance laptop for graphic design work.', agentId: 'agent_sales' },
    { label: '💬 Refund Policy', query: 'What is your store refund policy? Can I return a jacket bought 40 days ago?', agentId: 'agent_support' },
    { label: '📦 Cancel Order (Trigger Request)', query: 'Mera high-value order AURA-29831 cancel kar do please.', agentId: 'agent_order' },
    { label: '🔄 Initiate Refund (Trigger Request)', query: 'Initiate dynamic refund process for my purchase.', agentId: 'agent_return_refund' },
  ];

  if (loading && agents.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <Activity className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-bold text-sm">Loading AI agent permission frameworks...</p>
        </div>
      </div>
    );
  }

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'PENDING').length;
  const activeAgentsCount = agents.filter((a) => a.status === 'ACTIVE').length;

  // Calculations for Visual Cost & Performance Dashboard
  const totalTokensToday = agents.reduce((sum, a) => sum + (a.tokensUsedToday || 0), 0);
  const totalMonthlyBudget = agents.reduce((sum, a) => sum + (a.monthlyBudgetUsd || 0), 0);
  const totalSpentUsd = agents.reduce((sum, a) => sum + (a.spentUsd || 0), 0);
  const totalExecutions = agents.reduce((sum, a) => sum + (a.activityCount || 0), 0);

  // Group logs by date for historical burn chart
  const logsByDate = activityLogs.reduce((acc: Record<string, number>, log) => {
    const dateStr = new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
    acc[dateStr] = (acc[dateStr] || 0) + log.tokensUsed;
    return acc;
  }, {});

  const historyData = Object.entries(logsByDate).map(([date, tokens]) => ({
    date,
    Tokens: tokens
  })).slice(-7);

  const finalHistoryData = historyData.length > 0 ? historyData : [
    { date: 'Aug 06', Tokens: 12500 },
    { date: 'Aug 07', Tokens: 24000 },
    { date: 'Aug 08', Tokens: 15400 },
    { date: 'Aug 09', Tokens: 32900 },
    { date: 'Aug 10', Tokens: 21000 },
    { date: 'Aug 11', Tokens: 43000 },
    { date: 'Aug 12', Tokens: totalTokensToday || 28500 },
  ];

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Overview Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-extrabold tracking-widest text-blue-600 uppercase">System Security</span>
          <h1 className="text-2xl font-black text-slate-950 mt-1 flex items-center gap-2">
            <Cpu className="w-7 h-7 text-blue-600" /> AI Agent Permissions Framework
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Configure agent permission thresholds, approval guardrails, audit logging, and evaluate execution in the interactive trace sandbox.
          </p>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase">Total Agents</p>
              <p className="text-sm font-black text-slate-800">{agents.length} <span className="text-xs font-normal text-slate-500">({activeAgentsCount} Active)</span></p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-3 text-left ${
              pendingApprovalsCount > 0
                ? 'bg-amber-50/50 border-amber-200 text-amber-800 hover:bg-amber-50'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className={`p-2 rounded-lg ${pendingApprovalsCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase">Pending Approvals</p>
              <p className="text-sm font-black text-slate-800">
                {pendingApprovalsCount} <span className="text-xs font-normal text-slate-500">Action Keys</span>
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-3 text-left ${
              activeTab === 'sandbox'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className={`p-2 rounded-lg ${activeTab === 'sandbox' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase">Simulator</p>
              <p className="text-sm font-black text-slate-800">Sandbox Playground</p>
            </div>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('agents')}
          className={`px-5 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'agents'
              ? 'border-blue-600 text-blue-600 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" /> Manage AI Agents ({agents.length})
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-5 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 relative ${
            activeTab === 'approvals'
              ? 'border-blue-600 text-blue-600 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" /> Admin Approvals Queue
          {pendingApprovalsCount > 0 && (
            <span className="absolute top-2.5 right-1.5 bg-rose-500 text-white font-extrabold text-[10px] h-4 min-w-4 px-1 rounded-full flex items-center justify-center animate-pulse">
              {pendingApprovalsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`px-5 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'sandbox'
              ? 'border-blue-600 text-blue-600 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" /> Security Trace Sandbox
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-5 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'dashboard'
              ? 'border-blue-600 text-blue-600 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Usage & Cost Dashboard
        </button>
      </div>

      {/* 1. MANAGE AI AGENTS TAB */}
      {activeTab === 'agents' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Agents List */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
              <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">Agents Directory</h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`w-full p-4 text-left flex items-start gap-3 transition-all ${
                    selectedAgentId === agent.id
                      ? 'bg-blue-50/40 border-l-4 border-blue-600'
                      : 'hover:bg-slate-50/60 border-l-4 border-transparent'
                  }`}
                >
                  <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                    {getAgentIcon(agent.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-xs text-slate-800 truncate">{agent.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 ${
                        agent.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {agent.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{agent.role}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-semibold">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded-sm font-bold text-slate-600">{agent.permissionLevel}</span>
                      <span>Logs: {agent.activityCount}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Configurations & Parameters */}
          <div className="lg:col-span-8 space-y-6">
            {selectedAgent ? (
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
                {/* Agent Header Banner */}
                <div className="bg-slate-900 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-xl text-white">
                      {getAgentIcon(selectedAgent.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black">{selectedAgent.name}</h2>
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-sm font-mono text-slate-300">
                          {selectedAgent.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{selectedAgent.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-300">Status Active</span>
                    <button
                      onClick={() => handleToggleStatus(selectedAgent)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        selectedAgent.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          selectedAgent.status === 'ACTIVE' ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Descriptions block */}
                  <div className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-200/50">
                    <h4 className="font-extrabold text-[11px] text-slate-400 uppercase tracking-wider">Functional Role description</h4>
                    <p className="text-slate-700 font-bold text-sm mt-1">{selectedAgent.description}</p>
                  </div>

                  {/* Config Form */}
                  <form onSubmit={handleSaveConfig} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-extrabold uppercase text-slate-500 mb-2">Permission Level</label>
                        <select
                          name="permissionLevel"
                          defaultValue={selectedAgent.permissionLevel}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="READ_ONLY">READ_ONLY (Read catalog and orders)</option>
                          <option value="ASSIST">ASSIST (Interact, recommend, summaries)</option>
                          <option value="ACTION">ACTION (Carts, Coupons, Orders, Notification write)</option>
                          <option value="ADVANCED_ACTION">ADVANCED_ACTION (Modify, Refund, Stock, Create campaigns)</option>
                          <option value="ADMIN_APPROVAL_REQUIRED">ADMIN_APPROVAL_REQUIRED (Locked actions queueing)</option>
                          <option value="FULL_ACCESS">FULL_ACCESS (Unrestricted - Requires Super Admin)</option>
                        </select>
                        <p className="text-[11px] text-slate-500 font-bold mt-2 italic bg-blue-50/40 p-2.5 rounded-md border border-blue-200/20">
                          {getPermissionDesc(selectedAgent.permissionLevel)}
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold uppercase text-slate-500 mb-2">AI Engine Model</label>
                        <select
                          name="aiModel"
                          defaultValue={selectedAgent.aiModel}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                        >
                          <option value="gemini-3.6-flash">gemini-3.6-flash (Fast, analytical, multi-lingual)</option>
                          <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Advanced developer reasoning)</option>
                        </select>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-extrabold text-slate-700">Require Human Sign-off</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Enforces approval requests for all mutate APIs.</p>
                          </div>
                          <select
                            name="humanApprovalRequired"
                            defaultValue={selectedAgent.humanApprovalRequired ? 'true' : 'false'}
                            className="bg-white border border-slate-300 rounded-md px-2 py-1 text-xs font-bold"
                          >
                            <option value="true">YES</option>
                            <option value="false">NO</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                      <div>
                        <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">Max Token Quota (Per Day)</label>
                        <input
                          type="number"
                          name="tokenLimitPerDay"
                          defaultValue={selectedAgent.tokenLimitPerDay}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-800"
                        />
                        <div className="mt-2 flex justify-between text-[11px] font-semibold text-slate-400">
                          <span>Used: {selectedAgent.tokensUsedToday.toLocaleString()} tokens</span>
                          <span>Reset occurs at midnight</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">Monthly API Budget (USD)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-slate-400 font-black text-sm">$</span>
                          <input
                            type="number"
                            step="0.01"
                            name="monthlyBudgetUsd"
                            defaultValue={selectedAgent.monthlyBudgetUsd}
                            className="w-full bg-white border border-slate-300 rounded-lg pl-7 pr-3 py-2 text-sm font-bold text-slate-800"
                          />
                        </div>
                        <div className="mt-2 flex justify-between text-[11px] font-semibold text-slate-400">
                          <span>Spent: ${selectedAgent.spentUsd.toFixed(2)} USD</span>
                          <span>Limit: ${selectedAgent.monthlyBudgetUsd.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg transition-all"
                      >
                        Save Guardrail Configuration
                      </button>
                    </div>
                  </form>

                  {/* Metadata list grids */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-slate-100">
                    {/* Knowledge Sources */}
                    <div>
                      <h3 className="font-extrabold text-xs uppercase text-slate-800 tracking-wider mb-3 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-blue-600" /> Knowledge Corpora & Context
                      </h3>
                      <div className="space-y-1.5">
                        {selectedAgent.knowledgeSources.map((source, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-200/50 rounded-lg px-3 py-2 flex items-center justify-between gap-2 text-xs font-bold text-slate-700">
                            <span className="truncate">{source}</span>
                            <button
                              onClick={() => handleDeleteMetadata('knowledgeSources', idx)}
                              className="text-slate-400 hover:text-rose-600 shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const input = e.currentTarget.elements.namedItem('newItem') as HTMLInputElement;
                            handleAddMetadata('knowledgeSources', input.value);
                            input.value = '';
                          }}
                          className="flex gap-2 mt-2"
                        >
                          <input
                            name="newItem"
                            placeholder="Add metadata doc..."
                            className="flex-1 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none"
                          />
                          <button type="submit" className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-black">
                            Add
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Assigned Tasks */}
                    <div>
                      <h3 className="font-extrabold text-xs uppercase text-slate-800 tracking-wider mb-3 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Authorized Execution Scope
                      </h3>
                      <div className="space-y-1.5">
                        {selectedAgent.assignedTasks.map((task, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-200/50 rounded-lg px-3 py-2 flex items-center justify-between gap-2 text-xs font-bold text-slate-700">
                            <span className="truncate">{task}</span>
                            <button
                              onClick={() => handleDeleteMetadata('assignedTasks', idx)}
                              className="text-slate-400 hover:text-rose-600 shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const input = e.currentTarget.elements.namedItem('newItem') as HTMLInputElement;
                            handleAddMetadata('assignedTasks', input.value);
                            input.value = '';
                          }}
                          className="flex gap-2 mt-2"
                        >
                          <input
                            name="newItem"
                            placeholder="Add task directive..."
                            className="flex-1 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none"
                          />
                          <button type="submit" className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-black">
                            Add
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* Allowed Action Badges */}
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <h3 className="font-extrabold text-xs uppercase text-slate-800 tracking-wider mb-3 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-blue-600" /> Allowed Execution API / Tool Triggers
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedAgent.allowedActions.map((action, index) => (
                        <span key={index} className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs font-extrabold">
                          tool::{action}()
                        </span>
                      ))}
                      {selectedAgent.approvalTriggers.length > 0 && (
                        <div className="w-full mt-4 bg-amber-50/50 border border-amber-200/50 p-4 rounded-xl space-y-2">
                          <p className="text-xs font-extrabold text-amber-800 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4 text-amber-500" /> Active Policy Approval Rules
                          </p>
                          <ul className="list-disc list-inside text-[11px] text-amber-800 font-bold space-y-1">
                            {selectedAgent.approvalTriggers.map((rule, idx) => (
                              <li key={idx}>{rule}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-slate-400">
                Select an agent from the directory to review and update configurations.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. ADMIN APPROVALS QUEUE */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800">Pending Execution Sign-offs</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  AI Agents require direct human authorization before triggering fund writebacks or critical order alterations.
                </p>
              </div>
              <span className="bg-amber-100 text-amber-800 border border-amber-200 text-xs font-black px-3 py-1 rounded-full animate-pulse">
                {pendingApprovalsCount} Requests Pending
              </span>
            </div>

            {approvals.filter((a) => a.status === 'PENDING').length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-white">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="font-bold text-slate-800 text-sm">Security clearance complete!</p>
                <p className="text-xs text-slate-400 mt-1">There are no pending authorization requests in the queue.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 bg-white">
                {approvals
                  .filter((a) => a.status === 'PENDING')
                  .map((req) => (
                    <div key={req.id} className="p-6 hover:bg-slate-50/40 transition-all">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-slate-100 text-slate-700 font-mono text-[10px] font-black px-2.5 py-0.5 rounded-sm border border-slate-200">
                              {req.id}
                            </span>
                            <span className="bg-amber-50 text-amber-800 border border-amber-100 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">
                              {req.actionType}
                            </span>
                            <span className="text-xs text-slate-500 font-bold">
                              Requested by {req.agentName}
                            </span>
                          </div>

                          <h4 className="text-sm font-black text-slate-900">{req.requestDetails}</h4>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold pt-2">
                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/40">
                              <span className="text-[10px] text-slate-400 uppercase block font-extrabold">Customer</span>
                              <span className="text-slate-700 mt-0.5 block">{req.customerName || 'N/A'}</span>
                              <span className="text-slate-400 text-[10px] block font-semibold truncate">{req.customerEmail || ''}</span>
                            </div>

                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/40">
                              <span className="text-[10px] text-slate-400 uppercase block font-extrabold">Target Entity</span>
                              <span className="text-slate-700 mt-0.5 block">{req.targetEntity}</span>
                              <span className="text-slate-400 text-[10px] block font-mono">ID: {req.targetEntityId}</span>
                            </div>

                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/40">
                              <span className="text-[10px] text-slate-400 uppercase block font-extrabold">Proposed Payloads</span>
                              {req.proposedData ? (
                                <pre className="text-[10px] text-slate-700 mt-1 font-mono overflow-x-auto max-h-[60px] scrollbar-thin">
                                  {JSON.stringify(req.proposedData, null, 2)}
                                </pre>
                              ) : (
                                <span className="text-slate-500 block">None</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col gap-2 justify-end shrink-0 pt-2 lg:pt-0">
                          <button
                            onClick={() => handleRespondApproval(req.id, 'APPROVED')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg flex items-center gap-1 justify-center shadow-sm"
                          >
                            <Check className="w-4 h-4" /> Approve Action
                          </button>
                          <button
                            onClick={() => {
                              setRejectionRequestId(req.id);
                              setRejectionReason('');
                            }}
                            className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg flex items-center gap-1 justify-center"
                          >
                            <X className="w-4 h-4" /> Reject Action
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Rejection comment drawer/area if open */}
          {rejectionRequestId && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-500" /> Enter Rejection Reason for #{rejectionRequestId}
              </h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ex: Customer is out of policy return limit or refund conditions not met..."
                className="w-full h-24 p-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setRejectionRequestId(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRespondApproval(rejectionRequestId, 'REJECTED', rejectionReason)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 px-4 rounded-lg"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}

          {/* Historic Approvals log */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
              <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">Historic Sign-off Logs</h3>
            </div>
            {approvals.filter((a) => a.status !== 'PENDING').length === 0 ? (
              <p className="p-8 text-center text-slate-400 text-xs font-bold">No historic authorizations registered.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] text-slate-400 uppercase tracking-wider font-extrabold border-b border-slate-200">
                      <th className="p-4">Request ID</th>
                      <th className="p-4">Agent Name</th>
                      <th className="p-4">Action Type</th>
                      <th className="p-4">Details</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Reviewed By</th>
                      <th className="p-4">Reviewed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {approvals
                      .filter((a) => a.status !== 'PENDING')
                      .map((req) => (
                        <tr key={req.id} className="text-xs hover:bg-slate-50/20">
                          <td className="p-4 font-mono font-bold text-slate-700">{req.id}</td>
                          <td className="p-4 font-bold text-slate-800">{req.agentName}</td>
                          <td className="p-4">
                            <span className="bg-slate-100 text-slate-600 font-bold text-[10px] px-2 py-0.5 rounded-sm">
                              {req.actionType}
                            </span>
                          </td>
                          <td className="p-4 max-w-xs truncate font-medium text-slate-600">{req.requestDetails}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                              req.status === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                                : 'bg-rose-50 text-rose-700 border border-rose-200/50'
                            }`}>
                              {req.status}
                            </span>
                            {req.rejectionReason && (
                              <span className="block text-[10px] text-rose-500 font-medium italic mt-1 truncate">
                                Reason: {req.rejectionReason}
                              </span>
                            )}
                          </td>
                          <td className="p-4 font-bold text-slate-700">{req.reviewedBy || 'N/A'}</td>
                          <td className="p-4 text-slate-400 font-semibold">{req.reviewedAt ? new Date(req.reviewedAt).toLocaleString() : ''}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SECURITY TRACE SANDBOX PLAYGROUND */}
      {activeTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Simulation setup */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-5">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <Sliders className="w-5 h-5 text-blue-600" /> Interactive Execution Simulator
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  Test and trace exactly how AI agents resolve commands. Ensure permission guardrails trigger perfectly.
                </p>
              </div>

              {/* Target Selector */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-500 mb-2">Select Sandbox Agent</label>
                <div className="grid grid-cols-1 gap-2">
                  {agents.map((ag) => (
                    <button
                      key={ag.id}
                      onClick={() => setSandboxAgentId(ag.id)}
                      className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${
                        sandboxAgentId === ag.id
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {getAgentIcon(ag.icon)}
                      <div>
                        <p className="text-xs font-bold">{ag.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{ag.permissionLevel} Limit • Model: {ag.aiModel}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Templates */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-500 mb-2">Instant Test Statements</label>
                <div className="grid grid-cols-1 gap-2">
                  {templates.map((tpl, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSandboxAgentId(tpl.agentId);
                        setCustomQuery(tpl.query);
                      }}
                      className="text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded text-[11px] font-bold text-slate-700 truncate"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-500 mb-2">Customer Conversation Input</label>
                <div className="flex gap-2">
                  <input
                    value={customQuery}
                    onChange={(e) => setCustomQuery(e.target.value)}
                    placeholder="Mera order cancel kar do..."
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRunSimulation();
                    }}
                  />
                  <button
                    onClick={() => handleRunSimulation()}
                    disabled={simulating}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg shrink-0 flex items-center gap-1.5"
                  >
                    {simulating ? <Activity className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Simulate Trace
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Trace Output */}
          <div className="lg:col-span-7 space-y-6">
            {simulationResult ? (
              <div className="space-y-6">
                {/* Visual Security Trace Graph */}
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 text-white space-y-5 shadow-lg relative overflow-hidden">
                  <div className="absolute top-4 right-4 bg-white/10 px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase">
                    Audit-Grade Trace
                  </div>

                  <h3 className="font-extrabold text-xs uppercase tracking-widest text-indigo-400">Security Execution Ledger</h3>

                  {/* Visual flowchart */}
                  <div className="flex flex-col gap-3 font-mono text-[11px]">
                    {simulationResult.stepOutputs.map((step, index) => (
                      <div key={index} className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <p className="text-slate-200 leading-relaxed font-semibold">{step}</p>
                      </div>
                    ))}
                  </div>

                  {/* Block / Trigger Notification */}
                  {simulationResult.approvalRequired && (
                    <div className="bg-amber-950/60 border border-amber-800/80 p-4 rounded-lg flex items-start gap-3 mt-4 text-amber-200">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-black text-xs text-amber-300">⚠️ Human Administrator Sign-off Required!</p>
                        <p className="text-[11px] mt-1 text-amber-400 font-bold">
                          The requested write transaction has been isolated. A pending sign-off ID `{simulationResult.approvalId}` has been created.
                        </p>
                        <button
                          onClick={() => setActiveTab('approvals')}
                          className="mt-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] uppercase tracking-wider px-3 py-1.5 rounded"
                        >
                          Go to Approvals Grid
                        </button>
                      </div>
                    </div>
                  )}

                  {simulationResult.status === 'REJECTED' && (
                    <div className="bg-rose-950/60 border border-rose-800 p-4 rounded-lg flex items-start gap-3 mt-4 text-rose-200">
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-black text-xs text-rose-300">❌ Access Denied & Policy Blocked</p>
                        <p className="text-[11px] mt-1 text-rose-400 font-bold">
                          Agent does not hold write authorization keys or does not have the tools permitted under its profile. No modifications were recorded.
                        </p>
                      </div>
                    </div>
                  )}

                  {simulationResult.status === 'SUCCESS' && (
                    <div className="bg-emerald-950/60 border border-emerald-800 p-4 rounded-lg flex items-start gap-3 mt-4 text-emerald-200">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-black text-xs text-emerald-300">✅ Authorized Execution Clear</p>
                        <p className="text-[11px] mt-1 text-emerald-400 font-bold">
                          Informational action read-completed within agent knowledge corpus bounds. No critical order mutation occurred.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Simulated Customer UI bubble */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">Simulated Storefront Response</h4>
                  <div className="space-y-4">
                    <div className="flex gap-3 justify-end">
                      <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-2 text-sm font-bold max-w-[85%]">
                        {customQuery}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        AI
                      </div>
                      <div className="bg-slate-100 text-slate-800 rounded-2xl rounded-tl-none px-4 py-2 text-sm font-bold max-w-[85%]">
                        {simulationResult.agentResponse}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 bg-white border border-slate-200 rounded-xl">
                <Sliders className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-slate-700 text-sm">Simulation Output Idle</p>
                <p className="text-xs text-slate-400 mt-1">Select an agent, write or select a query template, and click "Simulate Trace" to view the security steps.</p>
              </div>
            )}

            {/* Sandbox Activity Logs history */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">Live Agent Activity Feed</h3>
              </div>
              <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                {activityLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-slate-50/20 text-xs font-bold text-slate-700">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className="text-slate-800">{log.agentName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                        log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/30' :
                        log.status === 'PENDING_APPROVAL' ? 'bg-amber-50 text-amber-700 border border-amber-200/30' :
                        'bg-rose-50 text-rose-700 border border-rose-200/30'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[10px] font-normal italic">Query: "{log.inputPrompt}"</p>
                    <p className="text-slate-600 mt-1 text-[11px] font-medium leading-relaxed">{log.action}</p>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-semibold">
                      <span>Tokens: {log.tokensUsed}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. VISUAL METRICS & COST MANAGEMENT DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Daily Token consumption</span>
                <h3 className="text-xl font-black text-slate-900">{totalTokensToday.toLocaleString()}</h3>
                <p className="text-[10px] text-slate-400 font-bold">Accumulated quota today</p>
              </div>
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
                <Coins className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Cumulative Spend (USD)</span>
                <h3 className="text-xl font-black text-slate-900">${totalSpentUsd.toFixed(2)}</h3>
                <p className="text-[10px] text-emerald-600 font-extrabold">Active month budget: ${totalMonthlyBudget.toFixed(0)}</p>
              </div>
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Total AI Operations</span>
                <h3 className="text-xl font-black text-slate-900">{totalExecutions}</h3>
                <p className="text-[10px] text-slate-400 font-bold">Successfully traced calls</p>
              </div>
              <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Optimization Rate</span>
                <h3 className="text-xl font-black text-slate-900">98.4%</h3>
                <p className="text-[10px] text-slate-400 font-bold">Errors & rate limits prevented</p>
              </div>
              <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
                <Shield className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Charts Row 1: Token Quota & Cost Budgets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Daily Token Quotas Chart */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-blue-600" /> Token Consumption vs Daily Quotas
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  Visual analysis comparing token consumption of each agent against daily permitted bounds.
                </p>
              </div>

              <div className="h-[280px] w-full text-xs font-semibold">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={agents.map(a => ({
                      name: a.name.replace(" Agent", ""),
                      Used: a.tokensUsedToday,
                      Limit: a.tokenLimitPerDay
                    }))}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#94a3b8" />
                    <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Legend iconType="circle" />
                    <Bar dataKey="Used" name="Tokens Used Today" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="Limit" name="Daily Max Limit" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Spend vs Monthly Budget Chart */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" /> Active Spend vs Monthly Budgets
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  Track dynamic API fees compared against targeted budget thresholds to prevent overflows.
                </p>
              </div>

              <div className="h-[280px] w-full text-xs font-semibold">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={agents.map(a => ({
                      name: a.name.replace(" Agent", ""),
                      Spent: parseFloat(a.spentUsd.toFixed(2)),
                      Budget: parseFloat(a.monthlyBudgetUsd.toFixed(2))
                    }))}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#94a3b8" />
                    <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" />
                    <Tooltip formatter={(v) => `$${v}`} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Legend iconType="circle" />
                    <Bar dataKey="Spent" name="Spent USD" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="Budget" name="Budget Limit" fill="#fecdd3" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2: Overtime Token burn & Workload Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Daily Token consumption trajectory */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-600" /> Daily Token Burn Trend
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  Weekly analysis trace indicating cumulative daily token usage over active execution nodes.
                </p>
              </div>

              <div className="h-[240px] w-full text-xs font-semibold">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={finalHistoryData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="#94a3b8" />
                    <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Area type="monotone" dataKey="Tokens" name="Tokens Burned" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorTokens)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Operations share distribution */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-violet-600" /> Agent Workload Distribution
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  Operations count share showing workload distribution across service levels.
                </p>
              </div>

              <div className="h-[180px] w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={agents.map(a => ({
                        name: a.name.replace(" Agent", ""),
                        value: a.activityCount || 1
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {agents.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} calls`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-3 border-t border-slate-100 text-[10px] font-extrabold text-slate-600">
                {agents.map((ag, index) => (
                  <div key={ag.id} className="flex items-center gap-1.5 truncate">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="truncate">{ag.name.replace(" Agent", "")} ({ag.activityCount})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Optimization & Limits Control Grid */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200/80">
              <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">AI Agent Quota Optimization Matrix</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] text-slate-400 uppercase tracking-widest font-black border-b border-slate-200">
                    <th className="p-4">AI Agent Name</th>
                    <th className="p-4">Engine Model</th>
                    <th className="p-4">Daily Token Limit Usage</th>
                    <th className="p-4">Monthly Budget Usage</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                  {agents.map((agent) => {
                    const quotaPercentage = Math.min(((agent.tokensUsedToday / agent.tokenLimitPerDay) * 100), 100);
                    const budgetPercentage = Math.min(((agent.spentUsd / agent.monthlyBudgetUsd) * 100), 100);

                    return (
                      <tr key={agent.id} className="hover:bg-slate-50/40">
                        <td className="p-4 flex items-center gap-2">
                          {getAgentIcon(agent.icon)}
                          <div>
                            <p className="text-slate-800 font-black">{agent.name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{agent.role}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600 font-mono">
                            {agent.aiModel}
                          </span>
                        </td>
                        <td className="p-4 space-y-1 min-w-[150px]">
                          <div className="flex justify-between text-[10px]">
                            <span>{quotaPercentage.toFixed(1)}%</span>
                            <span className="text-slate-400">{agent.tokensUsedToday.toLocaleString()} / {agent.tokenLimitPerDay.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${quotaPercentage > 80 ? 'bg-rose-500' : 'bg-blue-600'}`}
                              style={{ width: `${quotaPercentage}%` }}
                            />
                          </div>
                        </td>
                        <td className="p-4 space-y-1 min-w-[150px]">
                          <div className="flex justify-between text-[10px]">
                            <span>{budgetPercentage.toFixed(1)}%</span>
                            <span className="text-slate-400">${agent.spentUsd.toFixed(2)} / ${agent.monthlyBudgetUsd.toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${budgetPercentage > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                              style={{ width: `${budgetPercentage}%` }}
                            />
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                            agent.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            {agent.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedAgentId(agent.id);
                              setActiveTab('agents');
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-md"
                          >
                            Optimize Guardrails
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
