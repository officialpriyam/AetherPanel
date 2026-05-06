import React, { useEffect, useRef, useState } from 'react';
import { ServerContext } from '@/state/server';
import routes from '@/routers/routes';
import Can from '@/components/elements/Can';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import { NavLink, useRouteMatch } from 'react-router-dom';
import { DotsHorizontalIcon } from '@heroicons/react/solid';
import { HomeIcon } from '@heroicons/react/outline';
import { useTranslation } from 'react-i18next';

const BarContainer = styled.div<{ position: 'top' | 'bottom' }>`
    ${tw`fixed z-[40] flex items-center gap-x-3 px-5 py-3 backdrop-blur-xl border rounded-box shadow-2xl transition-all duration-300 w-max max-w-[95vw]`};
    background: rgba(15, 23, 42, 0.84);
    border-color: rgba(148, 163, 184, 0.16);
    left: 50%;
    transform: translateX(-50%);
    ${props => props.position === 'top' ? tw`top-4` : tw`bottom-6`};
`;

const IconLinkContainer = styled(NavLink)`
    ${tw`text-gray-300 hover:text-gray-100 transition-colors duration-200 flex items-center justify-center p-2 rounded hover:bg-gray-600/50`};
    &.active {
        ${tw`text-gray-100 bg-gray-600/80`};
    }
    svg {
        ${tw`w-5 h-5`};
    }
`;

const DropdownContainer = styled.div<{ position: 'top' | 'bottom'; $open: boolean }>`
    ${tw`relative flex items-center justify-center`};
    .dots-btn {
        ${tw`text-gray-300 hover:text-gray-100 p-2 rounded cursor-pointer hover:bg-gray-600/50 transition-colors duration-200 border-0 bg-transparent`};
        ${({ $open }) => $open && 'background: rgba(71, 85, 105, 0.78); color: rgb(243, 244, 246);'}
        svg {
            ${tw`w-5 h-5`};
        }
    }
    .dropdown-menu {
        ${tw`absolute left-1/2 -translate-x-1/2 backdrop-blur-xl border rounded-lg p-2 gap-2 shadow-xl z-[50]`};
        display: ${({ $open }) => ($open ? 'flex' : 'none')};
        background: rgba(15, 23, 42, 0.9);
        border-color: rgba(148, 163, 184, 0.16);
        ${props => props.position === 'top' ? tw`top-full mt-3` : tw`bottom-full mb-3`};
    }
`;

interface Props {
    position: 'top' | 'bottom';
}

const FloatingBarLinks = ({ position }: Props) => {
    const { t } = useTranslation('flash/server/console');
    const match = useRouteMatch<{ id: string }>();
    const nestId = ServerContext.useStoreState((state) => state.server.data?.nestId);
    const eggId = ServerContext.useStoreState((state) => state.server.data?.eggId);
    const [overflowOpen, setOverflowOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    
    // Combine all server routes
    const allRoutes = [
        ...routes.server.general,
        ...routes.server.management,
        ...routes.server.configuration
    ].filter(r => !!r.name && !!r.icon);

    // Get max items based on window width to keep it responsive
    const [maxItems, setMaxItems] = useState(8);

    useEffect(() => {
        const handleResize = () => {
            setMaxItems(window.innerWidth < 640 ? 5 : (window.innerWidth < 768 ? 7 : 10));
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!overflowOpen) {
            return;
        }

        const onPointerDown = (event: MouseEvent) => {
            if (!dropdownRef.current?.contains(event.target as Node)) {
                setOverflowOpen(false);
            }
        };

        const onEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOverflowOpen(false);
            }
        };

        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onEscape);

        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onEscape);
        };
    }, [overflowOpen]);

    const to = (value: string) => {
        return `${match.url.replace(/\/*$/, '')}/${value.replace(/^\/+/, '')}`;
    };

    const renderItem = (route: any, key: string) => {
        const isRenderable = (route.nestIds && route.nestIds.includes(nestId ?? 0)) ||
            (route.eggIds && route.eggIds.includes(eggId ?? 0)) ||
            (route.nestId && route.nestId === nestId) ||
            (route.eggId && route.eggId === eggId) ||
            (!route.eggIds && !route.nestIds && !route.nestId && !route.eggId);

        if (!isRenderable) return null;

        const content = (
            <IconLinkContainer
                to={to(route.path)}
                exact={route.exact}
                key={key}
                title={t(route.name)}
                onClick={() => setOverflowOpen(false)}
            >
                <route.icon />
            </IconLinkContainer>
        );

        return route.permission ? (
            <Can key={key} action={route.permission} matchAny>
                {content}
            </Can>
        ) : content;
    };

    const visibleRoutes = allRoutes.slice(0, maxItems);
    const overflowRoutes = allRoutes.slice(maxItems);

    return (
        <>
            {/* Home button - always first */}
            <IconLinkContainer to={'/'} exact title={t('home')} className={'home-link'}>
                <HomeIcon />
            </IconLinkContainer>

            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

            {visibleRoutes.map((route, i) => renderItem(route, `nav-${i}`))}
            
            {overflowRoutes.length > 0 && (
                <DropdownContainer ref={dropdownRef} position={position} $open={overflowOpen}>
                    <button
                        type={'button'}
                        className="dots-btn"
                        aria-haspopup={'menu'}
                        aria-expanded={overflowOpen}
                        onClick={() => setOverflowOpen((open) => !open)}
                    >
                        <DotsHorizontalIcon />
                    </button>
                    <div className="dropdown-menu" role={'menu'}>
                        {overflowRoutes.map((route, i) => renderItem(route, `overflow-${i}`))}
                    </div>
                </DropdownContainer>
            )}
        </>
    );
};

const FloatingBar = ({ position }: Props) => {
    return (
        <BarContainer position={position}>
            <FloatingBarLinks position={position} />
        </BarContainer>
    );
};

export default FloatingBar;
