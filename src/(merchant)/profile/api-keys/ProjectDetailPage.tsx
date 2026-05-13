import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProjectDetail } from './ProjectDetail';
import { ArrowLeft, Layers } from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';

export const ProjectDetailPage: React.FC = () => {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab = (location.state as { initialTab?: 'overview' | 'participants' | 'settings' })?.initialTab || 'overview';

  const handleBack = () => {
    navigate('/merchant/apps');
  };

  if (!appId) {
    return (
      <PageTransition className="space-y-6">
        <motion.button
          onClick={handleBack}
          className="inline-flex items-center gap-2 font-sans text-text-sm font-semibold text-gray-600 hover:text-gp-cobalt transition-colors duration-200 group"
          whileHover={{ x: -3 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <motion.div
            className="flex-shrink-0"
            animate={{ x: [0, -2, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <ArrowLeft size={16} strokeWidth={2.5} className="group-hover:text-gp-cobalt transition-colors" />
          </motion.div>
          Back to Apps
        </motion.button>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl bg-white border border-gray-100 shadow-sm p-12 text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
            className="flex justify-center mb-5"
          >
            <div className="p-4 rounded-2xl" style={{ background: 'var(--gradient-cta)' }}>
              <Layers className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
          </motion.div>
          <h3 className="font-display font-semibold text-display-xs text-gray-900 mb-2">
            Invalid App
          </h3>
          <p className="font-sans text-text-sm text-gray-500">This app ID is not valid.</p>
        </motion.div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-6">
      <motion.button
        onClick={handleBack}
        className="inline-flex items-center gap-2 font-sans text-text-sm font-semibold text-gray-600 hover:text-gp-cobalt transition-colors duration-200 group"
        whileHover={{ x: -3 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <motion.div
          className="flex-shrink-0"
          animate={{ x: [0, -2, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
        >
          <ArrowLeft size={16} strokeWidth={2.5} className="group-hover:text-gp-cobalt transition-colors" />
        </motion.div>
        Back to Apps
      </motion.button>
      <ProjectDetail projectId={appId} onBack={handleBack} initialTab={initialTab} />
    </PageTransition>
  );
};
