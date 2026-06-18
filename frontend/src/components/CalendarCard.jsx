import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, User, ArrowRight, Clipboard } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { formatDateTime, formatDate } from '../utils/constants';

// Color mapping for Assignment Status
const STATUS_COLORS = {
  'Assigned': '#f59e0b',    // Amber / Yellow (Pending)
  'In Progress': '#3b82f6', // Blue
  'Completed': '#10b981',   // Emerald Green
  'Delayed': '#ef4444',     // Red (Overdue)
  'Archived': '#94a3b8',    // Gray
};

export default function CalendarCard({ events = [] }) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const mapped = events.map((e) => {
      const statusColor = STATUS_COLORS[e.assignment_status] || '#f59e0b';
      return {
        id: String(e.id),
        title: e.title,
        start: e.event_date,
        backgroundColor: statusColor,
        borderColor: 'transparent',
        extendedProps: { ...e },
      };
    });
    setCalendarEvents(mapped);
  }, [events]);

  function handleEventClick(info) {
    setSelectedEvent(info.event.extendedProps);
  }

  function handleViewDetails() {
    if (!selectedEvent) return;
    const url = isAdmin
      ? `/admin/assignments/${selectedEvent.assignment_id}`
      : `/staff/tasks/${selectedEvent.assignment_id}`;
    navigate(url);
    setSelectedEvent(null);
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-card p-4 sm:p-6"
      >
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek',
          }}
          events={calendarEvents}
          height="auto"
          eventDisplay="block"
          dayMaxEvents={3}
          weekends={true}
          eventClick={handleEventClick}
          eventClassNames="cursor-pointer hover:brightness-95 transition-all"
        />
      </motion.div>

      {/* Interactive Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-500 to-violet-500 px-6 py-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Clipboard className="w-5 h-5 opacity-80" />
                  <span className="text-sm font-semibold tracking-wider uppercase">Event Details</span>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{selectedEvent.title}</h4>
                  <p className="text-xs text-primary-500 font-semibold mt-1">
                    Event Type: {selectedEvent.event_type}
                  </p>
                </div>

                {/* Event Schedule Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
                  <div className="flex items-center gap-3 text-gray-700">
                    <CalendarIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase">Scheduled Time</p>
                      <p className="font-medium">{formatDateTime(selectedEvent.event_date)}</p>
                    </div>
                  </div>

                  {selectedEvent.assigned_to_name && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase">Assigned Staff</p>
                        <p className="font-medium">{selectedEvent.assigned_to_name}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Assignment Work Metadata */}
                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Associated Assignment</h5>
                  
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-semibold text-gray-800">{selectedEvent.assignment_title}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-400 mb-1">Work Status</p>
                      <StatusBadge status={selectedEvent.assignment_status || 'Assigned'} />
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Priority Level</p>
                      <PriorityBadge priority={selectedEvent.assignment_priority || 'Medium'} />
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Content Category</p>
                      <span className="font-medium text-gray-800">{selectedEvent.category}</span>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Content Format</p>
                      <span className="font-medium text-gray-800">{selectedEvent.content_type}</span>
                    </div>
                  </div>

                  {selectedEvent.description && (
                    <div className="text-xs bg-gray-50/50 p-3 rounded-lg border border-gray-100/50">
                      <p className="text-gray-400 font-medium mb-1">Instructions / Description</p>
                      <p className="text-gray-700 leading-relaxed font-sans">{selectedEvent.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleViewDetails}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>View Full Assignment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
