import { useEffect, useState } from 'react';
import { dashboardService, OrganizerDashboardData, MemberDashboardData } from '@/services/dashboardService';

/**
 * Hook to fetch organizer dashboard data
 */
export const useOrganizerDashboard = (organizerId: string | undefined) => {
  const [data, setData] = useState<OrganizerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!organizerId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await dashboardService.getOrganizerDashboard(organizerId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load dashboard'));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [organizerId]);

  return { data, isLoading, error };
};

/**
 * Hook to fetch member dashboard data
 */
export const useMemberDashboard = (userId: string | undefined) => {
  const [data, setData] = useState<MemberDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await dashboardService.getMemberDashboard(userId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load dashboard'));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userId]);

  return { data, isLoading, error };
};

/**
 * Hook to fetch group dashboard data
 */
export const useGroupDashboard = (groupId: string | undefined) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!groupId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await dashboardService.getGroupDashboard(groupId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load group'));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [groupId]);

  return { data, isLoading, error };
};
