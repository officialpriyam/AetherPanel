import type { AdminSectionId } from './config';
import type { AdminRoute } from './types';

export const parseRoute = (pathname: string): AdminRoute => {
    const parts = pathname.split('/').filter(Boolean).slice(1);
    const [section = 'overview', maybeAction, maybeId, maybeTab] = parts;

    if (section === 'settings' || section === 'flash') {
        return {
            section,
            view: 'list',
            tab: maybeAction || 'index',
            path: pathname,
            subject: 'resource',
        };
    }

    if (section === 'nests' && maybeAction === 'egg') {
        if (maybeId === 'new') {
            return {
                section: 'nests',
                view: 'new',
                tab: 'index',
                path: pathname,
                subject: 'egg',
            };
        }

        if (maybeId) {
            return {
                section: 'nests',
                view: 'detail',
                id: maybeId,
                tab: maybeTab || 'index',
                path: pathname,
                subject: 'egg',
            };
        }
    }

    if (maybeAction === 'new') {
        return {
            section: section as AdminSectionId,
            view: 'new',
            tab: 'index',
            path: pathname,
            subject: 'resource',
        };
    }

    if (maybeAction === 'view' && maybeId) {
        return {
            section: section as AdminSectionId,
            view: 'detail',
            id: maybeId,
            tab: maybeTab || 'index',
            path: pathname,
            subject: 'resource',
        };
    }

    return {
        section: section as AdminSectionId,
        view: 'list',
        tab: 'index',
        path: pathname,
        subject: 'resource',
    };
};
