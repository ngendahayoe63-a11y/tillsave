import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

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