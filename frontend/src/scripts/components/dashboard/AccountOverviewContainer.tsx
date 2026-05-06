import React, { useMemo, useState } from 'react';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import AccountApiContainer from '@/components/dashboard/AccountApiContainer';
import AccountSSHContainer from '@/components/dashboard/ssh/AccountSSHContainer';
import UpdatePasswordForm from '@/components/dashboard/forms/UpdatePasswordForm';
import UpdateEmailAddressForm from '@/components/dashboard/forms/UpdateEmailAddressForm';
import UpdateAvatarForm from '@/components/dashboard/forms/UpdateAvatarForm';
import ConfigureTwoFactorForm from '@/components/dashboard/forms/ConfigureTwoFactorForm';
import AppearanceWrapper from '@/components/dashboard/forms/AppearanceWrapper';
import PageContentBlock from '@/components/elements/PageContentBlock';
import FlashMessageRender from '@/components/FlashMessageRender';
import UserAvatar from '@/components/UserAvatar';
import MessageBox from '@/components/MessageBox';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LuCircleCheck, LuShieldAlert, LuUserRound } from 'react-icons/lu';

export default () => {
    const { t } = useTranslation('flash/account');
    const { state } = useLocation<undefined | { twoFactorRedirect?: boolean }>();
    const user = useStoreState((store: ApplicationStore) => store.user.data);
    const [tab, setTab] = useState<'api' | 'ssh'>('api');

    const displayName = useMemo(() => {
        if (!user) {
            return 'User';
        }

        return user.firstName?.trim() || user.username;
    }, [user]);

    if (!user) {
        return null;
    }

    return (
        <PageContentBlock title={t('account-overview')}>
            {state?.twoFactorRedirect && (
                <MessageBox title={'2-Factor Required'} type={'error'}>
                    {t('twofactor-messagebox')}
                </MessageBox>
            )}

            <div className={'mb-6 rounded-box border border-gray-500/40 bg-gray-800/70 px-6 py-6 shadow-lg backdrop'}>
                <div className={'flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between'}>
                    <div className={'flex flex-col gap-4 sm:flex-row sm:items-center'}>
                        <div className={'rounded-box border border-gray-500/50 bg-gray-700/70 p-2 shadow-inner'}>
                            <UserAvatar width={'88px'} rounded={'rounded-box'} />
                        </div>
                        <div className={'space-y-2'}>
                            <p className={'text-xs font-semibold uppercase tracking-[0.18em] text-gray-400'}>Account workspace</p>
                            <h2 className={'text-2xl font-semibold text-gray-50'}>{displayName}</h2>
                            <p className={'text-sm text-gray-300'}>{user.email}</p>
                            <div className={'flex flex-wrap gap-2 pt-1'}>
                                <span className={'inline-flex items-center gap-2 rounded-full border border-gray-500/50 bg-gray-700/70 px-3 py-1 text-xs font-medium text-gray-200'}>
                                    <LuUserRound />
                                    @{user.username}
                                </span>
                                <span className={'inline-flex items-center gap-2 rounded-full border border-gray-500/50 bg-gray-700/70 px-3 py-1 text-xs font-medium text-gray-200'}>
                                    {user.useTotp ? <LuCircleCheck className={'text-green-300'} /> : <LuShieldAlert className={'text-amber-300'} />}
                                    {user.useTotp ? '2FA enabled' : '2FA recommended'}
                                </span>
                                {user.rootAdmin && (
                                    <span className={'inline-flex items-center gap-2 rounded-full border border-primary-400/30 bg-primary-500/15 px-3 py-1 text-xs font-medium text-primary-100'}>
                                        Administrator
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={'grid gap-3 sm:grid-cols-2 xl:min-w-[360px]'}>
                        <div className={'rounded-box border border-gray-500/40 bg-gray-900/35 px-4 py-3'}>
                            <p className={'text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500'}>Identity</p>
                            <p className={'mt-2 text-sm font-medium text-gray-100'}>Profile, email, and avatar</p>
                        </div>
                        <div className={'rounded-box border border-gray-500/40 bg-gray-900/35 px-4 py-3'}>
                            <p className={'text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500'}>Security</p>
                            <p className={'mt-2 text-sm font-medium text-gray-100'}>{user.useTotp ? 'Protected with two-factor auth' : 'Password and 2FA controls available'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={'grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]'}>
                <div className={'flex flex-col gap-4'}>
                    <div className={'overflow-hidden rounded-box border border-gray-500/40 bg-gray-800/70 shadow-lg backdrop'}>
                        <div className={'border-b border-gray-500/30 px-6 py-5'}>
                            <p className={'text-lg font-semibold text-gray-50'}>Profile settings</p>
                            <p className={'mt-1 text-sm text-gray-400'}>Manage your identity, contact email, and profile image.</p>
                        </div>
                        <FlashMessageRender byKey={'account:email'} />
                        <UpdateEmailAddressForm />
                        <FlashMessageRender byKey={'account:avatar'} />
                        <UpdateAvatarForm />
                    </div>
                    <AppearanceWrapper />
                </div>

                <div className={'flex flex-col gap-4'}>
                    <FlashMessageRender byKey={'account:password'} />
                    <UpdatePasswordForm />
                    <ConfigureTwoFactorForm />
                </div>
            </div>

            <div className={'mt-4 rounded-box border border-gray-500/40 bg-gray-800/70 p-6 shadow-lg backdrop'}>
                <div className={'mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'}>
                    <div>
                        <p className={'text-lg font-semibold text-gray-50'}>Access tokens</p>
                        <p className={'mt-1 text-sm text-gray-400'}>Manage API credentials and SSH keys from one place.</p>
                    </div>
                    <div className={'inline-flex rounded-full border border-gray-500/40 bg-gray-900/40 p-1'}>
                        <button
                            type={'button'}
                            onClick={() => setTab('api')}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${tab === 'api' ? 'bg-primary-500 text-gray-950 shadow' : 'text-gray-300 hover:text-gray-100'}`}
                        >
                            {t('apikey')}
                        </button>
                        <button
                            type={'button'}
                            onClick={() => setTab('ssh')}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${tab === 'ssh' ? 'bg-primary-500 text-gray-950 shadow' : 'text-gray-300 hover:text-gray-100'}`}
                        >
                            {t('sshkey')}
                        </button>
                    </div>
                </div>

                {tab === 'api' ? <AccountApiContainer /> : <AccountSSHContainer />}
            </div>
        </PageContentBlock>
    );
};
