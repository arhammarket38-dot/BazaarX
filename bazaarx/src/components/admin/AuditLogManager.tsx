import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { AuditLog } from '../../types';
import { ShieldCheck, Search, Filter, RefreshCw, Terminal, Lock } from 'lucide-react';

export const AuditLogManager: React.FC = () => {
  const { addToast } = useStore();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch {
      addToast('Failed loading security audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (entityFilter !== 'ALL' && log.entity !== entityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = log.userName.toLowerCase().includes(q);
      const matchAction = log.action.toLowerCase().includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      const matchIP = log.ipAddress?.toLowerCase().includes(q);
      if (!matchName && !matchAction && !matchDetails && !matchIP) return false;
    }
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Security Audit & Telemetry Trail</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Immutable system event log recording administrative changes, authentication attempts, and API operations.
          </p>
        </div>
        <button
          onClick={fetchAuditLogs}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
        </button>
      </div>

      {/* Toolbar & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search logs by operator, action, description, or IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'AUTH', 'PRODUCT', 'CATEGORY', 'ORDER', 'SETTINGS', 'MARKETING'].map((entity) => (
            <button
              key={entity}
              onClick={() => setEntityFilter(entity)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                entityFilter === entity
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {entity}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Terminal Table */}
      <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-mono font-bold text-slate-300">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>syslog_stream.log ({filteredLogs.length} events)</span>
          </div>
          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded-md">
            AUDIT_MODE: SECURE
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-slate-400">Streaming audit records...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-slate-400">No telemetry logs match filter criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-extrabold uppercase text-[10px] tracking-widest">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Operator</th>
                  <th className="p-4">Module</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Details</th>
                  <th className="p-4 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="font-bold text-white">{log.userName}</span>
                      <span className="text-[10px] text-slate-500 block">{log.userRole}</span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="bg-blue-950 border border-blue-800 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {log.entity}
                      </span>
                    </td>
                    <td className="p-4 font-black text-amber-400 whitespace-nowrap">{log.action}</td>
                    <td className="p-4 text-slate-300 max-w-md truncate">{log.details}</td>
                    <td className="p-4 text-right text-slate-500 whitespace-nowrap">{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
