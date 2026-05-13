import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LogOut,
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Send,
  ScrollText,
} from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';
import { useAuth } from '@/lib/context/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard',     to: '/merchant/dashboard',           icon: LayoutDashboard },
  { label: 'Transactions',  to: '/merchant/transactions',        icon: ArrowLeftRight  },
  // { label: 'Settlements',    to: '/merchant/settlements',      icon: Wallet          },
  { label: 'Disbursements', to: '/merchant/disbursements',       icon: Send            },
  { label: 'Simulator',     to: '/merchant/simulator',           icon: FlaskConical    },
  // { label: 'Audit Trail',   to: '/merchant/audit',               icon: ScrollText      },
  { label: 'Settings',      to: '/merchant/settings',            icon: Settings        },
];

export default function MerchantLayout() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    if (user?.first_name && user?.last_name) return `${user.first_name} ${user.last_name}`;
    return user?.email ?? 'Merchant';
  };

  const getUserEmail = () => user?.email ?? 'merchant@example.com';

  const getInitials = () => {
    const name = getUserDisplayName();
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <SidebarProvider>
        {/* Sidebar Container */}
        <div className="relative">
          {/* Sidebar */}
          <aside
            className={cn(
              "sidebar-ambient h-screen flex flex-col relative transition-all duration-300 border-r border-white/[0.06] flex-shrink-0 z-40 overflow-x-hidden overflow-y-auto",
              isCollapsed ? "w-20" : "w-72"
            )}
          >
          {/* Sidebar Header / Logo */}
          <div className="h-15 flex-shrink-0 flex items-center px-6 mt-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-gp-cobalt to-gp-sky flex items-center justify-center font-display font-bold text-white shadow-glow-cobalt">
                GP
              </div>
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="font-display font-bold text-display-xs text-white tracking-tight"
                >
                  GeePay<span className="text-gp-sky">.</span>
                </motion.span>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-1.5 custom-scrollbar">
            {NAV_ITEMS.map(({ label, to, icon: Icon }) => {
              const active = isActive(to);
              return (
                <Link key={to} to={to}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 10 }}
                    className={cn(
                      "flex items-center gap-3 h-11 px-3.5 rounded-xl transition-all duration-100 group relative",
                      active 
                        ? "bg-[var(--sidebar-item-active)] text-gp-sky" 
                        : "text-gray-400 hover:text-white hover:bg-[var(--sidebar-item-hover)]"
                    )}
                  >
                    {active && (
                      <motion.div 
                        layoutId="sidebar-active-indicator"
                        className="absolute left-0 w-1 h-5 bg-gp-sky rounded-r-full" 
                        transition={{ type: 'spring', stiffness: 600, damping: 20 }}
                      />
                    )}
                    <Icon className={cn("h-5 w-5 flex-shrink-0", active ? "text-gp-sky" : "group-hover:text-white")} />
                    {!isCollapsed && (
                      <span className="font-sans font-medium text-text-sm truncate">
                        {label}
                      </span>
                    )}
                    {isCollapsed && (
                      <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                        {label}
                      </div>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* User Section & Footer */}
          <div className="p-4 mt-auto">
            <div className={cn(
              "p-3.5 rounded-2xl transition-all duration-300 border border-white/[0.04]",
              isCollapsed ? "bg-transparent" : "bg-white/[0.04] backdrop-blur-sm"
            )}>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 ring-2 ring-gp-sky/20 flex-shrink-0">
                  <AvatarImage src="" alt={getUserDisplayName()} />
                  <AvatarFallback className="bg-gradient-to-br from-gp-cobalt to-gp-navy text-white font-display font-semibold text-xs border border-white/10">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="text-text-sm font-semibold text-white truncate font-display">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-text-xs text-gray-500 truncate font-sans">
                      {getUserEmail()}
                    </p>
                  </div>
                )}
              </div>
              
              {!isCollapsed && (
                <motion.button
                  whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#FEE2E2' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  onClick={() => logout()}
                  className="mt-4 w-full flex items-center justify-center gap-2 h-9 rounded-xl text-gray-400 hover:text-red-400 text-text-xs font-medium transition-colors"
                >
                  <LogOut size={14} />
                  <span>Log Out</span>
                </motion.button>
              )}
            </div>
          </div>
        </aside>

          {/* Collapse Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "absolute top-12 h-6 w-6 bg-gp-sky text-white rounded-full flex items-center justify-center shadow-lg border-2 border-[#090D32] z-50 cursor-pointer",
              isCollapsed ? "-right-3" : "-right-3"
            )}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </motion.button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          {/* <header className="flex-shrink-0 bg-white first-line:px-8 py-5 z-30">
            <DashboardHeader
              userName={getUserDisplayName()}
              userTitle="Merchant Account"
              userInitials={getInitials()}
              contextLine="NFS GeePay · Merchant Portal"
              onLogout={logout}
            />
          </header> */}

          {/* Main Viewport */}
          <main className="flex-1 overflow-y-auto p-8 bg-gray-50/50 custom-scrollbar relative">
            <div className="max-w-[1280px] mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
