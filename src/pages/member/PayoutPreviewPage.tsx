import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { payoutService } from '@/services/payoutService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, TrendingUp, AlertCircle } from 'lucide-react';

export const PayoutPreviewPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myPayout, setMyPayout] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!groupId || !user) {
        setError('Missing group ID or user information');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch all payouts for the group
        const allPayouts = await payoutService.previewCyclePayout(groupId);
        
        console.log('All payouts:', allPayouts);
        console.log('Looking for user:', user.name);
        
        // Find my payout items by matching member name with user name
        const myPayoutItems = allPayouts.filter((p: any) => p.memberName === user.name);
        
        console.log('My payout items:', myPayoutItems);
        
        if (myPayoutItems.length === 0) {
          setError('No payout data found. You may not have made any contributions yet.');
        } else {
          setMyPayout(myPayoutItems);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load payout data';
        console.error('Payout preview error:', err);
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [groupId, user?.name]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <header className="bg-white dark:bg-slate-900 p-4 shadow-sm sticky top-0 z-10 flex items-center gap-4 border-b border-gray-200 dark:border-gray-800">
          <Button variant="ghost" size="icon" onClick={() => navigate('/member')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold dark:text-white">Payout Preview</h1>
        </header>
        <div className="flex justify-center items-center p-8 min-h-[400px]">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20">
      <header className="bg-white dark:bg-slate-900 p-4 shadow-sm sticky top-0 z-10 flex items-center gap-4 border-b border-gray-200 dark:border-gray-800">
        <Button variant="ghost" size="icon" onClick={() => navigate('/member')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold dark:text-white">Payout Preview</h1>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-4">
        {error ? (
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-6 flex gap-4">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-900 dark:text-red-100">No Payout Data</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => navigate('/member')}
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : myPayout.length === 0 ? (
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <p className="text-blue-900 dark:text-blue-100">No contributions found for this cycle yet.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {myPayout.map((item, idx) => (
                <Card key={idx} className="bg-gradient-to-br from-green-600 to-green-800 text-white border-none shadow-lg dark:from-green-900 dark:to-green-950">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5" /> {item.currency} Payout
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm opacity-90 mb-4">
                      Based on your contributions minus the 1-day organizer fee.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold">Gross Saved</span>
                          <span className="text-2xl font-bold">{item.totalSaved.toLocaleString()}</span>
                        </div>
                        <div className="text-xs opacity-75">
                          {item.daysContributed} days × {(item.totalSaved / item.daysContributed).toFixed(0)} {item.currency}/day
                        </div>
                      </div>

                      <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold">Organizer Fee</span>
                          <span className="text-lg font-bold">-{item.organizerFee.toLocaleString()}</span>
                        </div>
                        <div className="text-xs opacity-75">
                          1 day contribution = {item.organizerFee.toLocaleString()} {item.currency}
                        </div>
                      </div>

                      <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm border-2 border-white/30 mt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold">Net Payout</span>
                          <span className="text-3xl font-bold">{item.netPayout.toLocaleString()}</span>
                        </div>
                        <div className="text-xs opacity-75 mt-2">
                          {item.currency}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
              * Final payout is subject to Organizer verification at cycle end.
            </p>
          </>
        )}
      </main>
    </div>
  );
};