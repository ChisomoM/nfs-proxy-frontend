import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, KeyRound, Layers, Loader2, Plus, UsersRound } from 'lucide-react';
import { ProjectService } from '@/lib/api/services';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/project';
import { PageHeader } from '@/components/shared/PageHeader';
import { ActionIconButton } from '@/components/shared/ActionIconButton';

// ── Animation variants (matching MetricCard pattern) ─────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as any } },
};

// Per-app avatar color palette — cycles by index
const APP_COLORS = [
  { bg: 'bg-gp-cobalt-100', text: 'text-gp-cobalt' },
  { bg: 'bg-gp-sky-100',    text: 'text-gp-sky-700' },
  { bg: 'bg-success-light', text: 'text-success-fg' },
  { bg: 'bg-warning-light', text: 'text-warning-fg' },
];

const formatShortDate = (date: string) => {
  try {
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(date));
  } catch {
    return 'Recent';
  }
};

interface ProjectListProps {
  onSelectProject?: (project: Project, tab?: 'overview' | 'participants' | 'settings') => void;
  onCreateNew?: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  onSelectProject,
  onCreateNew,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ProjectService.getProjects();
      setProjects(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load apps';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };



  const headerAction = (
    <motion.button
      onClick={onCreateNew}
      className="btn-gradient shimmer-surface h-10 px-5 rounded-xl text-white font-sans text-text-sm font-semibold inline-flex items-center gap-2 shadow-btn-gradient"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <Plus size={15} />
      New App
    </motion.button>
  );

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Apps"
          subtitle="Manage payment apps, API keys, participants, and integration settings."
          action={<div className="skeleton h-10 w-28 rounded-xl" />}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
              <div className="h-1 bg-gray-50" />
              <div className="p-5 space-y-5">
                <div className="flex items-start gap-3">
                  <div className="skeleton h-10 w-10 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-5 w-3/4 rounded-lg" />
                    <div className="skeleton h-4 w-1/2 rounded-md" />
                  </div>
                </div>
                <div className="skeleton h-4 w-full rounded-md" />
                <div className="skeleton h-4 w-2/3 rounded-md" />
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="skeleton h-5 w-16 rounded-full" />
                  <div className="flex gap-2">
                    <div className="skeleton h-9 w-9 rounded-xl" />
                    <div className="skeleton h-9 w-9 rounded-xl" />
                    <div className="skeleton h-9 w-9 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error && projects.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Apps"
          subtitle="Manage payment apps, API keys, participants, and integration settings."
          action={headerAction}
        />
        <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center">
          <div className="flex justify-center mb-5">
            <div className="p-4 bg-danger-light rounded-2xl">
              <Layers className="w-10 h-10 text-danger-fg" />
            </div>
          </div>
          <h3 className="font-display font-semibold text-display-xs text-gray-900 mb-2">Failed to Load Apps</h3>
          <p className="font-sans text-text-sm text-gray-500 mb-6 max-w-sm mx-auto">{error}</p>
          <button
            onClick={fetchProjects}
            className="btn-gradient shimmer-surface h-10 px-6 rounded-xl text-white font-sans text-text-sm font-semibold inline-flex items-center gap-2 shadow-btn-gradient"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (projects.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Apps"
          subtitle="Manage payment apps, API keys, participants, and integration settings."
          action={headerAction}
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl bg-white border border-gray-100 p-16 text-center"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="p-5 bg-gp-cobalt-100 rounded-2xl"
            >
              <Layers className="w-12 h-12 text-gp-cobalt" />
            </motion.div>
          </div>
          <h3 className="font-display font-bold text-display-sm text-gray-900 mb-2">No Apps Yet</h3>
          <p className="font-sans text-text-sm text-gray-500 mb-8 max-w-sm mx-auto">
            Create your first app to start managing API keys and integrations.
          </p>
          <motion.button
            onClick={onCreateNew}
            className="btn-gradient shimmer-surface h-11 px-6 rounded-xl text-white font-sans text-text-sm font-semibold inline-flex items-center gap-2 shadow-btn-gradient"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <Plus size={16} />
            Create Your First App
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ── App grid ──────────────────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Apps"
          subtitle={`${projects.length} ${projects.length === 1 ? 'app' : 'apps'} configured for payment integrations, keys, and participants.`}
          action={headerAction}
        />

        {/* Card grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {projects.map((project, idx) => {
            const color = APP_COLORS[idx % APP_COLORS.length];
            const initial = (project.name?.[0] ?? 'A').toUpperCase();

            return (
              <motion.div
                key={project.id}
                variants={itemVariants}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="group cursor-pointer"
                onClick={() => onSelectProject?.(project)}
              >
                <Card className="bg-white border border-gray-100 rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-200 group-hover:border-gp-cobalt/20 group-hover:shadow-md">
                  {/* <div className="h-1 w-full bg-gradient-to-r from-gp-cobalt/80 via-[#2b6fc2]/70 to-gp-sky/80" /> */}

                  <CardContent className="p-5 flex flex-col flex-1 gap-5">
                    {/* App identity row */}
                    <div className="flex items-start gap-3.5">
                      <div className={cn(
                        'h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0',
                        'font-display font-bold text-text-lg',
                        color.bg,
                        color.text,
                      )}>
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-display font-semibold text-text-lg text-gray-900 truncate group-hover:text-gp-cobalt transition-colors duration-150">
                            {project.name}
                          </h3>
                          <span className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-sans text-text-xs font-medium flex-shrink-0',
                            project.is_active
                              ? 'bg-success-light text-success-fg'
                              : 'bg-gp-slate-100 text-gp-slate-500',
                          )}>
                            <span className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              project.is_active ? 'bg-success' : 'bg-gp-slate-400',
                            )} />
                            {project.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="font-sans text-text-xs text-gray-400 mt-1">
                          {project.primary_environment === 'production' ? 'Production' : 'Sandbox'} environment
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="font-sans text-text-sm text-gray-500 line-clamp-2 leading-relaxed flex-1">
                      {project.description
                        ? project.description
                        : <span className="italic text-gray-300">No description</span>}
                    </p>

                    {/* Quick actions */}
                    <div className="flex items-center gap-1 pt-1">
                      <ActionIconButton
                        icon={<Eye />}
                        label="View app"
                        variant="brand"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject?.(project, 'overview');
                        }}
                      />
                      <ActionIconButton
                        icon={<KeyRound />}
                        label="Manage API keys"
                        variant="neutral"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject?.(project, 'settings');
                        }}
                      />
                      <ActionIconButton
                        icon={<UsersRound />}
                        label="Manage participants"
                        variant="neutral"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject?.(project, 'participants');
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>


    </>
  );
};
