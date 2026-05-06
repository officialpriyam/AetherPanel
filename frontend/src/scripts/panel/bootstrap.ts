import { store } from '@/state';
import { SiteSettings } from '@/state/settings';
import { getFlashColorSchemaValue } from './flashColorSchemas';

type PanelUser = {
    uuid: string;
    username: string;
    email: string;
    root_admin: boolean;
    use_totp: boolean;
    language: string;
    avatar_url?: string | null;
    updated_at: string;
    created_at: string;
};

type PanelWindow = Window & {
    SiteConfiguration?: SiteSettings;
    AetherPanelUser?: PanelUser;
    PterodactylUser?: PanelUser;
};

type FlashSettings = SiteSettings['flash'] & Record<string, unknown>;

const THEME_STYLE_ID = 'aether-panel-theme';

const value = (flash: FlashSettings, key: string, fallback: string): string => {
    const raw = flash[key];
    const normalized = raw === undefined || raw === null ? fallback : String(raw);

    return normalized.replace(/[;{}]/g, '').trim() || fallback;
};

const colorValue = (flash: FlashSettings, key: string, fallback: string): string => {
    const presetFallback = getFlashColorSchemaValue(flash.colorSchemaPreset, key as any) ?? fallback;
    const raw = flash[key];
    const normalized = raw === undefined || raw === null ? presetFallback : String(raw);

    return normalized.replace(/[;{}]/g, '').trim() || presetFallback;
};

const enabled = (input: unknown): boolean => input === true || String(input) === 'true';

const imageValue = (input: unknown): string => {
    const normalized = input === undefined || input === null ? '' : String(input).trim();

    if (normalized === '' || normalized === 'none') {
        return 'none';
    }

    return `url("${normalized.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}")`;
};

