import React, { useState, useEffect } from 'react';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { LuPartyPopper, LuMegaphone, LuInfo, LuCircleAlert, LuTriangleAlert, LuCircleCheck, LuCircleX } from "react-icons/lu";
import parser from 'bbcode-to-react';
import styled, { keyframes } from 'styled-components/macro';
import tw from 'twin.macro';

const slideDown = keyframes`
    from {
        opacity: 0;
        transform: translate(-50%, -20px);
    }
    to {
        opacity: 1;
        transform: translate(-50%, 0);
    }
`;

const MyAlert = styled.div`
    ${tw`fixed top-4 left-1/2 z-50 flex items-center gap-x-3 px-5 py-3 rounded-xl text-gray-100 shadow-2xl`};
    max-width: 720px;
    width: calc(100% - 2rem);
    animation: ${slideDown} 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;

    & > svg{
        font-size: 1.3rem;
        flex-shrink: 0;
    }

    &.update{
        background: rgba(22, 170, 170, 0.2);
        border-color: rgba(22, 170, 170, 0.3);
    }
    &.info{
        background: rgba(10, 127, 230, 0.2);
        border-color: rgba(10, 127, 230, 0.3);
    }
    &.success{
        background: rgba(13, 162, 44, 0.2);
        border-color: rgba(13, 162, 44, 0.3);
    }
    &.alert{
        background: rgba(215, 194, 25, 0.2);
        border-color: rgba(215, 194, 25, 0.3);
    }
    &.warning{
        background: rgba(215, 25, 25, 0.2);
        border-color: rgba(215, 25, 25, 0.3);
    }

    &.party{
        ${tw`font-medium`};
        background: rgba(30, 41, 59, 0.7);
        border-color: rgba(255, 255, 255, 0.1);
        color: var(--primary);
    }
    
    .icon-container {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.4rem;
        flex-shrink: 0;
    }
`;

const ANNOUNCEMENT_DISMISS_TTL = 6 * 60 * 60 * 1000;
const isEnabled = (value: unknown): boolean => value === true || ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());

const Alert = () => {
    const [isOpen, setIsOpen] = useState(true);

    const announcementType = useStoreState((state: ApplicationStore) => state.settings.data!.flash.announcementType);
    const announcementCloseable = useStoreState((state: ApplicationStore) => state.settings.data!.flash.announcementCloseable);
    const announcementMessage = useStoreState((state: ApplicationStore) => state.settings.data!.flash.announcementMessage);
    const announcementTimeout = useStoreState((state: ApplicationStore) => state.settings.data!.flash.announcementTimeout);
    const announcementIcon = useStoreState((state: ApplicationStore) => state.settings.data!.flash.announcementIcon);
    const announcementKey = `aetherpanel:announcement:${announcementType}:${announcementMessage.trim()}`;

    useEffect(() => {
        if (announcementType === 'disabled' || announcementMessage.trim().length < 1) {
            setIsOpen(false);
            return;
        }

        let reopenTimer: number | undefined;
        let autoHideTimer: number | undefined;
        const dismissedAt = Number(localStorage.getItem(announcementKey) || '0');
        const timeElapsed = dismissedAt > 0 ? Date.now() - dismissedAt : ANNOUNCEMENT_DISMISS_TTL + 1;
        const isDismissed = dismissedAt > 0 && timeElapsed < ANNOUNCEMENT_DISMISS_TTL;

        if (isDismissed) {
            setIsOpen(false);
            reopenTimer = window.setTimeout(() => {
                localStorage.removeItem(announcementKey);
                setIsOpen(true);
            }, ANNOUNCEMENT_DISMISS_TTL - timeElapsed);
        } else {
            localStorage.removeItem(announcementKey);
            setIsOpen(true);

            const timeoutSeconds = Number(announcementTimeout);
            if (Number.isFinite(timeoutSeconds) && timeoutSeconds > 0) {
                autoHideTimer = window.setTimeout(() => {
                    setIsOpen(false);
                }, timeoutSeconds * 1000);
            }
        }

        return () => {
            if (reopenTimer) {
                window.clearTimeout(reopenTimer);
            }
            if (autoHideTimer) {
                window.clearTimeout(autoHideTimer);
            }
        };
    }, [announcementKey, announcementMessage, announcementTimeout, announcementType]);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem(announcementKey, Date.now().toString());
    };

    return (
        <>
            {announcementType !== 'disabled' && isOpen && announcementMessage && announcementMessage.trim().length > 0 &&
            <MyAlert className={`${announcementType}`}>
                <div className="icon-container">
                    {announcementIcon ? (
                        <div dangerouslySetInnerHTML={{ __html: announcementIcon }} />
                    ) : (
                        announcementType === 'party'
                            ? <LuPartyPopper />
                            : announcementType === 'update'
                            ? <LuMegaphone />
                            : announcementType === 'info'
                            ? <LuInfo />
                            : announcementType === 'success'
                            ? <LuCircleCheck />
                            : announcementType === 'warning'
                            ? <LuCircleAlert />
                            : <LuTriangleAlert />
                    )}
                </div>

                <div style={{ flex: 1 }}>
                    {parser.toReact(announcementMessage)}
                </div>

                {isEnabled(announcementCloseable) &&
                <button className={'ml-auto p-2 hover:bg-white/20 duration-300 rounded-lg'} onClick={handleClose}>
                    <LuCircleX />
                </button>}
            </MyAlert>
            }
        </>
    );
};

export default Alert;
