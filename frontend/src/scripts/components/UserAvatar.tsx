import * as React from 'react';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import Avatar from '@/components/Avatar';

interface Props {
    email?: string;
    user?: string;
    uuid?: string;
    width?: string;
    rounded?: string;
    avatarUrl?: string | null;
}

const DEFAULT_AVATAR = '/branding/default-avatar.svg';

export default ({ email, user, uuid, width, rounded, avatarUrl }: Props) => {
    const profileType = useStoreState((state: ApplicationStore) => state.settings.data!.flash.profileType);
    const currentUser = useStoreState((state: ApplicationStore) => state.user.data);
    const size = width || '32px';
    const shape = rounded || 'rounded-full';
    const identifier = user || currentUser?.username || 'User';
    const isCurrentUser = !uuid && !user && !email
        ? true
        : !!currentUser && (
            (!!uuid && uuid === currentUser.uuid)
            || (!!user && user === currentUser.username)
            || (!!email && email === currentUser.email)
        );
    const preferredAvatar = avatarUrl ?? (isCurrentUser ? currentUser?.avatarUrl ?? null : null);
    const [imageSrc, setImageSrc] = React.useState<string | null>(preferredAvatar || (isCurrentUser ? DEFAULT_AVATAR : null));

    React.useEffect(() => {
        setImageSrc(preferredAvatar || (isCurrentUser ? DEFAULT_AVATAR : null));
    }, [preferredAvatar, isCurrentUser]);

    if (imageSrc) {
        return (
            <img
                src={imageSrc}
                style={{ width: size, height: size }}
                className={`${shape} object-cover`}
                alt={`${identifier} avatar`}
                onError={() => setImageSrc(DEFAULT_AVATAR)}
            />
        );
    }

    if (profileType === 'boring') {
        return (
            <div className={`${shape} overflow-hidden flex items-center`} css={`width:${size};height:${size};`}>
                {uuid ? <Avatar name={uuid} /> : <Avatar.User />}
            </div>
        );
    }

    if (profileType === 'gravatar' || profileType === 'initials') {
        return <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${identifier}`} style={{ width: size, height: size }} className={shape} alt="Dicebear Avatar" />;
    }

    if (profileType === 'avataaars') {
        return <img src={`https://api.dicebear.com/7.x/big-ears-neutral/svg?seed=${identifier}`} style={{ width: size, height: size }} className={shape} alt="Dicebear Avatar" />;
    }

    if (profileType === 'bottts') {
        return <img src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${identifier}`} style={{ width: size, height: size }} className={shape} alt="Dicebear Avatar" />;
    }

    if (profileType === 'identicon') {
        return <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${identifier}`} style={{ width: size, height: size }} className={shape} alt="Dicebear Avatar" />;
    }

    return <img src={DEFAULT_AVATAR} style={{ width: size, height: size }} className={`${shape} object-cover`} alt="Default avatar" />;
};
