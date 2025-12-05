import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { payoutService } from '@/services/payoutService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowLeft, Calendar, ChevronRight, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { EmptyState } from '@/components/shared/EmptyState';

export const CycleHistoryPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [cycles, setCycles] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!groupId) return;
      try {
        const data = await payoutService.getPastCycles(groupId);
        setCycles(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [groupId]);

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 p-4 shadow-sm sticky top-0 z-10 flex items-center gap-4 border-b border-gray-200 dark:border-gray-800">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-200" />
        </Button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Past Cycles</h1>
      </header>

      <main className="p-4 max-w-7xl mx-auto">
        {cycles.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Past Cycles"
            description="Once a cycle is finalized, the history will appear here."
          />
        ) : (
          // FIX: Responsive Grid for History Cards
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cycles.map((cycle) => (
              <Link key={cycle.id} to={`/group/${groupId}/history/cycle/${cycle.id}`}>
                <Card className="hover:bg-gray-50 dark:bg-slate-900 dark:border-gray-800 dark:hover:bg-slate-800 transition-colors h-full">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">Cycle {cycle.cycle_number}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(cycle.payout_date), 'MMMM dd, yyyy')}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};