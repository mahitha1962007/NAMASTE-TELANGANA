import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedPageWrapper from '../components/AnimatedPageWrapper';
import PageHeader from '../components/PageHeader';
import FormInput from '../components/FormInput';
import SelectInput from '../components/SelectInput';
import staffService from '../services/staffService';
import assignmentService from '../services/assignmentService';
import { CATEGORY_OPTIONS, CONTENT_TYPE_OPTIONS, PRIORITY_OPTIONS, STATUS_OPTIONS } from '../utils/constants';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateAssignment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reporters, setReporters] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [photographers, setPhotographers] = useState([]);
  const [editors, setEditors] = useState([]);

  const [form, setForm] = useState({
    title: '', description: '', category: '', content_type: '', priority: 'Medium', status: 'Assigned',
    reporter_id: '', interviewer_id: '', photographer_id: '', editor_id: '',
    interview_date: '', photo_shoot_date: '', publication_deadline: '', instructions: '',
  });

  useEffect(() => {
    async function fetchStaff() {
      try {
        const [rep, int, pho, edi] = await Promise.all([
          staffService.getAll('reporter'), staffService.getAll('interviewer'),
          staffService.getAll('photographer'), staffService.getAll('editor'),
        ]);
        setReporters(rep.data.data.filter((s) => s.is_active));
        setInterviewers(int.data.data.filter((s) => s.is_active));
        setPhotographers(pho.data.data.filter((s) => s.is_active));
        setEditors(edi.data.data.filter((s) => s.is_active));
      } catch (err) {
        toast.error('Failed to load staff');
      }
    }
    fetchStaff();
  }, []);

  async function handleSuggestStaff() {
    try {
      const res = await staffService.suggest();
      const suggestions = res.data.data;
      setForm((prev) => ({
        ...prev,
        reporter_id: suggestions.reporter?.id?.toString() || prev.reporter_id,
        interviewer_id: suggestions.interviewer?.id?.toString() || prev.interviewer_id,
        photographer_id: suggestions.photographer?.id?.toString() || prev.photographer_id,
        editor_id: suggestions.editor?.id?.toString() || prev.editor_id,
      }));
      toast.success('Least-busy staff suggested!');
    } catch (err) {
      toast.error('Failed to suggest staff');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.publication_deadline) {
      toast.error('Title and publication deadline are required');
      return;
    }
    setLoading(true);
    try {
      await assignmentService.create(form);
      toast.success('Assignment created successfully!');
      navigate('/admin/assignments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <AnimatedPageWrapper>
      <PageHeader
        title="Create Assignment"
        subtitle="Plan a new editorial story or content task"
        actions={
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSuggestStaff} type="button"
            className="px-4 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4" /> Suggest Staff
          </motion.button>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Story Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormInput label="Story Title" id="title" value={form.title} onChange={update('title')} placeholder="Enter story headline..." required />
            </div>
            <div className="md:col-span-2">
              <FormInput label="Description" id="description" type="textarea" value={form.description} onChange={update('description')} placeholder="Brief about the story..." />
            </div>
            <SelectInput label="Category" id="category" value={form.category} onChange={update('category')} options={CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))} />
            <SelectInput label="Content Type" id="content_type" value={form.content_type} onChange={update('content_type')} options={CONTENT_TYPE_OPTIONS.map((c) => ({ value: c, label: c }))} />
            <SelectInput label="Priority" id="priority" value={form.priority} onChange={update('priority')} options={PRIORITY_OPTIONS.map((p) => ({ value: p, label: p }))} />
            <SelectInput label="Status" id="status" value={form.status} onChange={update('status')} options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Assign Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectInput label="Reporter" id="reporter_id" value={form.reporter_id} onChange={update('reporter_id')}
              options={reporters.map((s) => ({ value: s.id.toString(), label: `${s.name} (${s.active_tasks || 0} tasks)` }))} />
            <SelectInput label="Interviewer" id="interviewer_id" value={form.interviewer_id} onChange={update('interviewer_id')}
              options={interviewers.map((s) => ({ value: s.id.toString(), label: `${s.name} (${s.active_tasks || 0} tasks)` }))} />
            <SelectInput label="Photographer" id="photographer_id" value={form.photographer_id} onChange={update('photographer_id')}
              options={photographers.map((s) => ({ value: s.id.toString(), label: `${s.name} (${s.active_tasks || 0} tasks)` }))} />
            <SelectInput label="Editor" id="editor_id" value={form.editor_id} onChange={update('editor_id')}
              options={editors.map((s) => ({ value: s.id.toString(), label: `${s.name} (${s.active_tasks || 0} tasks)` }))} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Schedule & Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput label="Interview Date" id="interview_date" type="datetime-local" value={form.interview_date} onChange={update('interview_date')} />
            <FormInput label="Photo Shoot Date" id="photo_shoot_date" type="datetime-local" value={form.photo_shoot_date} onChange={update('photo_shoot_date')} />
            <FormInput label="Publication Deadline" id="publication_deadline" type="datetime-local" value={form.publication_deadline} onChange={update('publication_deadline')} required />
          </div>
          <div className="mt-4">
            <FormInput label="Instructions" id="instructions" type="textarea" value={form.instructions} onChange={update('instructions')} placeholder="Special instructions for the team..." />
          </div>
        </div>

        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          type="submit" disabled={loading}
          className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Create Assignment
        </motion.button>
      </form>
    </AnimatedPageWrapper>
  );
}
