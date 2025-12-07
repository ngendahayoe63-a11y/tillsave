import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/toast';
import { useAuthStore } from '@/store/authStore';
import { currencyService } from '@/services/currencyService';
import { paymentsService } from '@/services/paymentsService';
import { supabase } from '@/api/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, CheckCircle, Camera, X } from 'lucide-react';
import { format } from 'date-fns';

export const RecordPaymentPage = () => {
  const { t } = useTranslation();
  const { groupId, membershipId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [memberName, setMemberName] = useState('');
  const [activeRates, setActiveRates] = useState<any[]>([]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    currency: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    const loadData = async () => {
      if (!membershipId) return;
      try {
        const { data: memberData } = await supabase
          .from('memberships')
          .select('users(name)')
          .eq('id', membershipId)
          .single();
          
        if (memberData?.users) {
          // @ts-ignore
          setMemberName(memberData.users.name);
        }

        const rates = await currencyService.getMemberRates(membershipId);
        setActiveRates(rates);

        if (rates.length > 0) {
          setFormData(prev => ({
            ...prev,
            currency: rates[0].currency,
            amount: rates[0].daily_rate.toString()
          }));
        } else {
          // If no rates, set default currency to RWF
          setFormData(prev => ({
            ...prev,
            currency: 'RWF',
            amount: ''
          }));
        }

      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [membershipId]);

  const handleCurrencyChange = (value: string) => {
    const rate = activeRates.find(r => r.currency === value);
    setFormData({
      ...formData,
      currency: value,
      amount: rate ? rate.daily_rate.toString() : formData.amount // Keep existing amount if no rate found
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearFile = () => {
    setReceiptFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !groupId || !membershipId) return;

    setIsSubmitting(true);
    try {
      // Parse amount and ensure it's properly formatted (remove floating point errors)
      const amount = Math.round(parseFloat(formData.amount) * 100) / 100;
      
      await paymentsService.recordPayment(
        membershipId,
        groupId,
        amount,
        formData.currency,
        user.id,
        new Date(formData.date),
        receiptFile || undefined // Pass file if exists
      );
      
      addToast({
        type: 'success',
        title: 'Payment recorded',
        description: 'Payment has been saved successfully',
      });
      navigate(-1);
      
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Failed to record payment',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <Button variant="ghost" className="mb-4 pl-0" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back')}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{t('payments.record_title')}</CardTitle>
          <CardDescription>
            {t('payments.recording_for')} <span className="font-bold text-primary">{memberName}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <Label>{t('payments.currency_label')}</Label>
              {activeRates.length > 0 ? (
                <Select 
                  value={formData.currency} 
                  onValueChange={handleCurrencyChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeRates.map((rate) => (
                      <SelectItem key={rate.id} value={rate.currency}>
                        {rate.currency} (Target: {rate.daily_rate})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                // Allow manual currency selection if no rates set
                <Select 
                  value={formData.currency} 
                  onValueChange={(value) => setFormData({...formData, currency: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RWF">RWF (Rwandan Franc)</SelectItem>
                    <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    <SelectItem value="KES">KES (Kenyan Shilling)</SelectItem>
                    <SelectItem value="UGX">UGX (Ugandan Shilling)</SelectItem>
                    <SelectItem value="TZS">TZS (Tanzanian Shilling)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">{t('payments.amount_label')}</Label>
              <Input 
                id="amount" 
                type="number" 
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="text-lg font-bold"
                min="1"
                step="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">{t('payments.date_label')}</Label>
              <Input 
                id="date" 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>

            {/* RECEIPT UPLOAD SECTION */}
            <div className="space-y-2">
              <Label>Proof of Payment (Optional)</Label>
              
              {!previewUrl ? (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-6 h-6 text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500">Take photo or upload receipt</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="relative h-40 w-full rounded-lg overflow-hidden border border-gray-200">
                  <img src={previewUrl} alt="Receipt preview" className="h-full w-full object-cover" />
                  <button 
                    type="button"
                    onClick={clearFile}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full h-12 text-lg bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
              {t('payments.confirm_btn')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};