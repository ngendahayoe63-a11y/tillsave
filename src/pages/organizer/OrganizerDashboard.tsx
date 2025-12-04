import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useGroupsStore } from '@/store/groupsStore';
import { analyticsService } from '@/services/analyticsService';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Import Input
import { Card, CardContent } from '@/components/ui/card';
import { GroupCard } from '@/components/groups/GroupCard';
import { DashboardSkeleton } from '@/components/shared/DashboardSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Plus, Users, LayoutGrid, Search } from 'lucide-react';

export const OrganizerDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { groups, fetchGroups, isLoading: groupsLoading } = useGroupsStore();
  
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchGroups(user.id, 'ORGANIZER');
      analyticsService.getGlobalOrganizerStats(user.id)
        .then(data => setGlobalStats(data))
        .catch(err => console.error(err))
        .finally(() => setStatsLoading(false));
    }
  }, [user, fetchGroups]);

  const renderCurrencyLine = (data: Record<string, number> | undefined) => {
    if (!data || Object.keys(data).length === 0) return "0";
    return Object.entries(data).map(([curr, val]) => (
      <span key={curr} className="mr-3">
        <span className="text-xs opacity-70 mr-1">{curr}</span>
        {val.toLocaleString()}
      </span>
    ));
  };

  // Filter Logic
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    group.join_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      
      {/* Max width container for responsiveness */}
      <div className="p-4 max-w-7xl mx-auto space-y-6">

        {/* Global Summary Card - Full Width on Mobile, limited on Desktop */}
        <div className="max-w-md mx-auto lg:max-w-none">
            {!statsLoading && globalStats && globalStats.totalGroups > 0 && (
            <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-none shadow-xl">
                <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4 opacity-80">
                    <LayoutGrid className="h-4 w-4" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Business Overview</span>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                    <div>
                    <p className="text-xs text-gray-400 mb-1">Total Managed</p>
                    <div className="font-bold text-lg leading-tight">
                        {renderCurrencyLine(globalStats.totalManaged)}
                    </div>
                    </div>
                    <div>
                    <p className="text-xs text-gray-400 mb-1">My Earnings (Mo.)</p>
                    <div className="font-bold text-lg leading-tight text-green-400">
                        {renderCurrencyLine(globalStats.totalEarnings)}
                    </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-400" />
                        <span>{globalStats.totalMembers} Members</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4 text-purple-400" />
                        <span>{globalStats.totalGroups} Groups</span>
                    </div>
                </div>
                </CardContent>
            </Card>
            )}
        </div>

        {/* Action Bar: Search + Create Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('dashboard.my_groups')}</h2>
            
            <div className="flex w-full sm:w-auto gap-2">
                <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search groups..." 
                        className="pl-8 bg-white dark:bg-slate-900" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                {groups.length > 0 && (
                    <Link to="/organizer/create-group">
                        <Button size="sm" className="gap-2 h-10">
                        <Plus className="h-4 w-4" /> <span className="hidden sm:inline">{t('dashboard.new_group')}</span>
                        </Button>
                    </Link>
                )}
            </div>
        </div>

        {/* Groups Grid */}
        {groupsLoading ? (
            <DashboardSkeleton />
        ) : filteredGroups.length > 0 ? (
            // FIX: Responsive Grid Layout
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGroups.map((group) => (
                    <GroupCard key={group.id} group={group} role="ORGANIZER" />
                ))}
            </div>
        ) : (
            groups.length > 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    No groups found matching "{searchTerm}"
                </div>
            ) : (
                <EmptyState
                    icon={Users}
                    title="Start Your First Community"
                    description="Create a savings group, invite members, and start tracking contributions today."
                    actionLabel={t('dashboard.create_first')}
                    onAction={() => window.location.href = '/organizer/create-group'}
                />
            )
        )}
      </div>
    </div>
  );
};