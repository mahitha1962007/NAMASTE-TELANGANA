import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { Eye, Edit, Archive, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/constants';

export default function AssignmentTable({ assignments, isAdmin = false, onArchive, onDelete, basePath = '/admin/assignments' }) {
  const navigate = useNavigate();

  if (!assignments || assignments.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Story</th>
            {isAdmin && <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>}
            {!isAdmin && <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">My Role</th>}
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Deadline</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {assignments.map((a, idx) => {
            const reporter = a.members?.find((m) => m.role_in_assignment === 'reporter');
            return (
              <motion.tr
                key={a.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="hover:bg-gray-50/80 transition-colors group"
              >
                <td className="px-4 py-3.5">
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{a.title}</p>
                    {isAdmin && reporter && (
                      <p className="text-xs text-gray-400 mt-0.5">Reporter: {reporter.user_name}</p>
                    )}
                  </div>
                </td>
                {isAdmin && <td className="px-4 py-3.5 hidden md:table-cell text-gray-600">{a.category || '—'}</td>}
                {!isAdmin && <td className="px-4 py-3.5 text-gray-600 capitalize">{a.my_role || '—'}</td>}
                <td className="px-4 py-3.5 hidden sm:table-cell text-gray-600">{formatDate(a.publication_deadline)}</td>
                <td className="px-4 py-3.5"><PriorityBadge priority={a.priority} /></td>
                <td className="px-4 py-3.5"><StatusBadge status={a.status} /></td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`${basePath}/${a.id}`)}
                      className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    {isAdmin && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate(`${basePath}/${a.id}/edit`)}
                          className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        {onArchive && a.status !== 'Archived' && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onArchive(a.id)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Archive"
                          >
                            <Archive className="w-4 h-4" />
                          </motion.button>
                        )}
                        {onDelete && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onDelete(a.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
