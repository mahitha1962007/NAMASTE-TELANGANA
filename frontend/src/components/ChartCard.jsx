import { motion } from 'framer-motion';

export default function ChartCard({ title, children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-white rounded-2xl shadow-card p-6 ${className}`}
    >
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      {children}
    </motion.div>
  );
}
