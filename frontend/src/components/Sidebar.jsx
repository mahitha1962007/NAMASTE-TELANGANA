import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, PlusCircle, ClipboardList, Calendar, BarChart3,
  Users, Bell, Shield, Settings, LogOut, CheckSquare, UserCircle,
  Newspaper, X, Menu,
} from 'lucide-react';
import { useState } from 'react';

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/create-assignment', label: 'Create Assignment', icon: PlusCircle },
  { to: '/admin/assignments', label: 'All Assignments', icon: ClipboardList },
  { to: '/admin/calendar', label: 'Calendar', icon: Calendar },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/staff', label: 'Staff Management', icon: Users },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: Shield },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/profile', label: 'My Profile', icon: UserCircle },
];

const staffLinks = [
  { to: '/staff/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
  { to: '/staff/tasks', label: 'My Tasks', icon: CheckSquare },
  { to: '/staff/calendar', label: 'My Calendar', icon: Calendar },
  { to: '/staff/notifications', label: 'Notifications', icon: Bell },
  { to: '/staff/profile', label: 'Profile', icon: UserCircle },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const links = isAdmin ? adminLinks : staffLinks;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/20 rounded-xl">
            <Newspaper className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">Namaste Telangana</h1>
            <p className="text-[10px] text-gray-400 font-medium">Editorial Planner</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <link.icon className={`w-[18px] h-[18px] transition-colors ${isActive ? 'text-primary-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
              {link.label}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 bg-primary-400 rounded-full"
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-white/10">
        <NavLink
          to={isAdmin ? '/admin/profile' : '/staff/profile'}
          className="flex items-center gap-3 mb-3 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center border border-primary-500/10 group-hover:border-primary-500/30 transition-colors">
            <span className="text-xs font-bold text-primary-400">{user?.name?.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate group-hover:text-primary-400 transition-colors">{user?.name}</p>
            <p className="text-[10px] text-gray-500 capitalize">{user?.role}</p>
          </div>
        </NavLink>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-sidebar rounded-xl text-white shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:min-h-screen bg-sidebar fixed left-0 top-0 bottom-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-sidebar z-50"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
