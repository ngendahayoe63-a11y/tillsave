import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { analyticsService } from '@/services/analyticsService';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { MemberGroupCard } from '@/components/groups/MemberGroupCard';
import { DashboardSkeleton } from '@/components/shared/DashboardSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Plus, PiggyBank } from 'lucide-react';

export const MemberDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          const data = await analyticsService.getMemberPortfolio(user.id);
          setPortfolio(data);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadData();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      
      {/* Main Content */}
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('dashboard.my_groups')}</h2>
          
          {portfolio.length > 0 && (
            <Link to="/member/join-group">
              <Button size="sm" variant="outline" className="gap-2">
                <Plus className="h-4 w-4" /> {t('dashboard.join_group')}
              </Button>
            </Link>
          )}
        </div>

        {isLoading ? (
          <DashboardSkeleton />
        ) : portfolio.length > 0 ? (
          // FIX: Responsive Grid (1 col mobile, 2 col tablet, 3 col desktop)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolio.map((item) => (
              <div key={item.group.id} className="h-full">
                <MemberGroupCard data={item} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={PiggyBank}
            title="Start Saving Together"
            description="You are not part of any group yet. Enter a code from your organizer to join."
            actionLabel={t('dashboard.join_first')}
            onAction={() => navigate('/member/join-group')}
          />
        )}
      </div>
    </div>
  );
};