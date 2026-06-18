import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AnimatedPageWrapper from '../components/AnimatedPageWrapper';
import PageHeader from '../components/PageHeader';
import FormInput from '../components/FormInput';
import SelectInput from '../components/SelectInput';
import Loader from '../components/Loader';
import assignmentService from '../services/assignmentService';
import staffService from '../services/staffService';
import { CATEGORY_OPTIONS, CONTENT_TYPE_OPTIONS, PRIORITY_OPTIONS, STATUS_OPTIONS } from '../utils/constants';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function EditAssignment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reporters, setReporters] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [photographers, setPhotographers] = useState([]);
  const [editors, setEditors] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', category: '', content_type: '', priority: '', status: '',
    reporter_id: '', interviewer_id: '', photographer_id: '', editor_id: '',
    interview_date: '', photo_shoot_date: '', publication_deadline: '', instructions: '',
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [assRes, repRes, intRes, phoRes, ediRes] = await Promise.all([
          assignmentService.getById(id),
          staffService.getAll('reporter'), staffService.getAll('interviewer'),
          staffService.getAll('photographer'), staffService.getAll('editor'),
        ]);
        const a = assRes.data.data;
        setReporters(repRes.data.data.filter((s) => s.is_active));
        setInterviewers(intRes.data.data.filter((s) => s.is_active));
        setPhotographers(phoRes.data.data.filter((s) => s.is_active));
        setEditors(ediRes.data.data.filter((s) => s.is_active));

        const getMemberId = (role) => a.members?.find((m) => m.role_in_assignment === role)?.user_id?.toString() || '';
        const toLocal = (d) => d ? new Date(d).toISOString().slice(0, 16) : '';

        setForm({
          title: a.title, description: a.description || '', category: a.category || '',
          content_type: a.content_type || '', priority: a.priority, status: a.status,
          reporter_id: getMemberId('reporter'), interviewer_id: getMemberId('interviewer'),
          photographer_id: getMemberId('photographer'), editor_id: getMemberId('editor'),
          interview_date: toLocal(a.events?.find((e) => e.event_type === 'Interview')?.event_date),
          photo_shoot_date: toLocal(a.events?.find((e) => e.event_type === 'Photo Shoot')?.event_date),
          publication_deadline: toLocal(a.publication_deadline), instructions: a.instructions || '',
        });
      } catch (err) { toast.error('Failed to load assignment'); navigate(-1); }
      finally { setLoading(false); }
    }
    fetchData();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await assignmentService.update(id, form);
      toast.success('Assignment updated');
      navigate(`/admin/assignments/${id}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  if (loading) return <Loader text="Loading assignment..." fullScreen={false} />;

  return (
    <AnimatedPageWrapper>
      <PageHeader title="Edit Assignment" subtitle={form.title}
        actions={
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium flex items-center gap-2"
          ><ArrowLeft className="w-4 h-4" /> Back</motion.button>
        }
      />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Story Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><FormInput label="Story Title" id="title" value={form.title} onChange={update('title')} required /></div>
            <div className="md:col-span-2"><FormInput label="Description" id="description" type="textarea" value={form.description} onChange={update('description')} /></div>
            <SelectInput label="Category" id="category" value={form.category} onChange={update('category')} options={CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))} />
            <SelectInput label="Content Type" id="content_type" value={form.content_type} onChange={update('content_type')} options={CONTENT_TYPE_OPTIONS.map((c) => ({ value: c, label: c }))} />
            <SelectInput label="Priority" id="priority" value={form.priority} onChange={update('priority')} options={PRIORITY_OPTIONS.map((p) => ({ value: p, label: p }))} />
            <SelectInput label="Status" id="status" value={form.status} onChange={update('status')} options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))} />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Assign Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectInput label="Reporter" id="reporter_id" value={form.reporter_id} onChange={update('reporter_id')} options={reporters.map((s) => ({ value: s.id.toString(), label: s.name }))} />
            <SelectInput label="Interviewer" id="interviewer_id" value={form.interviewer_id} onChange={update('interviewer_id')} options={interviewers.map((s) => ({ value: s.id.toString(), label: s.name }))} />
            <SelectInput label="Photographer" id="photographer_id" value={form.photographer_id} onChange={update('photographer_id')} options={photographers.map((s) => ({ value: s.id.toString(), label: s.name }))} />
            <SelectInput label="Editor" id="editor_id" value={form.editor_id} onChange={update('editor_id')} options={editors.map((s) => ({ value: s.id.toString(), label: s.name }))} />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput label="Interview Date" id="interview_date" type="datetime-local" value={form.interview_date} onChange={update('interview_date')} />
            <FormInput label="Photo Shoot Date" id="photo_shoot_date" type="datetime-local" value={form.photo_shoot_date} onChange={update('photo_shoot_date')} />
            <FormInput label="Publication Deadline" id="publication_deadline" type="datetime-local" value={form.publication_deadline} onChange={update('publication_deadline')} required />
          </div>
          <div className="mt-4"><FormInput label="Instructions" id="instructions" type="textarea" value={form.instructions} onChange={update('instructions')} /></div>
        </div>
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={saving}
          className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
        </motion.button>
      </form>
    </AnimatedPageWrapper>
  );
}
