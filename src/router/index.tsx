import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { UpdatePasswordPage } from '@/pages/auth/UpdatePasswordPage';
import { OTPVerificationPage } from '@/pages/auth/OTPVerificationPage';
import { SetupPINPage } from '@/pages/auth/SetupPINPage';
import { OnboardingPage } from '@/pages/shared/OnboardingPage';
import { OrganizerDashboard } from '@/pages/organizer/OrganizerDashboard';
import { CreateGroupPage } from '@/pages/organizer/CreateGroupPage';
import { GroupDetailsPage } from '@/pages/organizer/GroupDetailsPage';
import { GroupSettingsPage } from '@/pages/organizer/GroupSettingsPage';
import { RecordPaymentPage } from '@/pages/organizer/RecordPaymentPage';
import { MemberLedgerPage } from '@/pages/organizer/MemberLedgerPage';
import { EditPaymentPage } from '@/pages/organizer/EditPaymentPage';
import { PayoutSummaryPage } from '@/pages/organizer/PayoutSummaryPage';
import { CyclePayoutPage } from '@/pages/organizer/CyclePayoutPage';
import { AdvancedReportPage } from '@/pages/organizer/AdvancedReportPage';
import { GlobalReportPage } from '@/pages/organizer/GlobalReportPage';
import { MemberDashboard } from '@/pages/member/MemberDashboard';
import { JoinGroupPage } from '@/pages/member/JoinGroupPage';
import { SetupCurrenciesPage } from '@/pages/member/SetupCurrenciesPage';
import { PaymentHistoryPage } from '@/pages/member/PaymentHistoryPage';
import { PayoutPreviewPage } from '@/pages/member/PayoutPreviewPage';
import { MemberAnalyticsPage } from '@/pages/member/MemberAnalyticsPage';
import { ProfilePage } from '@/pages/shared/ProfilePage';
import { CycleHistoryPage } from '@/pages/shared/CycleHistoryPage';
import { PastCycleReportPage } from '@/pages/shared/PastCycleReportPage';
import { ActivityHistoryPage } from '@/pages/shared/ActivityHistoryPage';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { DashboardLayout } from '@/layouts/DashboardLayout';

// Logic to check if user is new to the device
const showOnboarding = !localStorage.getItem('hasSeenOnboarding');

export const router = createBrowserRouter([
  {
    path: '/',
    // Redirect logic: Onboarding -> Login -> Dashboard
    element: showOnboarding ? <Navigate to="/onboarding" replace /> : <Navigate to="/auth/login" replace />,
  },
  {
    path: '/onboarding', // New Route
    element: <OnboardingPage />,
  },
  {
    path: '/auth',
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'update-password',
        element: <UpdatePasswordPage />,
      },
      {
        path: 'verify',
        element: <OTPVerificationPage />,
      },
      {
        path: 'setup-pin',
        element: <SetupPINPage />,
      },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: 'profile', element: <ProfilePage /> },
          { path: 'activity-history', element: <ActivityHistoryPage /> },
          { path: 'group/:groupId/history/cycles', element: <CycleHistoryPage /> },
          { path: 'group/:groupId/history/cycle/:payoutId', element: <PastCycleReportPage /> },
          {
            path: 'organizer',
            children: [
              { index: true, element: <OrganizerDashboard /> },
              { path: 'create-group', element: <CreateGroupPage /> },
              { path: 'global-report', element: <GlobalReportPage /> },
              { path: 'group/:groupId', element: <GroupDetailsPage /> },
              { path: 'group/:groupId/settings', element: <GroupSettingsPage /> },
              { path: 'group/:groupId/pay/:membershipId', element: <RecordPaymentPage /> },
              { path: 'group/:groupId/history/:membershipId', element: <MemberLedgerPage /> },
              { path: 'group/:groupId/edit-payment/:paymentId', element: <EditPaymentPage /> },
              { path: 'group/:groupId/report', element: <PayoutSummaryPage /> },
              { path: 'group/:groupId/analytics', element: <AdvancedReportPage /> },
              { path: 'group/:groupId/payout-cycle', element: <CyclePayoutPage /> }
            ]
          },
          {
            path: 'member',
            children: [
              { index: true, element: <MemberDashboard /> },
              { path: 'join-group', element: <JoinGroupPage /> },
              { path: 'group/:groupId/setup', element: <SetupCurrenciesPage /> },
              { path: 'group/:groupId/history', element: <PaymentHistoryPage /> },
              { path: 'group/:groupId/payout', element: <PayoutPreviewPage /> },
              { path: 'group/:groupId/analytics', element: <MemberAnalyticsPage /> }
            ]
          },
        ]
      }
    ],
  },
]);