import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface Member {
  name: string;
  totalSaved: number;
  organizerFee: number;
  netPayout: number;
  daysContributed: number;
  totalDays: number;
  currency: string;
}

interface PDFReportData {
  groupName: string;
  cycleNumber: number;
  cycleStartDate: Date;
  cycleEndDate: Date;
  generatedDate: Date;
  members: Member[];
  organizerName: string;
  organizerEmail?: string;
  organizerPhone?: string;
  organizerEarnings: { currency: string; amount: number }[];
}

export const generatePDFReport = (data: PDFReportData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = margin;

  // ========== HEADER ==========
  doc.setFontSize(24);
  doc.setTextColor(37, 99, 235); // Blue
  doc.text('TillSave', margin, currentY);
  currentY += 8;

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Save Together, Achieve Together', margin, currentY);
  currentY += 8;

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;

  // ========== REPORT TITLE & INFO ==========
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text('PAYOUT REPORT', margin, currentY);
  currentY += 7;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${format(data.generatedDate, 'MMM dd, yyyy HH:mm')}`, margin, currentY);
  currentY += 5;
  doc.text(`Report ID: RPT-${Date.now()}`, margin, currentY);
  currentY += 10;

  // ========== GROUP & ORGANIZER INFORMATION ==========
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('Group Information', margin, currentY);
  currentY += 6;

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const groupInfo = [
    ['Group Name:', data.groupName],
    ['Cycle Number:', `#${data.cycleNumber}`],
    ['Cycle Period:', `${format(data.cycleStartDate, 'MMM dd')} - ${format(data.cycleEndDate, 'MMM dd, yyyy')}`],
  ];

  groupInfo.forEach(([label, value]) => {
    doc.text(label, margin, currentY);
    doc.text(String(value), 50, currentY);
    currentY += 5;
  });
  currentY += 3;

  // Organizer Details Box
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text('Organizer Details', margin, currentY);
  currentY += 5;

  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`Name: ${data.organizerName || 'Unknown'}`, margin + 2, currentY);
  currentY += 4;
  doc.text(`Phone: ${data.organizerPhone || 'N/A'}`, margin + 2, currentY);
  currentY += 4;
  doc.text(`Email: ${data.organizerEmail || 'N/A'}`, margin + 2, currentY);
  currentY += 8;

  // ========== MEMBER PAYOUTS TABLE ==========
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('Member Payouts', margin, currentY);
  currentY += 5;

  // Group members by currency for separate tables
  const currencies = [...new Set(data.members.map(m => m.currency))];

  currencies.forEach((currency) => {
    const membersInCurrency = data.members.filter(m => m.currency === currency);
    
    const tableData = membersInCurrency.map((member) => [
      member.name,
      member.daysContributed.toString(),
      member.totalSaved.toLocaleString(),
      member.organizerFee.toLocaleString(),
      member.netPayout.toLocaleString(),
      '___________'
    ]);

    // Add totals row
    const totals = membersInCurrency.reduce(
      (acc, m) => ({
        saved: acc.saved + m.totalSaved,
        fee: acc.fee + m.organizerFee,
        net: acc.net + m.netPayout,
      }),
      { saved: 0, fee: 0, net: 0 }
    );

    tableData.push([
      'TOTAL',
      '',
      totals.saved.toLocaleString(),
      totals.fee.toLocaleString(),
      totals.net.toLocaleString(),
      ''
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [
        [
          'Member Name',
          'Days',
          `Total Saved (${currency})`,
          `Fee (${currency})`,
          `Net Payout (${currency})`,
          'Signature'
        ]
      ],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
      },
      footStyles: {
        fillColor: [245, 245, 245],
        fontStyle: 'bold',
        fontSize: 9,
      },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'center' },
      },
      margin: { left: margin, right: margin },
    });

    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 10;

    // Check if we need a new page
    if (currentY > pageHeight - 30) {
      doc.addPage();
      currentY = margin;
    }
  });

  // ========== ORGANIZER EARNINGS SUMMARY ==========
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('Organizer Earnings Summary', margin, currentY);
  currentY += 6;

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  data.organizerEarnings.forEach((earning) => {
    doc.text(
      `${earning.currency}: ${earning.amount.toLocaleString()}`,
      margin,
      currentY
    );
    currentY += 5;
  });
  currentY += 5;

  // ========== PAYMENT INSTRUCTIONS ==========
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text('Payment Instructions', margin, currentY);
  currentY += 5;

  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const instructions = [
    '✓ Members must sign this report upon receiving their payout',
    '✓ Payouts can be collected via Mobile Money, Bank Transfer, or Cash',
    '✓ Contact the organizer if you notice any discrepancies',
    `✓ Next cycle begins on ${format(new Date(data.cycleEndDate.getTime() + 86400000), 'MMMM dd, yyyy')}`
  ];

  instructions.forEach((instruction) => {
    const lines = doc.splitTextToSize(instruction, pageWidth - margin * 2);
    lines.forEach((line: string) => {
      doc.text(line, margin, currentY);
      currentY += 4;
    });
  });

  currentY += 5;

  // ========== CALCULATION TRANSPARENCY ==========
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text('How Payouts Are Calculated', margin, currentY);
  currentY += 5;

  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text('Formula: Net Payout = Total Saved - Organizer Fee', margin, currentY);
  currentY += 4;
  doc.text(
    '(Organizer fee = 1 day\'s contribution value per member)',
    margin,
    currentY
  );
  currentY += 8;

  // ========== FOOTER ==========
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    'This report was generated by TillSave - Community Savings Management Platform',
    margin,
    pageHeight - 15
  );
  doc.text(
    'For support: support@tillsave.com | www.tillsave.com',
    margin,
    pageHeight - 10
  );
  doc.text(
    '© 2025 Invoza Company Ltd. All rights reserved.',
    margin,
    pageHeight - 5
  );

  // Save PDF
  const filename = `TillSave_Payout_${data.groupName}_Cycle${data.cycleNumber}_${format(
    new Date(),
    'yyyy-MM-dd'
  )}.pdf`;

  doc.save(filename);
};

export const generatePayoutPDF = (groupName: string, items: any[], organizerTotal: any) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text("TillSave Payout Report", 14, 22);
  
  doc.setFontSize(12);
  doc.text(`Group: ${groupName}`, 14, 32);
  doc.text(`Date: ${format(new Date(), 'MMMM dd, yyyy')}`, 14, 38);

  // Group items by Currency for clearer tables
  const currencies = [...new Set(items.map(i => i.currency))];

  let currentY = 50;

  currencies.forEach((curr: any) => {
    doc.setFontSize(14);
    doc.setTextColor(0, 100, 0); // Green
    doc.text(`${curr} Payouts`, 14, currentY);
    currentY += 5;

    const currItems = items.filter(i => i.currency === curr);
    
    // Table Data
    const tableData = currItems.map(item => [
      item.memberName,
      item.totalSaved.toLocaleString(),
      item.organizerFee.toLocaleString(),
      item.netPayout.toLocaleString(),
      "___________" // Signature line
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Member', 'Saved', 'Fee', 'Net Payout', 'Signature']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });

    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 20;
  });

  // Footer / Organizer Summary
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text("Organizer Summary (Earnings)", 14, currentY);
  currentY += 10;

  Object.entries(organizerTotal).forEach(([curr, amount]: any) => {
    doc.setFontSize(12);
    doc.text(`${curr}: ${amount.toLocaleString()}`, 14, currentY);
    currentY += 6;
  });

  doc.save(`Payout_Report_${groupName}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};