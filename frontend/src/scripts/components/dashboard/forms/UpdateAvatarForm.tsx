import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Actions, State, useStoreActions, useStoreState } from 'easy-peasy';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { httpErrorToHuman } from '@/api/http';
import Button from '@/components/elements/Button';
import { ApplicationStore } from '@/state';
import UserAvatar from '@/components/UserAvatar';

const MAX_FILE_BYTES = 1_500_000;
const MAX_IMAGE_EDGE = 256;

const readFile = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('The selected image could not be read.'));
    reader.readAsDataURL(file);
});

const loadImage = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The selected image could not be processed.'));
    image.src = src;
});

const buildAvatarDataUrl = async (file: File): Promise<string> => {
    if (file.size > MAX_FILE_BYTES) {
        throw new Error('Use an image smaller than 1.5 MB.');
    }

    const source = await readFile(file);
    const image = await loadImage(source);
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');

    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));

    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('Your browser could not prepare the avatar preview.');
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/png');
};

export default function UpdateAvatarForm() {
    const user = useStoreState((state: State<ApplicationStore>) => state.user.data);
    const updateUserAvatar = useStoreActions((state: Actions<ApplicationStore>) => state.user.updateUserAvatar);
    const { clearFlashes, addFlash } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [value, setValue] = useState(user?.avatarUrl || '');
    const [preview, setPreview] = useState(user?.avatarUrl || '');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setValue(user?.avatarUrl || '');
        setPreview(user?.avatarUrl || '');
    }, [user?.avatarUrl]);

    const persistAvatar = async (avatarUrl: string | null, successMessage: string) => {
        clearFlashes('account:avatar');
        setSubmitting(true);

        try {
            const nextAvatar = await updateUserAvatar({ avatarUrl });
            setValue(nextAvatar || '');
            setPreview(nextAvatar || '');
            addFlash({
                type: 'success',
                key: 'account:avatar',
                message: successMessage,
            });
        } catch (error) {
            addFlash({
                type: 'error',
                key: 'account:avatar',
                title: 'Error',
                message: httpErrorToHuman(error),
            });
        } finally {
            setSubmitting(false);
        }
    };

    const onFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.currentTarget.files?.[0];
        event.currentTarget.value = '';

        if (!file) {
            return;
        }

        clearFlashes('account:avatar');

        try {
            const nextValue = await buildAvatarDataUrl(file);
            setValue(nextValue);
            setPreview(nextValue);
            addFlash({
                type: 'success',
                key: 'account:avatar',
                message: 'Avatar image prepared. Save changes to publish it.',
            });
        } catch (error) {
            addFlash({
                type: 'error',
                key: 'account:avatar',
                title: 'Error',
                message: error instanceof Error ? error.message : 'The selected image could not be prepared.',
            });
        }
    };

    return (
        <div className={'px-6 pb-6'}>
            <div className={'relative rounded-box border border-gray-500/60 bg-gray-800/70 p-4'}>
                <SpinnerOverlay size={'large'} visible={submitting} />
                <div className={'flex flex-col gap-4 md:flex-row md:items-start'}>
                    <div className={'flex items-center gap-4'}>
                        <div className={'rounded-box border border-gray-500/60 bg-gray-700/80 p-2'}>
                            <UserAvatar avatarUrl={preview || null} width={'72px'} rounded={'rounded-box'} />
                        </div>
                        <div className={'space-y-1'}>
                            <p className={'text-sm font-medium text-gray-200'}>Profile picture</p>
                            <p className={'text-xs text-gray-400'}>Use an image URL or upload a file. Uploaded files are resized to 256px.</p>
                        </div>
                    </div>
                    <div className={'flex-1 space-y-4'}>
                        <label className={'block'}>
                            <span className={'mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-gray-400'}>Image URL</span>
                            <input
                                type={'url'}
                                value={value}
                                onChange={(event) => {
                                    const nextValue = event.currentTarget.value;
                                    setValue(nextValue);
                                    setPreview(nextValue);
                                }}
                                className={'w-full rounded-component border border-gray-500 bg-gray-600 px-3 py-3 text-sm text-gray-100 transition-colors focus:border-primary-300 focus:ring-1 focus:ring-primary-300'}
                                placeholder={'https://example.com/avatar.png'}
                            />
                        </label>
                        <div className={'flex flex-wrap gap-3'}>
                            <input ref={fileInputRef} type={'file'} accept={'image/png,image/jpeg,image/webp,image/gif,image/svg+xml'} className={'hidden'} onChange={onFileSelected} />
                            <Button type={'button'} isSecondary onClick={() => fileInputRef.current?.click()}>
                                Upload image
                            </Button>
                            <Button type={'button'} disabled={submitting} onClick={() => void persistAvatar(value.trim() ? value.trim() : null, 'Profile picture updated.')}>
                                Save avatar
                            </Button>
                            <Button type={'button'} isSecondary color={'grey'} disabled={submitting || (!value && !user?.avatarUrl)} onClick={() => void persistAvatar(null, 'Profile picture removed.')}>
                                Use default
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
