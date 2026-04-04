import { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import { getConfig, getLimits, PteroGPTConfig, RateLimits } from '@/api/server/pterogpt';

interface UsePteroGPTReturn {
    config: PteroGPTConfig | null;
    limits: RateLimits | null;
    loading: boolean;
    error: string | null;
    refreshLimits: () => Promise<void>;
}

export const usePteroGPT = (): UsePteroGPTReturn => {
    const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
    const [config, setConfig] = useState<PteroGPTConfig | null>(null);
    const [limits, setLimits] = useState<RateLimits | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConfig = async () => {
        if (!uuid) return;

        try {
            setLoading(true);
            const [configData, limitsData] = await Promise.all([getConfig(uuid), getLimits(uuid)]);
            setConfig(configData);
            setLimits(limitsData);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load PteroGPT config');
        } finally {
            setLoading(false);
        }
    };

    const refreshLimits = async () => {
        if (!uuid) return;
        try {
            const limitsData = await getLimits(uuid);
            setLimits(limitsData);
        } catch (err) {
            console.error('Failed to refresh limits:', err);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, [uuid]);

    return { config, limits, loading, error, refreshLimits };
};