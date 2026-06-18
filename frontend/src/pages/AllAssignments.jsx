import { useState, useEffect } from 'react';
import AnimatedPageWrapper from '../components/AnimatedPageWrapper';
import PageHeader from '../components/PageHeader';
import AssignmentTable from '../components/AssignmentTable';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import assignmentService from '../services/assignmentService';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../utils/constants';
import { Search, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AllAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null, type: '' });

  useEffect(() => { fetchAssignments(); }, []);

  async function fetchAssignments() {
    try {
      const res = await assignmentService.getAll();
      setAssignments(res.data.data);
    } catch (err) { toast.error('Failed to fetch assignments'); } finally { setLoading(false); }
  }

  async function handleArchive(id) {
    try { await assignmentService.updateStatus(id, 'Archived'); toast.success('Assignment archived'); fetchAssignments(); }
    catch (err) { toast.error('Failed to archive'); }
  }

  async function handleDelete(id) {
    setConfirmModal({ open: true, id, type: 'delete' });
  }

  async function confirmDelete() {
    try { await assignmentService.delete(confirmModal.id); toast.success('Assignment deleted'); fetchAssignments(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  }

  const filtered = assignments.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || a.status === filterStatus;
    const matchPriority = !filterPriority || a.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  if (loading) return <Loader text="Loading assignments..." fullScreen={false} />;

  return (
    <AnimatedPageWrapper>
      <PageHeader title="All Assignments" subtitle={`${assignments.length} total assignments`} />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white px-3.5 py-2.5 rounded-xl border border-gray-200 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by title..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm text-gray-600 w-full" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none">
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none">
          <option value="">All Priority</option>
          {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState title="No assignments found" icon={ClipboardList} />
        ) : (
          <AssignmentTable assignments={filtered} isAdmin={true} onArchive={handleArchive} onDelete={handleDelete} />
        )}
      </div>

      <ConfirmModal isOpen={confirmModal.open} onClose={() => setConfirmModal({ open: false, id: null, type: '' })}
        onConfirm={confirmDelete} title="Delete Assignment" message="Are you sure? This cannot be undone. Only assignments that are not In Progress or Completed can be deleted." confirmText="Delete" />
    </AnimatedPageWrapper>
  );
}
