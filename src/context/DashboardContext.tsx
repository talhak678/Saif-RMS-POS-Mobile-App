import apiClient from '@/src/api/apiClient';
import { DashboardPeriod, IDashboardData } from '@/types/dashboard.types';
import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface DashboardContextType {
    data: IDashboardData | null;
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    period: DashboardPeriod;
    setPeriod: (period: DashboardPeriod) => void;
    fetchDashboard: (showLoader?: boolean) => Promise<void>;
    clearCache: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<IDashboardData | null>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriodState] = useState<DashboardPeriod>("30d");

    const fetchDashboard = useCallback(async (showLoader = true) => {
        if (showLoader) setLoading(true);
        if (!showLoader) setRefreshing(true);

        setError(null);
        try {
            const res = await apiClient.get(`/dashboard?period=${period}`);
            if (res.data?.success) {
                setData(res.data.data);
            } else {
                setError("Failed to load dashboard data");
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "Network error. Try again.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [period, data]);

    const setPeriod = (newPeriod: DashboardPeriod) => {
        if (newPeriod !== period) {
            setData(null); // Clear data so it fetches for the new period
            setPeriodState(newPeriod);
        }
    };

    const clearCache = () => setData(null);

    return (
        <DashboardContext.Provider value={{
            data,
            loading,
            refreshing,
            error,
            period,
            setPeriod,
            fetchDashboard,
            clearCache
        }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}
