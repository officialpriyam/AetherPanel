import { Action, action } from 'easy-peasy';
import { FlashMessageType } from '@/components/MessageBox';
import { httpErrorToHuman } from '@/api/http';

export interface FlashStore {
    items: FlashMessage[];
    addFlash: Action<FlashStore, FlashMessage>;
    addError: Action<FlashStore, { message: string; key?: string }>;
    clearAndAddHttpError: Action<FlashStore, { error?: Error | any | null; key?: string }>;
    clearFlashes: Action<FlashStore, string | void>;
    removeFlash: Action<FlashStore, string>;
}

export interface FlashMessage {
    id?: string;
    key?: string;
    type: FlashMessageType;
    title?: string;
    message: string;
}

const createFlashMessage = (message: FlashMessage): FlashMessage => ({
    ...message,
    id: message.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
});

const flashes: FlashStore = {
    items: [],

    addFlash: action((state, payload) => {
        state.items.push(createFlashMessage(payload));
    }),

    addError: action((state, payload) => {
        state.items.push(createFlashMessage({ type: 'error', title: 'Error', ...payload }));
    }),

    clearAndAddHttpError: action((state, payload) => {
        if (!payload.error) {
            state.items = payload.key ? state.items.filter((item) => item.key !== payload.key) : [];
        } else {
            console.error(payload.error);

            const nextError = createFlashMessage({
                type: 'error',
                title: 'Error',
                key: payload.key,
                message: httpErrorToHuman(payload.error),
            });

            state.items = payload.key
                ? state.items.filter((item) => item.key !== payload.key).concat(nextError)
                : [nextError];
        }
    }),

    clearFlashes: action((state, payload) => {
        state.items = payload ? state.items.filter((flash) => flash.key !== payload) : [];
    }),

    removeFlash: action((state, payload) => {
        state.items = state.items.filter((flash) => flash.id !== payload);
    }),
};

export default flashes;
