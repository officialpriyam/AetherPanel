'use client';

import Link from 'next/link';
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
    LuChevronDown,
    LuCircleUserRound,
    LuLayoutPanelLeft,
    LuLogOut,
    LuMoonStar,
    LuSettings2,
    LuShieldCheck,
    LuSunMedium,
} from 'react-icons/lu';
import { ADMIN_NAV_ITEMS, SECTION_TITLES } from '../config';
import type { AdminRoute, BootstrapState } from '../types';
import { Glyph } from './common';

const groupLabels: Record<'core' | 'management' | 'service', string> = {
    core: 'Overview',
    management: 'Infrastructure',
    service: 'Services',
};

function AdminChrome({
    route,
    brandName,
    logo,
    bootstrap,
    onLogout,
    children,
}: {
    route: AdminRoute;
    brandName: string;
    logo: string;
    bootstrap: BootstrapState;
    onLogout: () => Promise<void>;
    children: ReactNode;
}) {
    const defaultLogo = '/branding/aether-mark.png';
    const defaultAvatar = '/branding/default-avatar.svg';
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [themeReady, setThemeReady] = useState(false);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [brandLogoSrc, setBrandLogoSrc] = useState(logo || defaultLogo);
    const [accountAvatarSrc, setAccountAvatarSrc] = useState(defaultAvatar);
    const accountMenuRef = useRef<HTMLDivElement | null>(null);

    const groupedNav = useMemo(
        () => (['core', 'management', 'service'] as const).map((group) => ({
            group,
            label: groupLabels[group],
            items: ADMIN_NAV_ITEMS.filter((item) => item.group === group),
        })),
        []
    );

    const username = bootstrap?.user?.username || 'Administrator';
    const accountRole = bootstrap?.user?.root_admin ? 'Root Administrator' : 'Administrator';
    const sectionLabel = route.section === 'overview' ? 'Dashboard' : SECTION_TITLES[route.section];
    const defaultMode = String(bootstrap?.siteConfiguration?.flash?.defaultMode || 'darkmode');
    const preferredTheme = defaultMode === 'lightmode' ? 'light' : 'dark';
    const useLightModeClass = (theme === 'light' && defaultMode === 'darkmode') || (theme === 'dark' && defaultMode === 'lightmode');

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const stored = window.localStorage.getItem('admin-theme');
        if (stored === 'dark' || stored === 'light') {
            setTheme(stored);
            setThemeReady(true);
            return;
        }

        setTheme(preferredTheme);
        setThemeReady(true);
    }, [preferredTheme]);

    useEffect(() => {
        setBrandLogoSrc(logo || defaultLogo);
    }, [logo]);

    useEffect(() => {
        const nextAvatar = typeof bootstrap?.user?.avatar_url === 'string' && bootstrap.user.avatar_url.trim()
            ? bootstrap.user.avatar_url.trim()
            : defaultAvatar;
        setAccountAvatarSrc(nextAvatar);
    }, [bootstrap]);

    useEffect(() => {
        if (typeof window === 'undefined' || !themeReady) {
            return;
        }

        window.localStorage.setItem('admin-theme', theme);
    }, [theme, themeReady]);

    useEffect(() => {
        if (!accountMenuOpen) {
            return;
        }

        const handlePointerDown = (event: MouseEvent) => {
            if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
                setAccountMenuOpen(false);
            }
        };

        window.addEventListener('mousedown', handlePointerDown);
        return () => window.removeEventListener('mousedown', handlePointerDown);
    }, [accountMenuOpen]);

    return (
        <main className={`admin-shell admin-shell--${theme}${useLightModeClass ? ' lightmode' : ''}`}>
            <aside className="admin-sidebar">
                <div className="admin-sidebar__header">
                    <Link href="/admin" className="admin-brand">
                        <img src={brandLogoSrc} alt={brandName} className="admin-brand__logo" onError={() => setBrandLogoSrc(defaultLogo)} />
                        <div className="admin-brand__copy">
                            <strong>{brandName}</strong>
                            <small>Admin workspace</small>
                        </div>
                    </Link>
                </div>

                <nav className="admin-sidebar__nav">
                    {groupedNav.map(({ group, label, items }) => (
                        <section key={group} className="admin-nav-card">
                            <div className="admin-nav-card__label">{label}</div>
                            <div className="admin-nav-card__items">
                                {items.map((item) => {
                                    const Icon = item.icon;
                                    const active = route.section === item.id;

                                    return (
                                        <Link key={item.id} href={item.href} className={`admin-nav__item${active ? ' is-active' : ''}`}>
                                            <Glyph icon={Icon} />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </nav>

                <div className="admin-sidebar__footer">
                    <div className="admin-sidebar__tools">
                        <Link href="/" className="admin-toolbar-link">
                            <Glyph icon={LuLayoutPanelLeft} />
                            <span>Open Panel</span>
                        </Link>
                        <button
                            type="button"
                            className="admin-toolbar-link"
                            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
                        >
                            <Glyph icon={theme === 'dark' ? LuSunMedium : LuMoonStar} />
                            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>
                    </div>
                </div>
            </aside>

            <section className="admin-main">
                <header className="admin-topbar">
                    <div className="admin-topbar__trail">
                        <span className="admin-topbar__eyebrow">Admin Workspace</span>
                        <strong className="admin-topbar__path">{sectionLabel}</strong>
                    </div>

                    <div className="admin-topbar__actions">
                        <div className="admin-topbar__context">
                            <Glyph icon={LuShieldCheck} />
                            <span>Admin Area</span>
                        </div>

                        <div className={`admin-account${accountMenuOpen ? ' is-open' : ''}`} ref={accountMenuRef}>
                            <button
                                type="button"
                                className="admin-account__trigger"
                                onClick={() => setAccountMenuOpen((current) => !current)}
                                aria-expanded={accountMenuOpen}
                            >
                                <div className="admin-account__avatar">
                                    <img src={accountAvatarSrc} alt={`${username} avatar`} onError={() => setAccountAvatarSrc(defaultAvatar)} />
                                </div>
                                <div className="admin-account__copy">
                                    <strong>{username}</strong>
                                    <span>{accountRole}</span>
                                </div>
                                <Glyph icon={LuChevronDown} className="admin-account__chevron" />
                            </button>

                            <div className="admin-account__menu">
                                <div className="admin-account__menu-head">
                                    <div className="admin-account__avatar admin-account__avatar--large">
                                        <img src={accountAvatarSrc} alt={`${username} avatar`} onError={() => setAccountAvatarSrc(defaultAvatar)} />
                                    </div>
                                    <div className="admin-account__menu-copy">
                                        <span>Your account</span>
                                        <strong>{username}</strong>
                                        <small>{accountRole}</small>
                                    </div>
                                </div>
                                <Link href="/account" className="admin-account__item" onClick={() => setAccountMenuOpen(false)}>
                                    <Glyph icon={LuCircleUserRound} />
                                    <span>Your Profile</span>
                                </Link>
                                <Link href="/admin/settings" className="admin-account__item" onClick={() => setAccountMenuOpen(false)}>
                                    <Glyph icon={LuSettings2} />
                                    <span>Runtime Settings</span>
                                </Link>
                                <button type="button" className="admin-account__item admin-account__item--danger" onClick={() => void onLogout()}>
                                    <Glyph icon={LuLogOut} />
                                    <span>Sign out</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {children}
            </section>
        </main>
    );
}

export default AdminChrome;
