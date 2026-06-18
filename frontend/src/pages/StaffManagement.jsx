import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimatedPageWrapper from '../components/AnimatedPageWrapper';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import FormInput from '../components/FormInput';
import SelectInput from '../components/SelectInput';
import staffService from '../services/staffService';
import { ROLE_OPTIONS, getRoleName } from '../utils/constants';
import { UserPlus, Search, Edit, UserX, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null });
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'reporter', department: '', phone: '' });

  useEffect(() => { fetchStaff(); }, []);

  async function fetchStaff() {
    try {
      const res = await staffService.getAll();
      setStaff(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editId) {
        await staffService.update(editId, form);
        toast.success('Staff updated');
      } else {
        await staffService.create(form);
        toast.success('Staff created');
      }
      setShowForm(false);
      setEditId(null);
      setForm({ name: '', email: '', password: '', role: 'reporter', department: '', phone: '' });
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  }

  async function handleDeactivate(id) {
    try {
      await staffService.deactivate(id);
      toast.success('Staff deactivated');
      fetchStaff();
    } catch (err) {
      toast.error('Failed to deactivate');
    }
  }

  function startEdit(s) {
    setForm({ name: s.name, email: s.email, password: '', role: s.role, department: s.department || '', phone: s.phone || '' });
    setEditId(s.id);
    setShowForm(true);
  }

  const filtered = staff.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || s.role === filterRole;
    return matchSearch && matchRole;
  });

  if (loading) return <Loader text="Loading staff..." fullScreen={false} />;

  return (
    <AnimatedPageWrapper>
      <PageHeader
        title="Staff Management"
        subtitle="Manage your editorial team"
        actions={
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', email: '', password: '', role: 'reporter', department: '', phone: '' }); }}
            className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Add Staff
          </motion.button>
        }
      />

      {/* Add/Edit Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{editId ? 'Edit Staff' : 'Add New Staff'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormInput label="Name" id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <FormInput label="Email" id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            {!editId && <FormInput label="Password" id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />}
            <SelectInput label="Role" id="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} options={ROLE_OPTIONS} required />
            <FormInput label="Department" id="department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            <FormInput label="Phone" id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <div className="md:col-span-2 lg:col-span-3 flex gap-3">
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit"
                className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-medium transition-colors"
              >
                {editId ? 'Update Staff' : 'Create Staff'}
              </motion.button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white px-3.5 py-2.5 rounded-xl border border-gray-200 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm text-gray-600 w-full" />
        </div>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
          className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none"
        >
          <option value="">All Roles</option>
          {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState title="No staff found" icon={Users} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Dept</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tasks</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((s, i) => (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">#{s.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{s.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">{getRoleName(s.role)}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{s.department || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.active_tasks > 5 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                        {s.active_tasks || 0} {s.active_tasks > 5 ? '⚠️' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                          onClick={() => startEdit(s)}
                          className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Edit"
                        ><Edit className="w-4 h-4" /></motion.button>
                        {s.is_active && (
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                            onClick={() => setConfirmModal({ open: true, id: s.id })}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Deactivate"
                          ><UserX className="w-4 h-4" /></motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, id: null })}
        onConfirm={() => handleDeactivate(confirmModal.id)}
        title="Deactivate Staff"
        message="Are you sure you want to deactivate this staff member? They will no longer be able to log in."
        confirmText="Deactivate"
      />
    </AnimatedPageWrapper>
  );
}
