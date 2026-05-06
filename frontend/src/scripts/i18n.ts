import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import I18NextHttpBackend, { HttpBackendOptions } from 'i18next-http-backend';
import I18NextMultiloadBackendAdapter from 'i18next-multiload-backend-adapter';
import LanguageDetector from 'i18next-browser-languagedetector';
import { getFrontendAccessHeaders } from '@/lib/backendAccess';
import { buildRuntimeUrl } from '@/lib/runtimeUrls';

const hash = process.env.NEXT_PUBLIC_BUILD_HASH || 'dev';
const localeLoadPath = buildRuntimeUrl('/locales/locale.json?locale={{lng}}&namespace={{ns}}');
const fallbackNamespaces = [
    'activity',
    'admin/nests',
    'admin/node',
    'admin/server',
    'admin/user',
    'auth',
    'command/messages',
    'dashboard/account',
    'dashboard/index',
    'exceptions',
    'flash/account',
    'flash/activity',
    'flash/auth',
    'flash/dashboard',
    'flash/navigation',
    'flash/server/backups',
    'flash/server/console',
    'flash/server/dashboard',
    'flash/server/databases',
    'flash/server/files',
    'flash/server/network',
    'flash/server/schedules',
    'flash/server/settings',
    'flash/server/startup',
    'flash/server/users',
    'flash/utilities',
    'pagination',
    'passwords',
    'server/users',
    'strings',
    'validation',
];

const getTranslationNamespaces = async (): Promise<string[]> => {
    if (typeof window === 'undefined') {
        return fallbackNamespaces;
    }

    try {
        const response = await fetch(buildRuntimeUrl('/locales/namespaces.json?locale=en'), {
            credentials: 'include',
            headers: {
                Accept: 'application/json',
                ...getFrontendAccessHeaders(),
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to load locale manifest with status ${response.status}.`);
        }

        const payload = await response.json() as {
            data?: {
                namespaces?: string[];
            };
        };

        const namespaces = Array.isArray(payload.data?.namespaces)
            ? payload.data!.namespaces.filter((value): value is string => typeof value === 'string' && value.length > 0)
            : [];

        return namespaces.length > 0 ? namespaces : fallbackNamespaces;
    } catch (error) {
        console.warn('Falling back to bundled translation namespaces.', error);
        return fallbackNamespaces;
    }
};

i18n.use(I18NextMultiloadBackendAdapter)
    .use(initReactI18next)
    .use(LanguageDetector);

void i18n
    .init({
        detection: {
            order: ['localStorage'],
            caches: ['localStorage'],
        },
        debug: process.env.NEXT_PUBLIC_I18N_DEBUG === '1',
        load: 'languageOnly',
        cleanCode: true,
        fallbackLng: 'en',
        ns: fallbackNamespaces,
        defaultNS: 'flash/navigation',
        keySeparator: '.',
        backend: {
            backend: I18NextHttpBackend,
            backendOption: {
                loadPath: localeLoadPath,
                queryStringParams: { hash },
                allowMultiLoading: true,
                customHeaders: getFrontendAccessHeaders(),
                requestOptions: {
                    credentials: 'include',
                },
            } as HttpBackendOptions,
        } as Record<string, any>,
        interpolation: {
            // Per i18n-react documentation: this is not needed since React is already
            // handling escapes for us.
            escapeValue: false,
        },
    })
    .then(() => getTranslationNamespaces())
    .then((namespaces) => {
        const configuredNamespaces = Array.isArray(i18n.options.ns) ? i18n.options.ns : fallbackNamespaces;
        const missing = namespaces.filter((namespace) => !configuredNamespaces.includes(namespace));

        if (missing.length > 0) {
            i18n.loadNamespaces(missing).catch((error) => {
                console.warn('Failed to load discovered translation namespaces.', error);
            });
        }
    })
    .catch((error) => {
        console.error('Error initializing i18next:', error);
    });

export default i18n;
