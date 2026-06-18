import { useState, useEffect } from 'react';
import AnimatedPageWrapper from '../components/AnimatedPageWrapper';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import AssignmentTable from '../components/AssignmentTable';
import Loader from '../components/Loader';
import reportService from '../services/reportService';
import assignmentService from '../services/assignmentService';
import {
  ClipboardList, Clock, Loader2 as LoaderIcon, CheckCircle, AlertTriangle,
  Mic, Camera, CalendarDays,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const PIE_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#ef4444', '#94a3b8'];

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sumRes, statusRes, catRes, assRes] = await Promise.all([
          reportService.getSummary(),
          reportService.getStatusCount(),
          reportService.getCategoryCount(),
          assignmentService.getAll(),
        ]);
        setSummary(sumRes.data.data);
        setStatusData(statusRes.data.data);
        setCategoryData(catRes.data.data);
        setAssignments(assRes.data.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <Loader text="Loading dashboard..." fullScreen={false} />;

  const s = summary || {};

  return (
    <AnimatedPageWrapper>
      <PageHeader title="Admin Dashboard" subtitle="Overview of all editorial activities" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Assignments" value={s.total || 0} icon={ClipboardList} gradient="stat-gradient-blue" delay={0} />
        <StatCard title="Pending" value={s.assigned || 0} icon={Clock} gradient="stat-gradient-violet" delay={1} />
        <StatCard title="In Progress" value={s.in_progress || 0} icon={LoaderIcon} gradient="stat-gradient-orange" delay={2} />
        <StatCard title="Completed" value={s.completed || 0} icon={CheckCircle} gradient="stat-gradient-emerald" delay={3} />
        <StatCard title="Delayed" value={s.delayed || 0} icon={AlertTriangle} gradient="stat-gradient-rose" delay={4} />
        <StatCard title="Today's Interviews" value={s.today_interviews || 0} icon={Mic} gradient="stat-gradient-cyan" delay={5} />
        <StatCard title="Today's Photo Shoots" value={s.today_photo_shoots || 0} icon={Camera} gradient="stat-gradient-amber" delay={6} />
        <StatCard title="Upcoming Deadlines" value={s.upcoming_deadlines || 0} icon={CalendarDays} gradient="stat-gradient-slate" delay={7} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Status Distribution">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" nameKey="name" paddingAngle={3}>
                {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {statusData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Content by Category">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent Assignments */}
      <div className="bg-white rounded-2xl shadow-card">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Recent Assignments</h3>
        </div>
        <AssignmentTable assignments={assignments.slice(0, 5)} isAdmin={true} />
      </div>
    </AnimatedPageWrapper>
  );
}
