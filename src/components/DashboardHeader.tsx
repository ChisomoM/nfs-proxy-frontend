import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Mail, ChevronDown, User, Settings, LogOut } from 'lucide-react';

const SPRING_BTN = { type: 'spring' as const, stiffness: 400, damping: 20 };
const SPRING_ROW = { type: 'spring' as const, stiffness: 400, damping: 20 };

interface DashboardHeaderProps {
  userName: string;
  userTitle: string;
  userInitials: string;
  contextLine: string;
  onLogout: () => void;
  onSearchClick?: () => void;
}

export default function DashboardHeader({
  userName,
  userTitle,
  userInitials,
  contextLine,
  onLogout,
  onSearchClick,
}: DashboardHeaderProps) {
  const [open, setOpen] = useState(false);

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex justify-end px-10 mx-auto">
      {/* <div>
        <h1 className="font-display font-bold text-display-sm text-gray-900 tracking-tight leading-none">
          Welcome back, {userName}
        </h1>
        <p className="font-sans text-sm font-medium text-slate-500 mt-1.5">{dateStr}</p>
      </div> */}

      <div className="flex items-center gap-5">
        {/* Icon buttons */}
        <div className="flex items-center gap-4">
          <motion.button
            onClick={onSearchClick}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.88 }}
            transition={SPRING_BTN}
            aria-label="Search"
          >
            {/* <Search size={18} strokeWidth={1.5} /> */}
          </motion.button>
          {([Bell, Mail] as const).map((Icon, i) => (
            <motion.button
              key={i}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.88 }}
              transition={SPRING_BTN}
            >
              <Icon size={18} strokeWidth={1.5} />
            </motion.button>
          ))}
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* Profile pill + dropdown */}
        <div className="relative">
          {open && (
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          )}

          <motion.button
            className="flex items-center gap-3 cursor-pointer select-none relative z-20"
            onClick={() => setOpen(!open)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={SPRING_BTN}
          >
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold bg-gp-cobalt text-white flex-shrink-0">
              {userInitials}
            </div>
            <div className="leading-none text-left">
              <div className="font-sans font-semibold text-sm text-slate-800">{userName}</div>
              <div className="font-sans text-xs text-slate-400 mt-1">{userTitle}</div>
            </div>
            <motion.div
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="ml-1"
            >
              <ChevronDown size={14} className="text-slate-400" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -4 }}
                transition={{ duration: 0.14, ease: 'easeOut' }}
                className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-slate-100 p-1.5 z-20"
                style={{ boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
              >
                {([
                  { label: 'View Profile', icon: User },
                  { label: 'Settings', icon: Settings },
                ] as { label: string; icon: typeof User }[]).map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <motion.button
                      key={item.label}
                      onClick={() => setOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left hover:bg-slate-50 text-slate-600"
                      whileHover={{ x: 2 }}
                      transition={SPRING_ROW}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-100">
                        <ItemIcon size={14} className="text-slate-500" />
                      </div>
                      <p className="font-sans text-sm font-semibold leading-none">{item.label}</p>
                    </motion.button>
                  );
                })}

                <div className="my-1 h-px bg-slate-100 mx-3" />

                <motion.button
                  onClick={() => { onLogout(); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left hover:bg-red-50 text-slate-600 hover:text-red-600"
                  whileHover={{ x: 2 }}
                  transition={SPRING_ROW}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-100">
                    <LogOut size={14} className="text-slate-500" />
                  </div>
                  <p className="font-sans text-sm font-semibold leading-none">Sign Out</p>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
