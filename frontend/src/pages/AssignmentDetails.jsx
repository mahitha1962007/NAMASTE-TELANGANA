import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedPageWrapper from '../components/AnimatedPageWrapper';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Loader from '../components/Loader';
import FormInput from '../components/FormInput';
import SelectInput from '../components/SelectInput';
import assignmentService from '../services/assignmentService';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatDateTime, STATUS_OPTIONS, getRoleName } from '../utils/constants';
import { ArrowLeft, Edit, Users, Calendar, FileText, MessageSquare, Shield, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AssignmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');

  useEffect(() => { fetchAssignment(); }, [id]);

  async function fetchAssignment() {
    try {
      const res = await assignmentService.getById(id);
      setAssignment(res.data.data);
      setStatusUpdate(res.data.data.status);
    } catch (err) { toast.error('Failed to load assignment'); navigate(-1); } finally { setLoading(false); }
  }

  async function handleStatusUpdate() {
    try {
      await assignmentService.updateStatus(id, statusUpdate);
      toast.success('Status updated');
      fetchAssignment();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update status'); }
  }

  async function handleAddNote() {
    if (!note.trim()) return;
    try {
      await assignmentService.addNote(id, note);
      toast.success('Note added');
      setNote('');
      fetchAssignment();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add note'); }
  }

  if (loading) return <Loader text="Loading assignment..." fullScreen={false} />;
  if (!assignment) return null;

  const a = assignment;
  const basePath = isAdmin ? '/admin/assignments' : '/staff/tasks';

  return (
    <AnimatedPageWrapper>
      <PageHeader
        title={a.title}
        subtitle={`Created ${formatDate(a.created_at)}`}
        actions={
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </motion.button>
            {isAdmin && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`${basePath}/${id}/edit`)}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Edit className="w-4 h-4" /> Edit
              </motion.button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Story Info */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <StatusBadge status={a.status} />
              <PriorityBadge priority={a.priority} />
              {a.category && <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{a.category}</span>}
              {a.content_type && <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">{a.content_type}</span>}
            </div>
            {a.description && <p className="text-sm text-gray-600 leading-relaxed mb-4">{a.description}</p>}
            {a.instructions && (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs font-semibold text-amber-700 mb-1">📋 Admin Instructions</p>
                <p className="text-sm text-amber-800">{a.instructions}</p>
              </div>
            )}
          </div>

          {/* Team Members */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4"><Users className="w-4 h-4" /> Team Members</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {a.members?.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-600">{m.user_name?.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.user_name}</p>
                    <p className="text-xs text-gray-500 capitalize">{getRoleName(m.role_in_assignment)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4"><MessageSquare className="w-4 h-4" /> Progress Notes</h3>
            <div className="flex gap-2 mb-4">
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a progress note..."
                className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-500"
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()} />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleAddNote}
                className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
            <div className="space-y-3">
              {a.notes?.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No notes yet</p>}
              {a.notes?.map((n) => (
                <div key={n.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-gray-700">{n.user_name}</p>
                    <p className="text-[10px] text-gray-400">{formatDateTime(n.created_at)}</p>
                  </div>
                  <p className="text-sm text-gray-600">{n.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Trail */}
          {a.audit_trail && a.audit_trail.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4"><Shield className="w-4 h-4" /> Audit Trail</h3>
              <div className="space-y-2">
                {a.audit_trail.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-2.5 text-xs">
                    <div className="w-1.5 h-1.5 mt-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                    <div>
                      <span className="font-medium text-gray-700">{log.action}</span>
                      {log.old_value && <span className="text-gray-400"> from "{log.old_value}"</span>}
                      {log.new_value && <span className="text-gray-400"> → "{log.new_value}"</span>}
                      <span className="text-gray-400"> by {log.changed_by_name} • {formatDateTime(log.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          {/* Status Update */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Update Status</h3>
            <SelectInput id="status-update" value={statusUpdate} onChange={(e) => setStatusUpdate(e.target.value)}
              options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))} label="" />
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleStatusUpdate}
              className="w-full mt-3 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Update Status
            </motion.button>
          </div>

          {/* Key Dates */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3"><Calendar className="w-4 h-4" /> Key Dates</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Publication Deadline</span>
                <span className="font-medium text-gray-900">{formatDate(a.publication_deadline)}</span>
              </div>
              {a.events?.map((e) => (
                <div key={e.id} className="flex justify-between text-sm">
                  <span className="text-gray-500">{e.event_type}</span>
                  <span className="font-medium text-gray-900">{formatDate(e.event_date)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Events */}
          {a.events && a.events.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3"><FileText className="w-4 h-4" /> Events</h3>
              <div className="space-y-2">
                {a.events.map((e) => (
                  <div key={e.id} className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm font-medium text-gray-900">{e.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(e.event_date)}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      e.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                      e.status === 'Cancelled' ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700'
                    }`}>{e.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AnimatedPageWrapper>
  );
}
