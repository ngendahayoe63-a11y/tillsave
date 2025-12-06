import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/api/supabase';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { Loader2, ArrowLeft, Calendar, CheckCircle, History, FileText } from 'lucide-react';
import { format } from 'date-fns';

export const PaymentHistoryPage = () => {
  const { t } = useTranslation();
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadData = async () => {
      if (!user || !groupId) return;
      try {
        const { data: membership } = await supabase
          .from('memberships')
          .select('id')
          .eq('user_id', user.id)
          .eq('group_id', groupId)
          .single();

        if (!membership) return;

        const { data: paymentData, error } = await supabase
          .from('payments')
          .select('*')
          .eq('membership_id', membership.id)
          .eq('status', 'CONFIRMED')
          .eq('archived', false)
          .order('payment_date', { ascending: false });

        if (error) throw error;
        setPayments(paymentData || []);

        const calcTotals: Record<string, number> = {};
        paymentData?.forEach(p => {
          if (!calcTotals[p.currency]) calcTotals[p.currency] = 0;
          calcTotals[p.currency] += p.amount;
        });
        setTotals(calcTotals);

      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user, groupId]);

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20">
      <header className="bg-white dark:bg-slate-900 p-4 shadow-sm sticky top-0 z-10 flex items-center gap-4 border-b border-gray-200 dark:border-gray-800">
        <Button variant="ghost" size="icon" onClick={() => navigate('/member')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t('payments.history_title')}</h1>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-4">
        
        {/* Totals Summary */}
        <Card className="bg-blue-600 text-white border-none shadow-md">
          <CardContent className="p-4">
            <h3 className="text-blue-100 text-sm font-medium mb-2">{t('payments.total_contributed')}</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(totals).map(([curr, amount]) => (
                <div key={curr}>
                  <p className="text-xs opacity-70">{curr}</p>
                  <p className="text-2xl font-bold">{amount.toLocaleString()}</p>
                </div>
              ))}
              {Object.keys(totals).length === 0 && <p className="opacity-70">0</p>}
            </div>
          </CardContent>
        </Card>

        {/* Transaction List */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recent Transactions</h3>
          
          {payments.length === 0 ? (
            <EmptyState
              icon={History}
              title="No History Yet"
              description="Once your organizer records a payment, it will appear here instantly."
              className="min-h-[200px]"
            />
          ) : (
            payments.map((payment) => (
              <Card key={payment.id} className="border-l-4 border-l-green-500 bg-white dark:bg-slate-900 dark:border-gray-800">
                <CardContent className="p-3 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                    </div>
                    <div className="font-bold text-lg text-gray-900 dark:text-gray-100">
                      {payment.amount.toLocaleString()} <span className="text-sm font-normal text-gray-600 dark:text-gray-400">{payment.currency}</span>
                    </div>
                    
                    {/* View Receipt Link */}
                    {payment.receipt_url && (
                      <a 
                        href={payment.receipt_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                      >
                        <FileText className="w-3 h-3" /> View Receipt
                      </a>
                    )}
                  </div>
                  <CheckCircle className="text-green-500 w-5 h-5" />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};