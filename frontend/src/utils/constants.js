// ============================================
// Constants
// ============================================

export const STATUS_OPTIONS = ['Assigned', 'In Progress', 'Completed', 'Delayed', 'Archived'];

export const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

export const CATEGORY_OPTIONS = [
  'Politics', 'Infrastructure', 'Culture', 'Agriculture', 'Business',
  'Education', 'Health', 'Sports', 'Entertainment', 'Technology', 'Social', 'Other',
];

export const CONTENT_TYPE_OPTIONS = [
  'News Article', 'Feature Story', 'Photo Story', 'Video Story',
  'Interview', 'Editorial', 'Social Media Post', 'Press Release', 'Other',
];

export const ROLE_OPTIONS = [
  { value: 'reporter', label: 'Reporter' },
  { value: 'interviewer', label: 'Interviewer' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'editor', label: 'Editor' },
  { value: 'video_editor', label: 'Video Editor' },
  { value: 'social_media_manager', label: 'Social Media Manager' },
  { value: 'publication_manager', label: 'Publication Manager' },
];

export const STATUS_COLORS = {
  'Assigned': { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  'In Progress': { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  'Completed': { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'Delayed': { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  'Archived': { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' },
};

export const PRIORITY_COLORS = {
  'Low': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'Medium': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'High': { bg: 'bg-red-100', text: 'text-red-700' },
};

export const EVENT_COLORS = {
  'Interview': '#3b82f6',
  'Photo Shoot': '#10b981',
  'Publication Deadline': '#ef4444',
  'Review': '#8b5cf6',
  'Draft Deadline': '#f97316',
  'Completed': '#94a3b8',
  'Overdue': '#ef4444',
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const getRoleName = (role) => {
  const found = ROLE_OPTIONS.find((r) => r.value === role);
  return found ? found.label : role;
};
