import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { groupsService } from '@/services/groupsService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { Loader2, ArrowLeft, Users, Calendar, Copy, LogIn, Search } from 'lucide-react';
import { differenceInCalendarDays } from 'date-fns';

export const BrowseGroupsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [joinedGroupIds, setJoinedGroupIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const [allGroups, joined] = await Promise.all([
          groupsService.getAllActiveGroups(),
          groupsService.getMemberJoinedGroupIds(user.id)
        ]);
        setGroups(allGroups || []);
        setJoinedGroupIds(joined);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load groups');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleJoinGroup = async (groupId: string) => {
    if (!user) return;
    
    try {
      setIsJoining(groupId);
      const group = groups.find(g => g.id === groupId);
      if (!group) throw new Error('Group not found');
      
      await groupsService.joinGroup(user.id, group.join_code);
      
      // Update joined list
      setJoinedGroupIds([...joinedGroupIds, groupId]);
      
      // Navigate to setup page
      setTimeout(() => navigate(`/member/group/${groupId}/setup`), 500);
    } catch (err: any) {
      alert(err.message || 'Failed to join group');
    } finally {
      setIsJoining(null);
    }
  };

  const filteredGroups = groups.filter(g => {
    const name = g.name || '';
    const orgName = g.users?.name || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orgName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const availableGroups = filteredGroups.filter(g => !joinedGroupIds.includes(g.id));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 p-4 shadow-sm sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Browse Groups</h1>
            <p className="text-xs text-gray-500">Discover and join new savings groups</p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-6xl mx-auto">
        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by group name or organizer..."
            className="pl-10 bg-white dark:bg-slate-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Stats */}
        {availableGroups.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-4">
            <Card className="dark:bg-slate-900 dark:border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Available Groups</p>
                    <h3 className="text-2xl font-bold">{availableGroups.length}</h3>
                  </div>
                  <Users className="h-8 w-8 text-blue-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="dark:bg-slate-900 dark:border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Joined</p>
                    <h3 className="text-2xl font-bold">{joinedGroupIds.length}</h3>
                  </div>
                  <Users className="h-8 w-8 text-green-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Groups Grid */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded mb-6">
            {error}
          </div>
        )}

        {availableGroups.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={Users}
              title={joinedGroupIds.length === 0 ? "No Groups Available" : "You've Joined All Available Groups!"}
              description={
                joinedGroupIds.length === 0
                  ? "Check back later or ask your organizer for a join code."
                  : "You're already a member of all available public groups."
              }
              actionLabel="Enter Join Code"
              onAction={() => navigate('/member/join-group')}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableGroups.map((group) => {
              const startDate = new Date(group.current_cycle_start_date);
              const today = new Date();
              const daysPassed = differenceInCalendarDays(today, startDate);
              const daysRemaining = Math.max(0, group.cycle_days - daysPassed);

              return (
                <Card
                  key={group.id}
                  className="hover:shadow-md transition-shadow dark:bg-slate-900 dark:border-gray-800 flex flex-col"
                >
                  <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {group.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Organized by <strong>{group.users?.name || 'Unknown'}</strong>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-4 pb-4 flex-1">
                    {group.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {group.description}
                      </p>
                    )}

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{group.cycle_days} days per cycle</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded">
                          Cycle {group.current_cycle} • {daysRemaining} days left
                        </span>
                      </div>

                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 p-2 rounded border border-dashed border-gray-300 dark:border-gray-700">
                        <code className="text-xs font-mono text-gray-600 dark:text-gray-400">
                          {group.join_code}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(group.join_code);
                            alert('Code copied!');
                          }}
                          className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>

                  <div className="pt-0 pb-4 px-6">
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={isJoining === group.id}
                    >
                      {isJoining === group.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <LogIn className="mr-2 h-4 w-4" />
                      )}
                      {isJoining === group.id ? 'Joining...' : 'Join Group'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
