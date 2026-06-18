import { motion } from 'framer-motion';
import { FileX } from 'lucide-react';

export default function EmptyState({ title = 'No data found', description = 'There are no items to display yet.', icon: Icon = FileX }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-6"
    >
      <div className="p-4 bg-gray-100 rounded-2xl mb-4">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 text-center max-w-sm">{description}</p>
    </motion.div>
  );
}
