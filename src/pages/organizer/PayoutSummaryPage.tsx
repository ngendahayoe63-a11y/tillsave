import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import translation hook
import { payoutService } from '@/services/payoutService';
import { groupsService } from '@/services/groupsService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Download, Wallet } from 'lucide-react';

export const PayoutSummaryPage = () => {
  const { t } = useTranslation(); // Initialize translation
  const { groupId } = useParams();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [groupName, setGroupName] = useState('');
  const [payouts, setPayouts] = useState<any[]>([]);
  const [totalEarnings, setTotalEarnings] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadData = async () => {
      if (!groupId) return;
      try {
        // 1. Get Group Info
        const group = await groupsService.getGroupDetails(groupId);
        setGroupName(group.name);

        // 2. Calculate Math
        const data = await payoutService.previewCyclePayout(groupId);
        setPayouts(data);

        // 3. Calculate Organizer Earnings (Sum of all fees)
        const earnings: Record<string, number> = {};
        data.forEach((p: any) => {
          if (!earnings[p.currency]) earnings[p.currency] = 0;
          earnings[p.currency] += p.organizerFee;
        });
        setTotalEarnings(earnings);

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
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/organizer')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold">{t('payouts.report_title')}</h1>
          <p className="text-xs text-gray-500">{groupName}</p>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-6">
        
        {/* Organizer Earnings Card */}
        <Card className="bg-primary text-primary-foreground border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5" /> {t('payouts.your_earnings')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(totalEarnings).length === 0 ? (
              <p className="opacity-80">No earnings yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(totalEarnings).map(([curr, amount]) => (
                  <div key={curr}>
                    <p className="text-xs opacity-80">{curr}</p>
                    <p className="text-2xl font-bold">{amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Member Breakdown */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{t('payouts.member_payouts')}</h2>
          
          <div className="space-y-4">
            {payouts.map((member) => (
              <Card key={member.membershipId}>
                <CardHeader className="p-4 bg-gray-50 border-b">
                  <h3 className="font-bold">{member.memberName}</h3>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="border-l-2 border-primary pl-3">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-bold text-lg">{member.currency}</span>
                        <span className="text-xs text-gray-500">{member.daysContributed} {t('payouts.days_paid')}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-y-1 text-sm">
                        <div className="text-gray-500">{t('payouts.total_saved')}:</div>
                        <div className="text-right font-medium">{member.totalSaved.toLocaleString()}</div>
                        
                        <div className="text-red-500">{t('payouts.org_fee')}:</div>
                        <div className="text-right text-red-500">- {member.organizerFee.toLocaleString()}</div>
                        
                        <div className="col-span-2 border-t my-1"></div>
                        
                        <div className="font-bold">{t('payouts.net_payout')}:</div>
                        <div className="text-right font-bold text-green-700 text-lg">
                          {member.netPayout.toLocaleString()}
                        </div>
                      </div>
                    </div>
                </CardContent>
              </Card>
            ))}

            {payouts.length === 0 && (
              <p className="text-center text-gray-500">{t('payments.no_payments')}</p>
            )}
          </div>
        </div>

        <Button variant="outline" className="w-full" onClick={() => alert("PDF Export coming in Phase 2!")}>
          <Download className="mr-2 h-4 w-4" /> Export Report (PDF)
        </Button>

      </main>
    </div>
  );
};