const fontValue = (flash: FlashSettings): string => value(flash, 'font', 'IBM Plex Sans').replace(/"/g, '');

const themeBlock = (flash: FlashSettings, mode: 'dark' | 'light') => {
    const prefix = mode === 'dark' ? '' : 'lightmode_';

    return `
        --image: ${imageValue(mode === 'dark' ? flash.backgroundImage : (flash.backgroundImageLight ?? flash.backgroundImage))};
        --image-blur: ${value(flash, 'backgroundBlur', '0px')};
        --primary: ${colorValue(flash, `${prefix}primary`, mode === 'dark' ? '#2563EB' : '#2563EB')};
        --successText: ${colorValue(flash, `${prefix}successText`, '#E1FFD8')};
        --successBorder: ${colorValue(flash, `${prefix}successBorder`, '#56AA2B')};
        --successBackground: ${colorValue(flash, `${prefix}successBackground`, '#3D8F1F')};
        --dangerText: ${colorValue(flash, `${prefix}dangerText`, '#FFD8D8')};
        --dangerBorder: ${colorValue(flash, `${prefix}dangerBorder`, '#AA2A2A')};
        --dangerBackground: ${colorValue(flash, `${prefix}dangerBackground`, '#8F1F20')};
        --warningText: ${colorValue(flash, `${prefix}warningText`, mode === 'dark' ? '#FFE8BE' : '#7A4A06')};
        --warningBorder: ${colorValue(flash, `${prefix}warningBorder`, mode === 'dark' ? '#D6A250' : '#D29A35')};
        --warningBackground: ${colorValue(flash, `${prefix}warningBackground`, mode === 'dark' ? '#5B4118' : '#FFF4DB')};
        --infoText: ${colorValue(flash, `${prefix}infoText`, mode === 'dark' ? '#D8F6FF' : '#0E5168')};
        --infoBorder: ${colorValue(flash, `${prefix}infoBorder`, mode === 'dark' ? '#4DBBDB' : '#45A8C6')};
        --infoBackground: ${colorValue(flash, `${prefix}infoBackground`, mode === 'dark' ? '#133E54' : '#DFF6FC')};
        --secondaryText: ${colorValue(flash, `${prefix}secondaryText`, mode === 'dark' ? '#E2E8F0' : '#334155')};
        --secondaryBorder: ${colorValue(flash, `${prefix}secondaryBorder`, mode === 'dark' ? '#475569' : '#CBD5E1')};
        --secondaryBackground: ${colorValue(flash, `${prefix}secondaryBackground`, mode === 'dark' ? '#1E293B' : '#E2E8F0')};
        --textPrimary: ${colorValue(flash, `${prefix}textPrimary`, mode === 'dark' ? '#F8FAFC' : '#102130')};
        --textMuted: ${colorValue(flash, `${prefix}textMuted`, mode === 'dark' ? '#94A3B8' : '#5D7B8D')};
        --surfaceBase: ${colorValue(flash, `${prefix}surfaceBase`, mode === 'dark' ? '#08111A' : '#F5FBFD')};
        --surfaceElevated: ${colorValue(flash, `${prefix}surfaceElevated`, mode === 'dark' ? '#0C1723' : '#FFFFFF')};
        --surfaceCard: ${colorValue(flash, `${prefix}surfaceCard`, mode === 'dark' ? '#122031' : '#F2F8FC')};
        --surfaceOverlay: ${colorValue(flash, `${prefix}surfaceOverlay`, mode === 'dark' ? '#0A1520' : '#E5F2F8')};
        --borderColor: ${colorValue(flash, `${prefix}borderColor`, mode === 'dark' ? '#22384C' : '#D4E4EE')};
        --borderStrong: ${colorValue(flash, `${prefix}borderStrong`, mode === 'dark' ? '#33536F' : '#B7CDD9')};
        --gray50: ${colorValue(flash, `${prefix}gray50`, mode === 'dark' ? '#F8FAFC' : '#0F172A')};
        --gray100: ${colorValue(flash, `${prefix}gray100`, mode === 'dark' ? '#E2E8F0' : '#1E293B')};
        --gray200: ${colorValue(flash, `${prefix}gray200`, mode === 'dark' ? '#CBD5E1' : '#334155')};
        --gray300: ${colorValue(flash, `${prefix}gray300`, mode === 'dark' ? '#94A3B8' : '#475569')};
        --gray400: ${colorValue(flash, `${prefix}gray400`, '#64748B')};
        --gray500: ${colorValue(flash, `${prefix}gray500`, mode === 'dark' ? '#475569' : '#94A3B8')};
        --gray600: ${colorValue(flash, `${prefix}gray600`, mode === 'dark' ? '#334155' : '#CBD5E1')};
        --gray700: ${colorValue(flash, `${prefix}gray700`, mode === 'dark' ? '#1E293B' : '#E2E8F0')};
        --gray800: ${colorValue(flash, `${prefix}gray800`, mode === 'dark' ? '#0F172A' : '#F1F5F9')};
        --gray900: ${colorValue(flash, `${prefix}gray900`, mode === 'dark' ? '#020617' : '#FFFFFF')};
        --gray700-default: ${colorValue(flash, `${prefix}surfaceOverlay`, mode === 'dark' ? '#0A1520' : '#E5F2F8')};
    `;
};

export const applySiteConfigurationTheme = (settings: SiteSettings): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const flash = settings.flash as FlashSettings;
    const defaultMode = value(flash, 'defaultMode', 'darkmode');
    const darkSelector = defaultMode === 'darkmode' ? ':root' : '.lightmode';
    const lightSelector = defaultMode === 'darkmode' ? '.lightmode' : ':root';
    const style = document.getElementById(THEME_STYLE_ID) ?? document.createElement('style');

    style.id = THEME_STYLE_ID;
    style.textContent = `
        :root {
            ${enabled(flash.borderInput) ? '--borderInput: 1px solid;' : '--borderInput: 0 solid transparent;'}
            --radiusBox: ${value(flash, 'radiusBox', '8px')};
            --radiusInput: ${value(flash, 'radiusInput', '7px')};
            --fontFamily: "${fontValue(flash)}";
            --primary-50: color-mix(in srgb, var(--primary) 10%, #ffffff);
            --primary-100: color-mix(in srgb, var(--primary) 18%, #ffffff);
            --primary-200: color-mix(in srgb, var(--primary) 26%, #ffffff);
            --primary-300: color-mix(in srgb, var(--primary) 36%, #ffffff);
            --primary-400: color-mix(in srgb, var(--primary) 52%, #ffffff);
            --primary-500: var(--primary);
            --primary-600: color-mix(in srgb, var(--primary) 82%, #000000);
            --primary-700: color-mix(in srgb, var(--primary) 68%, #000000);
            --primary-800: color-mix(in srgb, var(--primary) 56%, #000000);
            --primary-900: color-mix(in srgb, var(--primary) 42%, #000000);
            --primary-950: color-mix(in srgb, var(--primary) 28%, #000000);
        }

        ${darkSelector} {
            ${themeBlock(flash, 'dark')}
        }

        ${lightSelector} {
            ${themeBlock(flash, 'light')}
        }

        ${enabled(flash.backdrop)
            ? '.backdrop{border:1px solid color-mix(in srgb,var(--borderColor) 65%, transparent)!important;backdrop-filter:blur(16px);background-color:color-mix(in srgb,var(--surfaceOverlay) ' + value(flash, 'backdropPercentage', '80%') + ', transparent)!important;box-shadow:0 18px 35px rgb(0 0 0 / 22%);}'
            : ''}

        body.flash-bg {
            min-height: 100vh;
            background-color: var(--surfaceBase, #020617) !important;
            background-image: var(--image);
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-attachment: fixed;
        }
    `;

    if (!style.parentElement) {
        document.head.appendChild(style);
    }

    document.body.classList.add('flash-bg');
    applyBranding(flash);
};

