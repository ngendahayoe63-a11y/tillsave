import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, PlusCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  role: 'ORGANIZER' | 'MEMBER';
}

export const BottomNav: React.FC<BottomNavProps> = ({ role }) => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const organizerLinks = [
    { href: '/organizer', icon: Home, label: t('common.history') || 'Home' },
    { href: '/organizer/create-group', icon: PlusCircle, label: t('groups.create_btn') || 'New' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  const memberLinks = [
    { href: '/member', icon: Home, label: 'Home' },
    { href: '/member/join-group', icon: PlusCircle, label: t('groups.join_btn') || 'Join' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  const links = role === 'ORGANIZER' ? organizerLinks : memberLinks;

  return (
    // FIX: Added dark:bg-slate-900 and dark:border-gray-800
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 pb-safe transition-colors duration-300">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link 
              key={link.href} 
              to={link.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1",
                isActive 
                  ? "text-primary" 
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "fill-current opacity-20")} />
              <span className="text-[10px] font-medium truncate max-w-[80px]">
                {link.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};