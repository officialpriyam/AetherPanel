export const FRONTEND_ACCESS_HEADER = 'X-AetherPanel-Frontend-Key';

const frontendAccessKey = (process.env.NEXT_PUBLIC_PANEL_ACCESS_KEY || '').trim();

export const getFrontendAccessHeaders = (): Record<string, string> =>
    frontendAccessKey.length > 0 ? { [FRONTEND_ACCESS_HEADER]: frontendAccessKey } : {};

