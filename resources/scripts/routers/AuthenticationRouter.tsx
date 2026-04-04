import React, { useEffect, useState} from 'react';
import { ApplicationStore } from '@/state';
import { useStoreState } from 'easy-peasy';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import LoginContainer from '@/components/auth/LoginContainer';
import ForgotPasswordContainer from '@/components/auth/ForgotPasswordContainer';
import ResetPasswordContainer from '@/components/auth/ResetPasswordContainer';
import LoginCheckpointContainer from '@/components/auth/LoginCheckpointContainer';
import { SupportIcon } from '@heroicons/react/outline';
import { FaDiscord } from "react-icons/fa";
import { NotFound } from '@/components/elements/ScreenBlock';
import { useHistory, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';

const Switches = () => {
    const { path } = useRouteMatch();
    const history = useHistory();
    const location = useLocation();

    return (
        <Switch location={location}>
            <Route path={`${path}/login`} component={LoginContainer} exact />
            <Route path={`${path}/login/checkpoint`} component={LoginCheckpointContainer} />
            <Route path={`${path}/password`} component={ForgotPasswordContainer} exact />
            <Route path={`${path}/password/reset/:token`} component={ResetPasswordContainer} />
            <Route path={`${path}/checkpoint`} />
            <Route path={'*'}>
                <NotFound onBack={() => history.push('/auth/login')} />
            </Route>
        </Switch>
    );
};

const TopBar = () => {
    const { t } = useTranslation('flash/auth');
    const [guildData, setGuildData] = useState<{ instant_invite: string } | null>(null);

    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const logo = useStoreState((state: ApplicationStore) => state.settings.data!.flash.logo);
    const logoHeight = useStoreState((state: ApplicationStore) => state.settings.data!.flash.logoHeight);
    const fullLogo = useStoreState((state: ApplicationStore) => state.settings.data!.flash.fullLogo);
    const socialPosition = useStoreState((state: ApplicationStore) => state.settings.data!.flash.socialPosition);
    const logoPosition = useStoreState((state: ApplicationStore) => state.settings.data!.flash.logoPosition);
    const discord = useStoreState((state: ApplicationStore) => state.settings.data!.flash.discord);
    const support = useStoreState((state: ApplicationStore) => state.settings.data!.flash.support);

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

    return(
        <div className={'flex items-center justify-between p-5'}>
            {logoPosition == 2 &&
            <div className='flex gap-x-2 items-center font-semibold text-lg text-gray-50'>
                <img src={logo} alt={name + 'logo'} css={`height:${logoHeight};`} />
                {String(fullLogo) === 'false' && name}
            </div>}
            {socialPosition == 1 &&
                <div className={'flex gap-x-6'}>
                    {discord && <>{guildData !== null ? <a className={'flex gap-x-1 items-center duration-300 hover:text-gray-100'} href={guildData.instant_invite}><FaDiscord /> Discord</a> : <a href={''}><FaDiscord />Discord</a>}</>}
                    {support && <a className={'flex gap-x-1 items-center duration-300 hover:text-gray-100'} href={support}><SupportIcon className={'w-5'} />{t('support')}</a>}
                </div>
            }
        </div>
    )
}

const AuthContainer = () => {
    const loginBackground = useStoreState((state: ApplicationStore) => state.settings.data!.flash.loginBackground);
    const loginLayout = useStoreState((state: ApplicationStore) => state.settings.data!.flash.loginLayout);
    const loginGradient = useStoreState((state: ApplicationStore) => state.settings.data!.flash.loginGradient);

    const Gradient = () => (
        String(loginGradient) == 'true'
            ? <div
                className={'absolute inset-0 z-[-1]'}
                css={`
                    background:
                        radial-gradient(circle at top, rgba(20, 32, 52, 0.12), transparent 22%),
                        linear-gradient(180deg, rgba(2, 6, 14, 0.3) 0%, rgba(3, 7, 16, 0.58) 42%, rgba(4, 8, 16, 0.9) 100%);
                `}
            />
            : null
    );

    const backgroundStyle = loginLayout == 1
        ? `
            background-image:
                linear-gradient(135deg, rgba(2, 6, 14, 0.94) 0%, rgba(4, 8, 16, 0.88) 44%, rgba(7, 12, 22, 0.96) 100%),
                url(${loginBackground});
            background-blend-mode: multiply;
        `
        : `
            background:
                radial-gradient(circle at top right, rgba(24, 39, 62, 0.16), transparent 24%),
                radial-gradient(circle at bottom left, rgba(8, 23, 36, 0.22), transparent 32%),
                linear-gradient(180deg, #040814 0%, #08111d 46%, #0a1220 100%);
        `;

    return (
        <div className={'min-h-screen h-full bg-center bg-no-repeat bg-cover z-10 relative'} css={backgroundStyle}>
            <div className={'min-h-screen flex flex-col'}>
                <TopBar />
                <Switches />
            </div>
            <Gradient />
        </div>
    );
};

export default AuthContainer;
