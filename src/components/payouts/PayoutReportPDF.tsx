import React from 'react';
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

interface PayoutReportProps {
  groupName: string;
  cycleNumber: number;
  cycleStartDate: Date;
  cycleEndDate: Date;
  generatedDate: Date;
  members: Member[];
  organizerName: string;
  organizerPhone: string;
  organizerEarnings: {
    currency: string;
    amount: number;
  }[];
  reportId: string;
}

export const PayoutReportPDF: React.FC<PayoutReportProps> = ({
  groupName,
  cycleNumber,
  cycleStartDate,
  cycleEndDate,
  generatedDate,
  members,
  organizerName,
  organizerPhone,
  organizerEarnings,
  reportId,
}) => {
  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'RWF') {
      return `${amount.toLocaleString('en-US')} RWF`;
    }
    return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const totalMembers = members.length;
  const totalDistributed = members.reduce((sum, m) => sum + m.netPayout, 0);
  const totalFees = members.reduce((sum, m) => sum + m.organizerFee, 0);
  const totalSaved = members.reduce((sum, m) => sum + m.totalSaved, 0);
  const averageContribution = totalDistributed / totalMembers;

  return (
    <div className="payout-report bg-white text-gray-800" style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>💰</div>
            <div>
              <h1 style={styles.companyName}>TillSave</h1>
              <p style={styles.tagline}>Save Together, Achieve Together</p>
            </div>
          </div>
        </div>
        <div style={styles.headerRight}>
          <h2 style={styles.reportTitle}>PAYOUT REPORT</h2>
          <p style={styles.reportId}>Report ID: {reportId}</p>
          <p style={styles.generatedDate}>
            Generated: {format(generatedDate, 'MMM dd, yyyy HH:mm')}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider}></div>

      {/* Group Information */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Group Information</h3>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Group Name:</span>
            <span style={styles.infoValue}>{groupName}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Cycle Number:</span>
            <span style={styles.infoValue}>#{cycleNumber}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Cycle Period:</span>
            <span style={styles.infoValue}>
              {format(cycleStartDate, 'MMM dd')} - {format(cycleEndDate, 'MMM dd, yyyy')}
            </span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Total Members:</span>
            <span style={styles.infoValue}>{totalMembers}</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>💵</div>
          <div>
            <p style={styles.statLabel}>Total Distributed</p>
            <p style={styles.statValue}>{formatCurrency(totalDistributed, 'RWF')}</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📊</div>
          <div>
            <p style={styles.statLabel}>Average Payout</p>
            <p style={styles.statValue}>{formatCurrency(averageContribution, 'RWF')}</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>⭐</div>
          <div>
            <p style={styles.statLabel}>Organizer Earnings</p>
            <p style={styles.statValue}>{formatCurrency(totalFees, 'RWF')}</p>
          </div>
        </div>
      </div>

      {/* Member Payouts Table */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Member Payouts</h3>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={{ ...styles.tableHeader, textAlign: 'center' }}>#</th>
                <th style={{ ...styles.tableHeader, textAlign: 'left' }}>Member Name</th>
                <th style={styles.tableHeader}>Days Paid</th>
                <th style={styles.tableHeader}>Total Saved</th>
                <th style={styles.tableHeader}>Organizer Fee</th>
                <th style={styles.tableHeader}>Net Payout</th>
                <th style={styles.tableHeader}>Signature</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, index) => (
                <tr key={index} style={index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                  <td style={{ ...styles.tableCell, textAlign: 'center' }}>{index + 1}</td>
                  <td style={{ ...styles.tableCell, textAlign: 'left', fontWeight: '600' }}>
                    {member.name}
                  </td>
                  <td style={styles.tableCell}>
                    {member.daysContributed}/{member.totalDays}
                  </td>
                  <td style={styles.tableCell}>{formatCurrency(member.totalSaved, member.currency)}</td>
                  <td style={styles.tableCell}>{formatCurrency(member.organizerFee, member.currency)}</td>
                  <td style={{ ...styles.tableCell, fontWeight: '700', color: '#16a34a' }}>
                    {formatCurrency(member.netPayout, member.currency)}
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.signatureLine}>___________</div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={styles.tableTotalRow}>
                <td colSpan={3} style={{ ...styles.tableCell, fontWeight: '700', textAlign: 'right' }}>
                  TOTALS:
                </td>
                <td style={{ ...styles.tableCell, fontWeight: '700' }}>
                  {formatCurrency(totalSaved, 'RWF')}
                </td>
                <td style={{ ...styles.tableCell, fontWeight: '700' }}>
                  {formatCurrency(totalFees, 'RWF')}
                </td>
                <td style={{ ...styles.tableCell, fontWeight: '700', color: '#16a34a' }}>
                  {formatCurrency(totalDistributed, 'RWF')}
                </td>
                <td style={styles.tableCell}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Organizer Earnings Breakdown */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Organizer Earnings Summary</h3>
        <div style={styles.earningsContainer}>
          <div style={styles.earningsBox}>
            <p style={styles.earningsLabel}>Total Earnings (All Currencies)</p>
            {organizerEarnings.map((earning, index) => (
              <p key={index} style={styles.earningsValue}>
                {formatCurrency(earning.amount, earning.currency)}
              </p>
            ))}
          </div>
          <div style={styles.earningsBox}>
            <p style={styles.earningsLabel}>Organizer Details</p>
            <p style={styles.earningsDetail}>Name: {organizerName}</p>
            <p style={styles.earningsDetail}>Phone: {organizerPhone}</p>
          </div>
        </div>
      </div>

      {/* Payment Instructions */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Payment Instructions</h3>
        <div style={styles.instructionsBox}>
          <p style={styles.instructionText}>
            ✓ Members must sign this report upon receiving their payout
          </p>
          <p style={styles.instructionText}>
            ✓ Payouts can be collected via Mobile Money, Bank Transfer, or Cash
          </p>
          <p style={styles.instructionText}>
            ✓ Contact the organizer if you notice any discrepancies
          </p>
          <p style={styles.instructionText}>
            ✓ Next cycle begins on {format(new Date(cycleEndDate.getTime() + 86400000), 'MMMM dd, yyyy')}
          </p>
        </div>
      </div>

      {/* Calculation Transparency */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>How Payouts Are Calculated</h3>
        <div style={styles.calculationBox}>
          <p style={styles.calculationText}>
            <strong>Net Payout Formula:</strong> Total Saved - Organizer Fee (1 day's contribution)
          </p>
          <p style={styles.calculationExample}>
            <strong>Example:</strong> If you saved 2,000 RWF/day for 30 days:
          </p>
          <ul style={styles.calculationList}>
            <li>Total Saved: 30 days × 2,000 RWF = 60,000 RWF</li>
            <li>Organizer Fee: 1 day × 2,000 RWF = 2,000 RWF</li>
            <li>Your Payout: 60,000 - 2,000 = <strong>58,000 RWF</strong></li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerSection}>
          <p style={styles.footerText}>
            This report was generated by <strong>TillSave</strong> - Community Savings Management Platform
          </p>
          <p style={styles.footerText}>
            For support: support@tillsave.com | www.tillsave.com
          </p>
        </div>
        <div style={styles.footerSection}>
          <p style={styles.footerSmall}>
            © 2025 Invoza Company Ltd. All rights reserved.
          </p>
          <p style={styles.footerSmall}>
            Report ID: {reportId} | Page 1 of 1
          </p>
        </div>
      </div>

      {/* Verification Footer */}
      <div style={styles.verificationFooter}>
        <p style={styles.verificationText}>
          ✓ This report is digitally generated and verified by TillSave
        </p>
        <p style={styles.verificationText}>
          Organizer Signature: _____________________ Date: _____________________
        </p>
      </div>
    </div>
  );
};

// Styles object
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: '210mm',
    margin: '0 auto',
    padding: '20mm',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    fontSize: '10pt',
    lineHeight: '1.5',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  headerLeft: {
    flex: 1,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    fontSize: '36px',
  },
  companyName: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2563eb',
    margin: '0',
    lineHeight: '1.2',
  },
  tagline: {
    fontSize: '11px',
    color: '#6b7280',
    margin: '4px 0 0 0',
  },
  headerRight: {
    textAlign: 'right' as const,
  },
  reportTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 8px 0',
    letterSpacing: '0.5px',
  },
  reportId: {
    fontSize: '10px',
    color: '#6b7280',
    margin: '4px 0',
  },
  generatedDate: {
    fontSize: '10px',
    color: '#6b7280',
    margin: '4px 0',
  },
  divider: {
    height: '2px',
    backgroundColor: '#e5e7eb',
    margin: '20px 0',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '2px solid #2563eb',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    color: '#1f2937',
    fontWeight: '600',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statIcon: {
    fontSize: '28px',
  },
  statLabel: {
    fontSize: '10px',
    color: '#6b7280',
    margin: '0 0 4px 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  statValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0',
  },
  tableWrapper: {
    overflowX: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginTop: '12px',
  },
  tableHeaderRow: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
  },
  tableHeader: {
    padding: '12px 8px',
    textAlign: 'center' as const,
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  tableRowEven: {
    backgroundColor: '#ffffff',
  },
  tableRowOdd: {
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    padding: '10px 8px',
    textAlign: 'center' as const,
    fontSize: '10px',
    borderBottom: '1px solid #e5e7eb',
  },
  tableTotalRow: {
    backgroundColor: '#f3f4f6',
    fontWeight: '700',
  },
  signatureLine: {
    borderBottom: '1px solid #9ca3af',
    width: '80px',
    margin: '0 auto',
    height: '20px',
  },
  earningsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  earningsBox: {
    backgroundColor: '#fef3c7',
    border: '2px solid #fbbf24',
    borderRadius: '8px',
    padding: '16px',
  },
  earningsLabel: {
    fontSize: '11px',
    color: '#78350f',
    fontWeight: '600',
    marginBottom: '8px',
    textTransform: 'uppercase' as const,
  },
  earningsValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#78350f',
    margin: '4px 0',
  },
  earningsDetail: {
    fontSize: '10px',
    color: '#78350f',
    margin: '4px 0',
  },
  instructionsBox: {
    backgroundColor: '#eff6ff',
    border: '1px solid #3b82f6',
    borderRadius: '8px',
    padding: '16px',
  },
  instructionText: {
    fontSize: '10px',
    color: '#1e40af',
    margin: '6px 0',
  },
  calculationBox: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #16a34a',
    borderRadius: '8px',
    padding: '16px',
  },
  calculationText: {
    fontSize: '10px',
    color: '#15803d',
    margin: '6px 0',
  },
  calculationExample: {
    fontSize: '10px',
    color: '#15803d',
    margin: '12px 0 8px 0',
    fontWeight: '600',
  },
  calculationList: {
    margin: '8px 0 0 20px',
    padding: 0,
    color: '#15803d',
    fontSize: '10px',
  },
  footer: {
    marginTop: '32px',
    paddingTop: '16px',
    borderTop: '2px solid #e5e7eb',
  },
  footerSection: {
    marginBottom: '12px',
  },
  footerText: {
    fontSize: '9px',
    color: '#6b7280',
    textAlign: 'center' as const,
    margin: '4px 0',
  },
  footerSmall: {
    fontSize: '8px',
    color: '#9ca3af',
    textAlign: 'center' as const,
    margin: '2px 0',
  },
  verificationFooter: {
    marginTop: '32px',
    paddingTop: '16px',
    borderTop: '1px dashed #9ca3af',
  },
  verificationText: {
    fontSize: '9px',
    color: '#6b7280',
    margin: '8px 0',
  },
};

export default PayoutReportPDF;
