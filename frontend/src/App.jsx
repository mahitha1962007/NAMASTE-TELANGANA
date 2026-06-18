import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import AdminLayout from './layouts/AdminLayout';
import StaffLayout from './layouts/StaffLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import CreateAssignment from './pages/CreateAssignment';
import AllAssignments from './pages/AllAssignments';
import MyAssignments from './pages/MyAssignments';
import AssignmentDetails from './pages/AssignmentDetails';
import EditAssignment from './pages/EditAssignment';
import CalendarView from './pages/CalendarView';
import Reports from './pages/Reports';
import StaffManagement from './pages/StaffManagement';
import Notifications from './pages/Notifications';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Loader from './components/Loader';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard'} replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard'} replace /> : <Signup />} />

      {/* Home redirect */}
      <Route path="/" element={
        user
          ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard'} replace />
          : <Navigate to="/login" replace />
      } />

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute><RoleBasedRoute allowedRoles={['admin']}><AdminLayout /></RoleBasedRoute></ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="create-assignment" element={<CreateAssignment />} />
        <Route path="assignments" element={<AllAssignments />} />
        <Route path="assignments/:id" element={<AssignmentDetails />} />
        <Route path="assignments/:id/edit" element={<EditAssignment />} />
        <Route path="calendar" element={<CalendarView />} />
        <Route path="reports" element={<Reports />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Staff routes */}
      <Route path="/staff" element={
        <ProtectedRoute><RoleBasedRoute allowedRoles={['staff']}><StaffLayout /></RoleBasedRoute></ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="tasks" element={<MyAssignments />} />
        <Route path="tasks/:id" element={<AssignmentDetails />} />
        <Route path="calendar" element={<CalendarView />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
