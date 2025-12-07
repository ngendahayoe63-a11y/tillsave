import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/components/ui/toast';
import { supabase } from '@/api/supabase';
import { paymentsService } from '@/services/paymentsService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowLeft, Pencil, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export const MemberLedgerPage = () => {
  const { groupId, membershipId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [memberName, setMemberName] = useState('');
  const [payments, setPayments] = useState<any[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);

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
    setDeletePaymentId(paymentId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deletePaymentId) return;
    
    try {
      await paymentsService.deletePayment(deletePaymentId);
      // Remove from UI
      setPayments(prev => prev.filter(p => p.id !== deletePaymentId));
      addToast({
        type: 'success',
        title: 'Payment deleted',
        description: 'The payment has been removed',
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Failed to delete',
        description: error.message,
      });
    } finally {
      setShowDeleteDialog(false);
      setDeletePaymentId(null);
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20">
      <header className="bg-white dark:bg-slate-900 p-4 shadow-sm sticky top-0 z-10 flex items-center gap-4 border-b border-gray-200 dark:border-gray-800">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/organizer/group/${groupId}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">{memberName}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Payment History</p>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-4">
        <Link to={`/organizer/group/${groupId}/pay/${membershipId}`}>
            <Button className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600">
                + Record New Payment
            </Button>
        </Link>

        {payments.length === 0 ? (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500 bg-white dark:bg-slate-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            No payments found.
          </div>
        ) : (
          payments.map((payment) => (
            <Card key={payment.id} className="border-l-4 border-l-blue-500 dark:border-l-blue-600 bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700">
              <CardContent className="p-3 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                  </div>
                  <div className="font-bold text-lg text-gray-900 dark:text-gray-100">
                    {payment.amount.toLocaleString()} <span className="text-sm font-normal text-gray-600 dark:text-gray-400">{payment.currency}</span>
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

      {/* Delete Confirmation Modal */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm dark:bg-slate-900">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <h2 className="text-lg font-bold dark:text-white">Delete Payment?</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Are you sure you want to delete this payment? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white" 
                  onClick={confirmDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};