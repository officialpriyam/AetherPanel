import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import http from '@/api/http';
import ServerSelector from '@/components/elements/ServerSelector';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import UserAvatar from '@/components/UserAvatar';
import DropdownMenu, { DropdownLinkRow, DropdownButtonRow } from '@/components/elements/DropdownMenu';
import { UserCircleIcon, CogIcon, EyeIcon, MoonIcon, LogoutIcon, MenuIcon, XIcon, ServerIcon, SupportIcon, ChatAlt2Icon } from '@heroicons/react/outline';
import { FaDiscord } from "react-icons/fa";
import { useTranslation } from 'react-i18next';

interface Props {
    children?: React.ReactNode;
}
interface Dropdown {
    sideBar?: React.ReactNode;
}

const MobileLinks = styled.div`
    ${tw`flex flex-col gap-5 mb-2`};

    & > div{
        ${tw`flex flex-col gap-1`};

        & > span{
            ${tw`text-sm text-gray-300`};
        }

        & > a{
            ${tw`flex items-center gap-x-1 text-gray-200 duration-300 py-1`};

            & > svg{
                ${tw`text-gray-300 duration-300 w-5`};
            }

            &:hover,
            &:focus,
            &.active{
                ${tw`text-gray-50`};

                & > svg{
                    ${tw`text-gray-100`}
                }
            }
        }
    }
`;
const RightNavigation = styled.div`
    ${tw`lg:flex items-center gap-x-5 hidden`}

    & > a,
    & > button,
    & > .navigation-link {
        ${tw`flex items-center no-underline text-neutral-200 py-2 cursor-pointer transition-all duration-150 gap-x-1`};

        &:active,
        &:hover {
            ${tw`text-neutral-100`};
        }

        & > svg{
            ${tw`w-5`}
        }
    }
`;

const ClientDropdown = ({ sideBar }: Dropdown) => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const onClickRef = useRef<DropdownMenu>(null);
    
    const { t } = useTranslation(['flash/navigation']);

    const modeToggler = useStoreState((state: ApplicationStore) => state.settings.data!.flash.modeToggler);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);

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
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return(
        <DropdownMenu
            ref={onClickRef}
            sideBar={sideBar ? true : false}
            renderToggle={(onClick) => (
                <div onClick={onClick} className="cursor-pointer flex gap-x-2 items-center">
                    <UserAvatar /> 
                    <div>
                        <p>{t`account`}</p>
                    </div>
                </div>
            )}
        >
            <SpinnerOverlay visible={isLoggingOut} />
            <DropdownLinkRow href="/account">
                <UserCircleIcon className="w-5" /> <span className={'whitespace-nowrap'}>{t`account-overview`}</span>
            </DropdownLinkRow>
            {rootAdmin && <DropdownLinkRow href="/admin">
                <CogIcon className="w-5" /> {t`admin-area`}
            </DropdownLinkRow> }
            <DropdownLinkRow href="/account/activity">
                <EyeIcon className="w-5" /> {t`account-activity`}
            </DropdownLinkRow>
            {String(modeToggler) == 'true' &&
            <DropdownButtonRow onClick={toggleDarkMode}>
                <MoonIcon className="w-5" /> {t`dark-light-mode`}
            </DropdownButtonRow>}
            <hr className={'border-b border-gray-500 my-2'}/>
            <DropdownButtonRow danger onClick={onTriggerLogout}>
                <LogoutIcon className="w-5" /> {t`logout`}
            </DropdownButtonRow>
        </DropdownMenu>
    )
}

