import { useState, useEffect } from 'react';
import AnimatedPageWrapper from '../components/AnimatedPageWrapper';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import AssignmentTable from '../components/AssignmentTable';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import assignmentService from '../services/assignmentService';
import notificationService from '../services/notificationService';
import { ClipboardList, Clock, Loader2 as LoaderIcon, CheckCircle, CalendarDays, Bell } from 'lucide-react';
import { formatDateTime } from '../utils/constants';

export default function StaffDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [assRes, notifRes] = await Promise.all([
          assignmentService.getMy(),
          notificationService.getAll(),
        ]);
        setAssignments(assRes.data.data);
        setNotifications(notifRes.data.data);
      } catch (err) {
        console.error('Staff dashboard error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <Loader text="Loading your dashboard..." fullScreen={false} />;

  const total = assignments.length;
  const pending = assignments.filter((a) => a.status === 'Assigned').length;
  const inProgress = assignments.filter((a) => a.status === 'In Progress').length;
  const completed = assignments.filter((a) => a.status === 'Completed').length;
  const upcoming = assignments.filter((a) => {
    const d = new Date(a.publication_deadline);
    const now = new Date();
    const diff = (d - now) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7 && a.status !== 'Completed';
  }).length;
  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <AnimatedPageWrapper>
      <PageHeader title="My Dashboard" subtitle="Your assignments and schedule at a glance" />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="My Tasks" value={total} icon={ClipboardList} gradient="stat-gradient-blue" delay={0} />
        <StatCard title="Pending" value={pending} icon={Clock} gradient="stat-gradient-violet" delay={1} />
        <StatCard title="In Progress" value={inProgress} icon={LoaderIcon} gradient="stat-gradient-orange" delay={2} />
        <StatCard title="Completed" value={completed} icon={CheckCircle} gradient="stat-gradient-emerald" delay={3} />
        <StatCard title="Upcoming Deadlines" value={upcoming} icon={CalendarDays} gradient="stat-gradient-rose" delay={4} />
        <StatCard title="Notifications" value={unread} icon={Bell} gradient="stat-gradient-cyan" delay={5} />
      </div>

      {/* My Assignments */}
      <div className="bg-white rounded-2xl shadow-card mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">My Assigned Work</h3>
        </div>
        {assignments.length === 0 ? (
          <EmptyState title="No tasks assigned" description="You currently have no assignments." />
        ) : (
          <AssignmentTable assignments={assignments} isAdmin={false} basePath="/staff/tasks" />
        )}
      </div>

      {/* Recent Notifications */}
      <div className="bg-white rounded-2xl shadow-card">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Recent Notifications</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {notifications.length === 0 ? (
            <p className="p-6 text-sm text-gray-400 text-center">No notifications</p>
          ) : (
            notifications.slice(0, 5).map((n) => (
              <div key={n.id} className={`px-6 py-3.5 flex items-start gap-3 ${!n.is_read ? 'bg-primary-50/30' : ''}`}>
                <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${!n.is_read ? 'bg-primary-500' : 'bg-gray-300'}`} />
                <div>
                  <p className="text-sm text-gray-700">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(n.created_at)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AnimatedPageWrapper>
  );
}
