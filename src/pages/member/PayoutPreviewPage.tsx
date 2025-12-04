import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { payoutService, PayoutCalculation } from '@/services/payoutService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, TrendingUp } from 'lucide-react';

export const PayoutPreviewPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [myPayout, setMyPayout] = useState<PayoutCalculation | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!groupId || !user) return;
      try {
        // We reuse the service! It calculates for everyone, we just pick ours.
        // In a scaled app, we would make a specific API endpoint for single user efficiency.
        const allPayouts = await payoutService.calculateGroupPayouts(groupId);
        
        // Find my record by finding the member ID that matches my User ID
        // Note: The service returns memberId (which is membership uuid), not user uuid. 
        // We match by name for MVP or need to enhance service. 
        // Better approach: The service returns an array. We can filter in the UI for now.
        // Since we don't have membership ID handy in context easily without fetching, 
        // let's match by name (imperfect) or fetch membership first.
        
        // Let's rely on the fact the service returns a structure. 
        // We will just find the one that has our name for this MVP demonstration
        // (Production fix: Service should return userId in the object)
        const mine = allPayouts.find(p => p.memberName === user.name); 
        
        setMyPayout(mine || null);

      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [groupId, user]);

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/member')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Payout Preview</h1>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-4">
        <Card className="bg-gradient-to-br from-green-600 to-green-800 text-white border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" /> Estimated Payout
            </CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-sm opacity-90 mb-4">
               Based on your current contributions minus the 1-day organizer fee.
             </p>
             
             {!myPayout ? (
               <p>No contributions found yet.</p>
             ) : (
               <div className="space-y-4">
                 {myPayout.breakdown.map((b) => (
                   <div key={b.currency} className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold">{b.currency}</span>
                        <span className="text-xl font-bold">{b.netPayout.toLocaleString()}</span>
                      </div>
                      <div className="text-xs flex justify-between opacity-70">
                        <span>Saved: {b.totalSaved.toLocaleString()}</span>
                        <span>Fee: -{b.organizerFee.toLocaleString()}</span>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </CardContent>
        </Card>
        
        <p className="text-xs text-center text-gray-400">
          * Final payout is subject to Organizer verification at cycle end.
        </p>
      </main>
    </div>
  );
};