import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentsService } from '@/services/paymentsService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Save } from 'lucide-react';

export const EditPaymentPage = () => {
  const { groupId, paymentId } = useParams();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalPayment, setOriginalPayment] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    amount: '',
    date: ''
  });

  useEffect(() => {
    const loadData = async () => {
      if (!paymentId) return;
      try {
        const data = await paymentsService.getPaymentById(paymentId);
        setOriginalPayment(data);
        setFormData({
          amount: data.amount.toString(),
          date: data.payment_date
        });
      } catch (error) {
        console.error(error);
        alert("Payment not found");
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [paymentId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentId) return;

    setIsSubmitting(true);
    try {
      await paymentsService.updatePayment(
        paymentId,
        parseFloat(formData.amount),
        new Date(formData.date)
      );
      
      alert("Payment Updated Successfully!");
      navigate(-1);
      
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <Button variant="ghost" className="mb-4 pl-0" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Read Only Currency Display */}
            <div className="p-3 bg-gray-100 rounded text-center">
                <span className="text-gray-500 text-xs uppercase block">Currency</span>
                <span className="font-bold text-xl">{originalPayment.currency}</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount Received</Label>
              <Input 
                id="amount" 
                type="number" 
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="text-lg font-bold"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date" 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};