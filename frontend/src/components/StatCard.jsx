import { motion } from 'framer-motion';

export default function StatCard({ title, value, icon: Icon, gradient = 'stat-gradient-blue', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`${gradient} rounded-xl p-5 text-white shadow-lg cursor-default relative overflow-hidden`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
      <div className="absolute bottom-0 left-0 w-14 h-14 bg-white/5 rounded-full translate-y-4 -translate-x-4" />

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        {Icon && (
          <div className="p-3 bg-white/15 rounded-xl">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
