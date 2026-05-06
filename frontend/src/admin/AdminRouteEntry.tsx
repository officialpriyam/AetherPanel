'use client';

import dynamic from 'next/dynamic';
import PanelLoading from '@/panel/PanelLoading';

const AdminApp = dynamic(() => import('./AdminApp'), {
    ssr: false,
    loading: () => <PanelLoading ariaLabel={'Loading admin'} />,
});

export default function AdminRouteEntry() {
    return <AdminApp />;
}
