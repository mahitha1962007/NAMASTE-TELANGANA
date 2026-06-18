import { useState, useEffect } from 'react';
import AnimatedPageWrapper from '../components/AnimatedPageWrapper';
import PageHeader from '../components/PageHeader';
import AssignmentTable from '../components/AssignmentTable';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import assignmentService from '../services/assignmentService';
import { CheckSquare } from 'lucide-react';

export default function MyAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await assignmentService.getMy();
        setAssignments(res.data.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    fetchData();
  }, []);

  if (loading) return <Loader text="Loading your tasks..." fullScreen={false} />;

  return (
    <AnimatedPageWrapper>
      <PageHeader title="My Assignments" subtitle={`${assignments.length} tasks assigned to you`} />
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {assignments.length === 0 ? (
          <EmptyState title="No tasks assigned" description="You have no assigned work right now." icon={CheckSquare} />
        ) : (
          <AssignmentTable assignments={assignments} isAdmin={false} basePath="/staff/tasks" />
        )}
      </div>
    </AnimatedPageWrapper>
  );
}
