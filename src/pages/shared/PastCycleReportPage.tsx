import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { payoutService } from '@/services/payoutService';
import { generatePayoutPDF } from '@/utils/pdfGenerator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowLeft, Download } from 'lucide-react';
import { format } from 'date-fns';

export const PastCycleReportPage = () => {
  const { payoutId } = useParams();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [payout, setPayout] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!payoutId) return;
      try {
        const { payout: pData, items: iData } = await payoutService.getPastPayoutDetails(payoutId);
        setPayout(pData);
        setItems(iData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [payoutId]);

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  if (!payout) return <div>Report not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20">
      <header className="bg-white dark:bg-slate-900 p-4 shadow-sm sticky top-0 z-10 flex items-center gap-4 border-b border-gray-200 dark:border-gray-800">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Cycle {payout.cycle_number} Report</h1>
          <p className="text-xs text-gray-500">{format(new Date(payout.payout_date), 'MMM dd, yyyy')}</p>
        </div>
      </header>

      <main className="p-4 max-w-3xl mx-auto space-y-6">
        
        {/* Breakdown List */}
        <div className="space-y-3">
          {items.map((item, idx) => (
            <Card key={idx} className="bg-white dark:bg-slate-900 dark:border-gray-800">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-bold text-gray-900 dark:text-gray-100">{item.memberName}</div>
                  <div className="text-xs text-gray-500">
                    Saved: {item.totalSaved.toLocaleString()} {item.currency}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-700 dark:text-green-400">
                    {item.netPayout.toLocaleString()} <span className="text-xs text-gray-500">{item.currency}</span>
                  </div>
                  <div className="text-xs text-red-400">
                    Fee: -{item.organizerFee.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => {
             // Mock organizer totals for PDF since we only stored RWF total in DB header for MVP
             // Real production app would store full JSON snapshot in payouts table
             const mockTotals = { "Total Fee (RWF)": payout.organizer_fee_total_rwf }; 
             generatePayoutPDF(`Cycle ${payout.cycle_number}`, items, mockTotals);
          }}
        >
          <Download className="mr-2 h-4 w-4" /> Download PDF
        </Button>

      </main>
    </div>
  );
};