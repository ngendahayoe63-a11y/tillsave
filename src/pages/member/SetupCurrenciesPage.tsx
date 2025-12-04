import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { currencyService } from '@/services/currencyService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, Save } from 'lucide-react';

// Supported currencies configuration
const SUPPORTED_CURRENCIES = [
  { code: 'RWF', label: 'Rwandan Franc', symbol: 'FRW', min: 100 },
  { code: 'USD', label: 'US Dollar', symbol: '$', min: 1 },
  { code: 'KES', label: 'Kenyan Shilling', symbol: 'KSh', min: 50 },
  { code: 'UGX', label: 'Ugandan Shilling', symbol: 'USh', min: 1000 },
  { code: 'TZS', label: 'Tanzanian Shilling', symbol: 'TSh', min: 500 },
];

export const SetupCurrenciesPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [membershipId, setMembershipId] = useState<string | null>(null);
  
  // State to track enabled currencies and their rates
  // Format: { RWF: 2000, USD: 0, ... }
  const [rates, setRates] = useState<Record<string, number>>({});
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadData = async () => {
      if (!user || !groupId) return;
      
      try {
        // 1. Get Membership ID
        const memId = await currencyService.getMembershipId(user.id, groupId);
        setMembershipId(memId);

        // 2. Get Existing Rates
        const existingRates = await currencyService.getMemberRates(memId);
        
        // 3. Populate Form
        const newRates: Record<string, number> = {};
        const newEnabled: Record<string, boolean> = {};

        existingRates.forEach((r: any) => {
          newRates[r.currency] = r.daily_rate;
          newEnabled[r.currency] = true;
        });

        setRates(prev => ({ ...prev, ...newRates }));
        setEnabled(prev => ({ ...prev, ...newEnabled }));

      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, groupId]);

  const handleRateChange = (currency: string, value: string) => {
    const num = parseFloat(value);
    setRates(prev => ({ ...prev, [currency]: isNaN(num) ? 0 : num }));
  };

  const toggleCurrency = (currency: string) => {
    setEnabled(prev => ({ ...prev, [currency]: !prev[currency] }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!membershipId) return;

    setIsSaving(true);
    try {
      // Filter only enabled currencies with valid rates
      const payload = Object.keys(enabled)
        .filter(code => enabled[code] && rates[code] > 0)
        .map(code => ({
          currency: code,
          daily_rate: rates[code]
        }));

      if (payload.length === 0) {
        alert("Please enable at least one currency and set a daily amount.");
        setIsSaving(false);
        return;
      }

      await currencyService.saveRates(membershipId, payload);
      navigate('/member'); // Go back to dashboard
      
    } catch (error: any) {
      alert("Failed to save: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="p-4 max-w-md mx-auto pb-20">
      <Button variant="ghost" className="mb-4 pl-0" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Savings Goals</CardTitle>
          <CardDescription>
            Select the currencies you want to save in and how much you commit to contribute <strong>every day</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {SUPPORTED_CURRENCIES.map((curr) => (
              <div 
                key={curr.code} 
                className={`p-4 rounded-lg border-2 transition-all ${
                  enabled[curr.code] ? 'border-primary bg-blue-50' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`check-${curr.code}`}
                      checked={!!enabled[curr.code]}
                      onChange={() => toggleCurrency(curr.code)}
                      className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor={`check-${curr.code}`} className="text-base font-semibold cursor-pointer">
                      {curr.label} ({curr.code})
                    </Label>
                  </div>
                  <span className="text-xl">{curr.symbol}</span>
                </div>

                {enabled[curr.code] && (
                  <div className="animate-accordion-down">
                    <Label className="text-xs text-gray-500 mb-1 block">Daily Contribution Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">{curr.symbol}</span>
                      <Input
                        type="number"
                        className="pl-12 text-lg font-bold"
                        placeholder={`${curr.min}`}
                        value={rates[curr.code] || ''}
                        onChange={(e) => handleRateChange(curr.code, e.target.value)}
                        min={curr.min}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Button type="submit" className="w-full h-12 text-lg" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Preferences
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};