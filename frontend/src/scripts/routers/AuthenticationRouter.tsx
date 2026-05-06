import React, { lazy, useEffect, useState } from 'react';
import { ApplicationStore } from '@/state';
import { useStoreState } from 'easy-peasy';
import { Redirect, Route, Switch } from 'react-router-dom';
import { SupportIcon } from '@heroicons/react/outline';
import { FaDiscord } from 'react-icons/fa';
import { NotFound } from '@/components/elements/ScreenBlock';
import { useHistory, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import Spinner from '@/components/elements/Spinner';

const LoginContainer = lazy(
    () => import('@/components/auth/LoginContainer') as Promise<{ default: React.ComponentType<any> }>
);
const ForgotPasswordContainer = lazy(
    () => import('@/components/auth/ForgotPasswordContainer') as Promise<{ default: React.ComponentType<any> }>
);
const ResetPasswordContainer = lazy(
    () => import('@/components/auth/ResetPasswordContainer') as Promise<{ default: React.ComponentType<any> }>
);
const LoginCheckpointContainer = lazy(
    () => import('@/components/auth/LoginCheckpointContainer') as Promise<{ default: React.ComponentType<any> }>
);

const Switches = () => {
    const history = useHistory();
    const location = useLocation();

    return (
        <Spinner.Suspense>
            <Switch location={location}>
                <Route path={'/auth/login'} exact render={(props) => <LoginContainer {...props} />} />
                <Route path={'/auth/login/checkpoint'} render={(props) => <LoginCheckpointContainer {...props} />} />
                <Route path={'/auth/password'} exact render={() => <ForgotPasswordContainer />} />
                <Route path={'/auth/password/reset/:token'} render={(props) => <ResetPasswordContainer {...props} />} />
                <Route path={'/auth'} exact>
                    <Redirect to={'/auth/login'} />
                </Route>
                <Route path={'/auth/checkpoint'} />
                <Route path={'*'}>
                    <NotFound onBack={() => history.push('/auth/login')} />
                </Route>
            </Switch>
        </Spinner.Suspense>
    );
};

const TopBar = () => {
    const { t } = useTranslation('flash/auth');
    const [guildData, setGuildData] = useState<{ instant_invite: string } | null>(null);

    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const logo = useStoreState((state: ApplicationStore) => state.settings.data!.flash.logo || state.settings.data!.flash.meta_favicon || '/branding/aether-mark.png');
    const logoHeight = useStoreState((state: ApplicationStore) => state.settings.data!.flash.logoHeight);
    const fullLogo = useStoreState((state: ApplicationStore) => state.settings.data!.flash.fullLogo);
    const socialPosition = useStoreState((state: ApplicationStore) => state.settings.data!.flash.socialPosition);
    const logoPosition = useStoreState((state: ApplicationStore) => state.settings.data!.flash.logoPosition);
    const discord = useStoreState((state: ApplicationStore) => state.settings.data!.flash.discord);
    const support = useStoreState((state: ApplicationStore) => state.settings.data!.flash.support);

    useEffect(() => {
        if (socialPosition !== 1 || !discord) {
            setGuildData(null);
            return;
        }

        const controller = new AbortController();

        const fetchData = async () => {
            try {
                const response = await fetch(`https://discord.com/api/guilds/${discord}/widget.json`, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch guild data');
                }

                const data = await response.json();
                setGuildData(data);
            } catch (error) {
                if ((error as Error).name === 'AbortError') {
                    return;
                }

                console.error('Error fetching guild data:', error);
            }
        };

        fetchData();
        return () => controller.abort();
    }, [discord, socialPosition]);

    return(
        <div className={'flex min-h-[72px] items-center justify-between px-4 py-4 sm:px-6'}>
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
