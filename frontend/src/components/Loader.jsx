import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function Loader({ text = 'Loading...', fullScreen = true }) {
  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-3"
    >
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      <p className="text-sm text-gray-500 font-medium">{text}</p>
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20">
      {content}
    </div>
  );
}
