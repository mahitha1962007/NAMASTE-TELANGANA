import { useState, useEffect } from 'react';
import AnimatedPageWrapper from '../components/AnimatedPageWrapper';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import api from '../services/api';
import { formatDateTime } from '../utils/constants';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await api.get('/audit-logs');
        setLogs(res.data.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    fetchLogs();
  }, []);

  if (loading) return <Loader text="Loading audit logs..." fullScreen={false} />;

  return (
    <AnimatedPageWrapper>
      <PageHeader title="Audit Logs" subtitle="Complete history of all system actions" />

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {logs.length === 0 ? (
          <EmptyState title="No audit logs" icon={Shield} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Assignment</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Old Value</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">New Value</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Changed By</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log, i) => (
                  <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs">{log.action}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{log.assignment_title || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs">{log.old_value || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs">{log.new_value || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{log.changed_by_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDateTime(log.created_at)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AnimatedPageWrapper>
  );
}
