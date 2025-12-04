import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { BottomNav } from '@/components/layout/BottomNav';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogOut, User } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';
import { motion } from 'framer-motion';

export const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const { setTheme, theme } = useTheme();

  if (!user) return null;

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    // FIX: Added dark:bg-slate-950 to the main container
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Top Bar (Sticky) */}
      {/* FIX: Added dark:bg-slate-900/80 and dark:border-gray-800 */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex h-16 items-center justify-between px-4 max-w-5xl mx-auto">
          <Link to={user.role === 'ORGANIZER' ? '/organizer' : '/member'} className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline-block text-gray-900 dark:text-gray-100">TillSave</span>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-yellow-500" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
            </Button>

            <Link to="/profile">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </Button>
            </Link>

            <Button variant="ghost" size="icon" onClick={() => logout()}>
              <LogOut className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pb-20 pt-4 px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <BottomNav role={user.role} />
      </div>
    </div>
  );
};