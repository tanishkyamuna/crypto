import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircleIcon,
    colors: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    iconColor: 'text-green-500',
  },
  error: {
    icon: XCircleIcon,
    colors: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    iconColor: 'text-red-500',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    colors: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    iconColor: 'text-yellow-500',
  },
  info: {
    icon: InformationCircleIcon,
    colors: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    iconColor: 'text-blue-500',
  },
};

export default function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const config = toastConfig[type];
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.5 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`relative p-4 rounded-2xl border shadow-lg backdrop-blur-sm ${config.colors} max-w-sm w-full`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <IconComponent className={`h-6 w-6 ${config.iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{title}</h3>
          {message && (
            <p className="mt-1 text-sm opacity-90">{message}</p>
          )}
        </div>
        <button
          onClick={() => onClose(id)}
          className="ml-4 flex-shrink-0 rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
      
      {/* Progress bar */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: duration / 1000, ease: "linear" }}
        className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-2xl"
        onAnimationComplete={() => onClose(id)}
      />
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
  }>;
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              id={toast.id}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              duration={toast.duration}
              onClose={onClose}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
