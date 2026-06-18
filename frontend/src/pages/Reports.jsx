import { useState, useEffect } from 'react';
import AnimatedPageWrapper from '../components/AnimatedPageWrapper';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import reportService from '../services/reportService';
import { formatDate } from '../utils/constants';
import { ClipboardList, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const PIE_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#ef4444', '#94a3b8'];
const WORKLOAD_COLOR = '#3b82f6';

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [workload, setWorkload] = useState([]);
  const [deadlines, setDeadlines] = useState({ upcoming: [], overdue: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const [sumRes, statRes, catRes, wlRes, dlRes] = await Promise.all([
          reportService.getSummary(), reportService.getStatusCount(), reportService.getCategoryCount(),
          reportService.getStaffWorkload(), reportService.getDeadlines(),
        ]);
        setSummary(sumRes.data.data); setStatusData(statRes.data.data); setCategoryData(catRes.data.data);
        setWorkload(wlRes.data.data); setDeadlines(dlRes.data.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    fetchReports();
  }, []);

  if (loading) return <Loader text="Loading reports..." fullScreen={false} />;

  const s = summary || {};

  return (
    <AnimatedPageWrapper>
      <PageHeader title="Reports & Analytics" subtitle="Comprehensive editorial performance overview" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total" value={s.total || 0} icon={ClipboardList} gradient="stat-gradient-blue" delay={0} />
        <StatCard title="Completed" value={s.completed || 0} icon={CheckCircle} gradient="stat-gradient-emerald" delay={1} />
        <StatCard title="Delayed" value={s.delayed || 0} icon={AlertTriangle} gradient="stat-gradient-rose" delay={2} />
        <StatCard title="Completion %" value={`${s.completion_percentage || 0}%`} icon={TrendingUp} gradient="stat-gradient-violet" delay={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Status Distribution">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" nameKey="name" paddingAngle={3}>
              {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie><Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} /></PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {statusData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} /> {d.name} ({d.value})
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

      {/* Staff Workload */}
      <ChartCard title="Staff Workload" className="mb-8">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={workload} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={100} />
            <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Bar dataKey="active_tasks" fill={WORKLOAD_COLOR} radius={[0, 6, 6, 0]} name="Active Tasks" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Deadline Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100"><h3 className="text-sm font-semibold text-gray-700">⏰ Upcoming Deadlines</h3></div>
          {deadlines.upcoming.length === 0 ? <p className="p-6 text-sm text-gray-400 text-center">No upcoming deadlines</p> : (
            <table className="w-full text-sm"><tbody className="divide-y divide-gray-50">
              {deadlines.upcoming.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium text-gray-900">{d.title}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={d.priority} /></td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(d.publication_deadline)}</td></tr>
              ))}
            </tbody></table>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100"><h3 className="text-sm font-semibold text-red-600">🚨 Overdue Assignments</h3></div>
          {deadlines.overdue.length === 0 ? <p className="p-6 text-sm text-gray-400 text-center">No overdue assignments</p> : (
            <table className="w-full text-sm"><tbody className="divide-y divide-gray-50">
              {deadlines.overdue.map((d) => (
                <tr key={d.id} className="hover:bg-red-50/50"><td className="px-4 py-3 font-medium text-gray-900">{d.title}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3 text-red-600 font-medium">{formatDate(d.publication_deadline)}</td></tr>
              ))}
            </tbody></table>
          )}
        </div>
      </div>
    </AnimatedPageWrapper>
  );
}
