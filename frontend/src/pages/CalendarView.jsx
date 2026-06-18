import { useState, useEffect } from 'react';
import AnimatedPageWrapper from '../components/AnimatedPageWrapper';
import PageHeader from '../components/PageHeader';
import CalendarCard from '../components/CalendarCard';
import Loader from '../components/Loader';
import eventService from '../services/eventService';
import { useAuth } from '../context/AuthContext';

export default function CalendarView() {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = isAdmin ? await eventService.getAll() : await eventService.getMy();
        setEvents(res.data.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    fetchEvents();
  }, [isAdmin]);

  if (loading) return <Loader text="Loading calendar..." fullScreen={false} />;

  return (
    <AnimatedPageWrapper>
      <PageHeader title={isAdmin ? 'Editorial Calendar' : 'My Calendar'} subtitle="All scheduled events and deadlines" />
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4">
        {[
          { label: 'Pending (Assigned)', color: '#f59e0b' },
          { label: 'In Progress', color: '#3b82f6' },
          { label: 'Completed', color: '#10b981' },
          { label: 'Delayed (Overdue)', color: '#ef4444' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
            {item.label}
          </div>
        ))}
      </div>
      <CalendarCard events={events} />
    </AnimatedPageWrapper>
  );
}
