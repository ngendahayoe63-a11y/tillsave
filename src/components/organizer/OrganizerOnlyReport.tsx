import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';
import { organizerOnlyCycleService } from '@/services/organizerOnlyCycleService';
import { organizerOnlyPayoutService } from '@/services/organizerOnlyPayoutService';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/toast';

interface OrganizerOnlyReportProps {
  groupId: string;
  groupName: string;
  onClose: () => void;
  onMembersUpdated?: () => void;
}

export const OrganizerOnlyReport = ({ groupId, groupName, onClose, onMembersUpdated }: OrganizerOnlyReportProps) => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [memberStates, setMemberStates] = useState<Record<string, string>>({});
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const { addToast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadReport();
  }, [groupId]);

  // Trigger confetti ONLY when report first loads (not on status changes)
  useEffect(() => {
    if (report && !loading && Object.keys(memberStates).length === 0) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#16a34a', '#2563eb', '#facc15', '#f97316']
      });
      
      // Initialize member states
      const initialStates: Record<string, string> = {};
      report.members.forEach((m: any) => {
        initialStates[m.id] = m.status;
      });
      setMemberStates(initialStates);
    }
  }, [report, loading]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const reportData = await organizerOnlyCycleService.generateCycleReport(groupId);
      setReport(reportData);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (memberId: string) => {
    try {
      setIsMarkingPaid(true);
      await organizerOnlyPayoutService.markMemberAsPaid(groupId, memberId, report.cycleNumber);
      setMemberStates(prev => ({
        ...prev,
        [memberId]: 'paid'
      }));
      addToast({
        type: 'success',
        title: 'Member marked as paid',
      });
      if (onMembersUpdated) onMembersUpdated();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsMarkingPaid(false);
    }
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      let heightLeft = canvas.height * pageWidth / canvas.width;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, pageHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - canvas.height * pageWidth / canvas.width;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pageWidth, pageHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${groupName}-cycle-${report.cycleNumber}-report.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-muted-foreground">Generating report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-4 text-center text-red-600">
        Failed to load report
      </div>
    );
  }

  const formattedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-auto">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between gap-4 sticky top-0 bg-white dark:bg-slate-950 border-b">
          <div>
            <CardTitle>Cycle Report - {groupName}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Cycle {report.cycleNumber}</p>
          </div>
          <div className="flex gap-2">
            <Button size="icon" variant="ghost" onClick={handlePrint} title="Print">
              <Printer className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={downloadPDF} title="Download PDF">
              <Download className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div
            ref={reportRef}
            className="p-8 bg-white text-gray-900"
            style={{ width: '100%' }}
          >
            {/* Header */}
            <div className="text-center mb-8 border-b pb-6">
              <h1 className="text-3xl font-bold mb-2">{groupName}</h1>
              <p className="text-gray-600 mb-1">Savings Cycle Report</p>
              <p className="text-lg font-semibold text-blue-600 mb-4">Cycle {report.cycleNumber}</p>
              <div className="flex justify-center gap-8 text-sm">
                <div>
                  <p className="text-gray-600">Period</p>
                  <p className="font-medium">{formattedDate(report.cycleStartDate)} - {formattedDate(report.cycleEndDate)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Currency</p>
                  <p className="font-medium">{report.currency}</p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-gray-600 text-sm mb-1">Total Collected</p>
                <p className="text-2xl font-bold text-blue-600">
                  {report.totals.totalCollected.toLocaleString()} {report.currency}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-gray-600 text-sm mb-1">Active Members</p>
                <p className="text-2xl font-bold text-green-600">{report.totals.memberCount}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-gray-600 text-sm mb-1">Total Payments</p>
                <p className="text-2xl font-bold text-purple-600">{report.totals.paymentCount}</p>
              </div>
            </div>

            {/* Members Table */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Member Contributions & Payouts</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="p-3 text-left font-semibold text-gray-700">Member Name</th>
                      <th className="p-3 text-right font-semibold text-gray-700">Amount Saved</th>
                      <th className="p-3 text-right font-semibold text-gray-700">Organizer Fee (1 day)</th>
                      <th className="p-3 text-right font-semibold text-gray-700">Net Payout</th>
                      <th className="p-3 text-center font-semibold text-gray-700">Payments</th>
                      <th className="p-3 text-center font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.members.map((member: any, idx: number) => {
                      const currentStatus = memberStates[member.id] || member.status;
                      return (
                        <tr
                          key={member.id}
                          className={`border-b ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                        >
                          <td className="p-3 font-medium text-gray-900">{member.name}</td>
                          <td className="p-3 text-right font-semibold text-gray-900">
                            {member.totalSaved.toLocaleString()} {report.currency}
                          </td>
                          <td className="p-3 text-right font-medium text-orange-600">
                            {member.organizerFee.toLocaleString()} {report.currency}
                          </td>
                          <td className="p-3 text-right font-bold text-green-600">
                            {member.netPayout.toLocaleString()} {report.currency}
                          </td>
                          <td className="p-3 text-center text-gray-700">{member.paymentCount}</td>
                          <td className="p-3 text-center">
                            {currentStatus === 'paid' ? (
                              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                ✓ Paid
                              </span>
                            ) : (
                              <button
                                onClick={() => handleMarkAsPaid(member.id)}
                                disabled={isMarkingPaid}
                                className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors disabled:opacity-50"
                                title="Click to mark as paid"
                              >
                                Pending
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Cycle Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total Collected:</span>
                    <span className="font-semibold text-gray-900">
                      {report.totals.totalCollected.toLocaleString()} {report.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total Organizer Fee:</span>
                    <span className="font-semibold text-orange-600">
                      {report.totals.totalFees?.toLocaleString() || 0} {report.currency}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-300">
                    <span className="text-gray-700 font-medium">Net Payout to Members:</span>
                    <span className="font-bold text-green-600">
                      {report.totals.netAmount?.toLocaleString() || 0} {report.currency}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Active Members:</span>
                    <span className="font-semibold text-gray-900">{report.totals.memberCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total Payments:</span>
                    <span className="font-semibold text-gray-900">{report.totals.paymentCount}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-300">
                    <span className="text-gray-700 font-medium">Average per Member:</span>
                    <span className="font-bold text-blue-600">
                      {(report.totals.totalCollected / Math.max(report.totals.memberCount, 1)).toLocaleString()} {report.currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t text-center text-xs text-gray-600">
              <p>This report was generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
              <p className="mt-1">TillSave - Organizer Cash-Based Savings Platform</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .fixed { position: static !important; }
          [class*="max-h"], [class*="max-w"] { max-height: none !important; max-width: none !important; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  );
};
