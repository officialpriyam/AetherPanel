import type { ReactNode } from 'react';
import type { AdminSectionId, FormField } from './config';

export type AdminRoute = {
    section: AdminSectionId;
    view: 'list' | 'new' | 'detail';
    id?: string;
    tab: string;
    path: string;
    subject?: 'resource' | 'egg';
};

export type BootstrapState = {
    siteConfiguration: Record<string, any>;
    user: Record<string, any> | null;
} | null;

export type Column = {
    label: string;
    render: (item: Record<string, any>) => ReactNode;
};

export type ResourceSection = Exclude<AdminSectionId, 'overview' | 'settings' | 'flash'>;

export type ResourceConfig = {
    section: ResourceSection;
    title: string;
    listEndpoint: string;
    detailEndpoint: (id: string) => string;
    listInclude?: string;
    detailInclude?: string;
    emptyMessage: string;
    columns: Column[];
    searchKeys: string[];
    createFields?: FormField[];
    createTitle?: string;
    createEndpoint?: string;
    updateFields?: FormField[];
    updateEndpoint?: (id: string) => string;
    deleteEndpoint?: (id: string) => string;
    deleteLabel?: string;
    detailTabs?: { id: string; label: string; description: string }[];
    editTabId?: string;
    loadRefs?: () => Promise<Record<string, any>>;
    renderDetailExtras?: (item: Record<string, any>, refs: Record<string, any>, refresh: () => Promise<void>, route: AdminRoute) => ReactNode;
    renderListExtras?: (items: Record<string, any>[]) => ReactNode;
};
