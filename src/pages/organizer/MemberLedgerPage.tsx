import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/api/supabase';
import { paymentsService } from '@/services/paymentsService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowLeft, Pencil, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export const MemberLedgerPage = () => {
  const { groupId, membershipId } = useParams();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [memberName, setMemberName] = useState('');
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!membershipId) return;
      try {
        // Fetch Member Name
        const { data: memberData } = await supabase
          .from('memberships')
          .select('users(name)')
          .eq('id', membershipId)
          .single();
        
        // @ts-ignore
        if (memberData?.users) setMemberName(memberData.users.name);

        // Fetch Payments
        const paymentData = await paymentsService.getMembershipPayments(membershipId);
        setPayments(paymentData || []);

      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [membershipId]);

  const handleDelete = async (paymentId: string) => {
    if (!confirm("Are you sure you want to delete this payment? This cannot be undone.")) return;
    
    try {
      await paymentsService.deletePayment(paymentId);
      // Remove from UI
      setPayments(prev => prev.filter(p => p.id !== paymentId));
    } catch (error: any) {
      alert("Failed to delete: " + error.message);
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/organizer/group/${groupId}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold">{memberName}</h1>
          <p className="text-xs text-gray-500">Payment History</p>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-4">
        <Link to={`/organizer/group/${groupId}/pay/${membershipId}`}>
            <Button className="w-full mb-4">
                + Record New Payment
            </Button>
        </Link>

        {payments.length === 0 ? (
          <div className="text-center py-10 text-gray-400 bg-white rounded-lg border border-dashed">
            No payments found.
          </div>
        ) : (
          payments.map((payment) => (
            <Card key={payment.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-3 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                  </div>
                  <div className="font-bold text-lg">
                    {payment.amount.toLocaleString()} <span className="text-sm font-normal text-gray-600">{payment.currency}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link to={`/organizer/group/${groupId}/edit-payment/${payment.id}`}>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Pencil className="w-4 h-4 text-blue-600" />
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleDelete(payment.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
};