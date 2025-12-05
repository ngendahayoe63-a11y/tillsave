import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { groupsService } from '@/services/groupsService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { Loader2, ArrowLeft, History, PlusCircle, Settings, UserPlus, Search, Clock } from 'lucide-react';

export const GroupDetailsPage = () => {
  const { t } = useTranslation();
  const { groupId } = useParams();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); 

  useEffect(() => {
    const loadData = async () => {
      if (!groupId) return;
      try {
        const [groupData, membersData] = await Promise.all([
          groupsService.getGroupDetails(groupId),
          groupsService.getGroupMembers(groupId)
        ]);
        setGroup(groupData);
        setMembers(membersData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [groupId]);

  // Filter Members
  const filteredMembers = members.filter(member => {
      const name = member.users?.name || '';
      return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  if (!group) return <div>Group not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/organizer')}>
            <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">{group.name}</h1>
            <p className="text-xs text-gray-500">{t('groups.cycle')} {group.current_cycle} • {members.length} {t('groups.members_count')}</p>
            </div>
        </div>
        
        <div className="flex gap-2">
            {/* NEW HISTORY BUTTON */}
            <Link to={`/group/${groupId}/history/cycles`}>
                <Button variant="ghost" size="icon">
                    <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </Button>
            </Link>
            
            <Link to={`/organizer/group/${groupId}/settings`}>
                <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </Button>
            </Link>
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto">
        {/* Toolbar: Search + Invite */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-72">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input 
                placeholder="Search members..." 
                className="pl-8 bg-white dark:bg-slate-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>

          <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => {
             navigator.clipboard.writeText(group.join_code);
             alert("Code copied!");
          }}>
             {t('groups.invite')} +
          </Button>
        </div>

        {/* Member Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {members.length === 0 ? (
            <div className="col-span-full">
                <EmptyState
                icon={UserPlus}
                title="Add Your First Member"
                description={`Share the code ${group.join_code} with your friends so they can join this group.`}
                actionLabel="Copy Invite Code"
                onAction={() => {
                    navigator.clipboard.writeText(group.join_code);
                    alert("Code copied!");
                }}
                />
            </div>
          ) : filteredMembers.length > 0 ? (
            filteredMembers.map((member: any) => {
              const memberName = member.users?.name || 'Unknown Member';
              const memberInitials = memberName.substring(0, 2).toUpperCase();

              return (
                <Card key={member.id} className="hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors dark:bg-slate-900 dark:border-gray-800">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {memberInitials}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate text-gray-900 dark:text-gray-100">{memberName}</h3>
                    </div>

                    <div className="flex gap-2">
                      <Link to={`/organizer/group/${groupId}/history/${member.id}`}>
                        <Button variant="outline" size="icon" className="h-9 w-9">
                          <History className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/organizer/group/${groupId}/pay/${member.id}`}>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          <PlusCircle className="h-4 w-4 mr-1" /> {t('common.pay')}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
             <div className="col-span-full text-center py-10 text-muted-foreground">
                No members found matching "{searchTerm}"
             </div>
          )}
        </div>
      </main>
    </div>
  );
};