import { useState, useEffect } from 'react';
import AnimatedPageWrapper from '../components/AnimatedPageWrapper';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import notificationService from '../services/notificationService';
import { formatDateTime } from '../utils/constants';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  async function fetchNotifications() {
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data.data);
    } catch (err) { toast.error('Failed to fetch notifications'); } finally { setLoading(false); }
  }

  async function markRead(id) {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) { toast.error('Failed to mark as read'); }
  }

  async function markAllRead() {
    for (const n of notifications.filter((n) => !n.is_read)) {
      await notificationService.markRead(n.id);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success('All notifications marked as read');
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) return <Loader text="Loading notifications..." fullScreen={false} />;

  return (
    <AnimatedPageWrapper>
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        actions={
          unreadCount > 0 && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={markAllRead}
              className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <CheckCheck className="w-4 h-4" /> Mark All Read
            </motion.button>
          )
        }
      />

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {notifications.length === 0 ? (
          <EmptyState title="No notifications" description="You're all caught up!" icon={Bell} />
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-primary-50/30' : ''}`}
              >
                <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${!n.is_read ? 'bg-primary-500' : 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed ${!n.is_read ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{n.message}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {n.assignment_title && <span className="text-xs text-primary-500 font-medium">{n.assignment_title}</span>}
                    <span className="text-xs text-gray-400">{formatDateTime(n.created_at)}</span>
                  </div>
                </div>
                {!n.is_read && (
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                    onClick={() => markRead(n.id)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0" title="Mark as read"
                  >
                    <Check className="w-4 h-4 text-gray-500" />
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AnimatedPageWrapper>
  );
}