const setHeadLink = (id: string, rel: string, href: string) => {
    let link = document.getElementById(id) as HTMLLinkElement | null;

    if (!link) {
        link = document.createElement('link');
        link.id = id;
        link.rel = rel;
        document.head.appendChild(link);
    }

    link.href = href;
};

const setHeadMeta = (name: string, content: string) => {
    let meta = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;

    if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
    }

    meta.content = content;
};

const applyBranding = (flash: FlashSettings): void => {
    const logoHref = value(flash, 'logo', '/branding/aether-mark.png');
    const faviconHref = value(flash, 'meta_favicon', logoHref);
    const themeColor = value(flash, 'meta_color', '#08111A');

    setHeadLink('aetherpanel-favicon', 'icon', faviconHref);
    setHeadLink('aetherpanel-apple-icon', 'apple-touch-icon', faviconHref);
    setHeadLink('aetherpanel-shortcut-icon', 'shortcut icon', faviconHref);
    setHeadMeta('theme-color', themeColor);
};

export const applyPanelBootstrap = () => {
    const panelWindow = typeof window === 'undefined' ? undefined : (window as PanelWindow);
    const panelUser = panelWindow?.AetherPanelUser ?? panelWindow?.PterodactylUser;
    const siteConfiguration = panelWindow?.SiteConfiguration;

    if (panelUser && !store.getState().user.data) {
        store.getActions().user.setUserData({
            uuid: panelUser.uuid,
            username: panelUser.username,
            email: panelUser.email,
            language: panelUser.language,
            rootAdmin: panelUser.root_admin,
            useTotp: panelUser.use_totp,
            avatarUrl: panelUser.avatar_url ?? null,
            createdAt: new Date(panelUser.created_at),
            updatedAt: new Date(panelUser.updated_at),
        });
    }

    if (siteConfiguration && !store.getState().settings.data) {
        store.getActions().settings.setSettings(siteConfiguration);
    }

    if (siteConfiguration) {
        applySiteConfigurationTheme(siteConfiguration);
    }
};