export default ({ children }: Props) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [guildData, setGuildData] = useState<{ instant_invite: string } | null>(null);

    const { t } = useTranslation(['flash/navigation']);

    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const layout = useStoreState((state: ApplicationStore) => state.settings.data!.flash.layout);
    const logo = useStoreState((state: ApplicationStore) => state.settings.data!.flash.logo);
    const logoHeight = useStoreState((state: ApplicationStore) => state.settings.data!.flash.logoHeight);
    const fullLogo = useStoreState((state: ApplicationStore) => state.settings.data!.flash.fullLogo);
    const searchComponent = useStoreState((state: ApplicationStore) => state.settings.data!.flash.searchComponent);
    const discord = useStoreState((state: ApplicationStore) => state.settings.data!.flash.discord);
    const support = useStoreState((state: ApplicationStore) => state.settings.data!.flash.support);
    const ticketAddonEnabled = String(
        useStoreState((state: ApplicationStore) => state.settings.data!.flash.addon_ticket_system_enabled)
    ) === 'true';

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await fetch(`https://discord.com/api/guilds/${discord}/widget.json`);
    
            if (!response.ok) {
              throw new Error('Failed to fetch guild data');
            }
    
            const data = await response.json();
            setGuildData(data);
          } catch (error) {
            console.error('Error fetching guild data:', error);
          }
        };
    
        fetchData();
      }, []);

    const topBarStyle: React.CSSProperties = {
        backgroundColor: 'rgba(15, 23, 42, 0.82)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
        boxShadow: '0 10px 26px rgba(2, 6, 23, 0.12)',
    };

    const mobileMenuStyle: React.CSSProperties = {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
    };

    return (
        <>
        <div className={`w-full px-4 overflow-x-auto !overflow-visible z-20 relative ${layout == 3 ? 'backdrop !border-0' : ''}`} style={layout == 3 ? topBarStyle : undefined}>
            <div className={`mx-auto w-full flex items-center justify-between max-w-[1200px] py-2`}>
                <div className="flex gap-x-10 items-center">
                    {layout == 3 &&
                    <div className={'lg:flex hidden gap-x-2 items-center'}>
                        <Link to={'/'} className='flex gap-x-2 items-center font-semibold text-lg text-gray-50 py-2'>
                            <img src={logo} alt={name + 'logo'} css={`height:${logoHeight};`} />
                            {String(fullLogo) === 'false' && name}
                        </Link>
                    </div>
                    }
                    <div className={'lg:hidden flex gap-x-2 items-center'}>
                        <Link to={'/'} className='flex gap-x-2 items-center font-semibold text-lg text-gray-50 py-2'>
                            <img src={logo} alt={name + 'logo'} css={`height:${logoHeight};`} />
                            {String(fullLogo) === 'false' && name}
                        </Link>
                    </div>
                    <div className={'sm:block hidden'}>
                        {searchComponent == 1  
                        ? <ServerSelector />
                        : <SearchContainer /> }
                    </div>
                </div>
                <RightNavigation>
                    {ticketAddonEnabled && (
                        <NavLink to={'/tickets'} className={'navigation-link'} title={t`tickets`}>
                            <ChatAlt2Icon className={'w-5 h-5'} />
                        </NavLink>
                    )}
                    {discord && <>{guildData !== null ? <a href={guildData.instant_invite} title="Discord"><FaDiscord className={'w-5 h-5'} /></a> : <a href={''} title="Discord"><FaDiscord className={'w-5 h-5'} /></a>}</>}
                    {support && <a href={support} title={t`supportcenter`}><SupportIcon className={'w-5 h-5'} /></a>}
                    {layout == 3 && <ClientDropdown />}
                </RightNavigation>
                <button onClick={() => setIsOpen((isOpen) => !isOpen)} className={'lg:hidden'}>
                    <MenuIcon className={'w-5'} />
                </button>
            </div>
        </div>
        {isOpen &&
            <div className={'fixed top-0 left-0 h-full w-full z-[99] backdrop-blur-xl px-4 py-2 flex flex-col overflow-y-auto text-xl'} style={mobileMenuStyle}>
                <div className={'flex justify-between items-center'}>
                    <div className={'flex gap-x-2 items-center'} onClick={() => setIsOpen((isOpen) => !isOpen)}>
                        <Link to={'/'} className='flex gap-x-2 items-center font-semibold text-lg text-gray-50 py-2'>
                            <img src={logo} alt={name + 'logo'} css={`height:${logoHeight};`} />
                            {String(fullLogo) === 'false' && name}
                        </Link>
                    </div>
                    <button onClick={() => setIsOpen((isOpen) => !isOpen)}>
                        <XIcon className={'w-5'} />
                    </button>
                </div>
                <MobileLinks onClick={() => setIsOpen((isOpen) => !isOpen)}>
                    <div>
                        <NavLink to={'/'} exact>
                            <ServerIcon/> {t`servers`}
                        </NavLink>
                        <NavLink to={'/account'} exact>
                            <UserCircleIcon/> {t`account`}
                        </NavLink>
                        {ticketAddonEnabled && (
                            <NavLink to={'/tickets'} exact>
                                <ChatAlt2Icon /> {t`tickets`}
                            </NavLink>
                        )}
                        {discord !== 'none' && <>{guildData !== null ? <a href={guildData.instant_invite} title="Discord"><FaDiscord className={'w-5 h-5'} /></a> : <a href={''} title="Discord"><FaDiscord className={'w-5 h-5'} /></a>}</>}
                        {support !== 'none' && <a href={support} title={t`supportcenter`}><SupportIcon className={'w-5 h-5'} /></a>}
                    </div>
                    {children}
                </MobileLinks>
                <div className={'mt-auto'}>
                    <ClientDropdown sideBar/>
                </div>
            </div>
        }
        </>
    );
};
