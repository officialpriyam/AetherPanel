'use client';

import dynamic from 'next/dynamic';
import PanelLoading from './PanelLoading';

const LegacyPanelClient = dynamic(() => import('./LegacyPanelClient'), {
    ssr: false,
    loading: () => <PanelLoading />,
});

export default function PanelRouteEntry() {
    return <LegacyPanelClient />;
}
