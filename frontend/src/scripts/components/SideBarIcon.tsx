import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { UserCircleIcon, CogIcon, EyeIcon, LogoutIcon, SupportIcon } from '@heroicons/react/outline';
import http from '@/api/http';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/macro';
import tw from 'twin.macro';

const NavigationLinks = styled.div`
    ${tw`flex flex-col gap-2 h-full`};

    & > div{
        ${tw`flex flex-col gap-2`};

        & > span{
            ${tw`hidden`}
        }
    }

    & a,
    & button{
        ${tw`relative z-10 flex items-center justify-center duration-300 rounded-component`};
        aspect-ratio: 1 / 1;

        & > svg{
            ${tw`text-gray-200 w-6 duration-300`};
        }
        & > span{
            ${tw`pointer-events-none fixed opacity-0 bottom-[10px] left-[95px] backdrop-blur-md rounded-component px-3 py-2 duration-300`};
            background-color: rgba(15, 23, 42, 0.9);
            border: 1px solid rgba(148, 163, 184, 0.14);
        }

        &:hover > span{
            ${tw`opacity-100 bottom-[30px]`}
        }

        &.active,
        &:focus,
        &:hover{
            background-color: color-mix(in srgb, var(--gray50) 10%, transparent);

            & > svg{
                ${tw`text-gray-100 w-7`}
            }
        }
    }
`;

interface Props {
    children?: React.ReactNode;
}

const SideBarIcon = ({ children }: Props) => {
    const { t } = useTranslation('flash/navigation');
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const logo = useStoreState((state: ApplicationStore) => state.settings.data!.flash.logo || state.settings.data!.flash.meta_favicon || '/branding/aether-mark.png');
    const logoHeight = useStoreState((state: ApplicationStore) => state.settings.data!.flash.logoHeight);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const ticketAddonEnabled = String(
        useStoreState((state: ApplicationStore) => state.settings.data!.flash.addon_ticket_system_enabled)
    ) === 'true';

    useEffect(() => {
        const storedMode = localStorage.getItem('darkMode');
        if (storedMode !== null) {
          setIsDarkMode(storedMode === 'true');
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('darkMode', String(isDarkMode));
        document.body.classList.toggle('lightmode', isDarkMode);
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode((prevMode) => !prevMode);
    };

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/api/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    const shellStyle: React.CSSProperties = {
        backgroundColor: 'rgba(15, 23, 42, 0.84)',
        borderRight: '1px solid rgba(148, 163, 184, 0.16)',
        boxShadow: '18px 0 42px rgba(2, 6, 23, 0.16)',
    };

    const dividerStyle: React.CSSProperties = {
        borderColor: 'rgba(148, 163, 184, 0.16)',
    };

    return (
    <div className={'w-[75px] shrink-0 h-screen overflow-y-auto md:flex hidden flex-col sticky top-0 backdrop border-t-0 border-b-0 border-l-0 px-4 py-3'} style={shellStyle}>
        <SpinnerOverlay visible={isLoggingOut} />
        <Link to={'/'} className={'flex items-center justify-center pb-3 mb-2'} title={t('servers')}>
            <img src={logo} alt={name + 'logo'} css={`height:${logoHeight}; width:auto; display:block;`} />
        </Link>
        <NavigationLinks>
            <div className={'pb-2 border-b'} style={dividerStyle}>
                <NavLink to={'/account'} exact>
                    <UserCircleIcon/>
                    <span>{t('account')}</span>
                </NavLink>
                <NavLink to={'/account/activity'}>
                    <EyeIcon/>
                    <span>{t('account-activity')}</span>
                </NavLink>
                {ticketAddonEnabled && (
                    <NavLink to={'/tickets'} exact>
                        <SupportIcon />
                        <span>{t('tickets')}</span>
                    </NavLink>
                )}
                {rootAdmin && (
                    <a href={'/admin'}>
                        <CogIcon/>
                        <span>{t('admin-view')}</span>
                    </a>
                )}
            </div>
            {children ? children : ''}
            <div className={'mt-auto pt-2 border-t'} style={dividerStyle}>
                <button onClick={onTriggerLogout}>
                    <LogoutIcon />
                    <span>{t('logout')}</span>
                </button>
            </div>
        </NavigationLinks>
    </div>
)};

export default SideBarIcon;

