import { IconType } from 'react-icons';
import {
    LuBoxes,
    LuCog,
    LuDatabase,
    LuFolder,
    LuGlobe,
    LuHouse,
    LuKeyRound,
    LuLayoutGrid,
    LuMapPinned,
    LuServer,
    LuShield,
    LuSparkles,
    LuTicket,
    LuUsers,
    LuWand,
} from 'react-icons/lu';
import { FLASH_COLOR_SCHEMA_OPTIONS } from '@/panel/flashColorSchemas';

export type AdminSectionId =
    | 'overview'
    | 'settings'
    | 'flash'
    | 'api'
    | 'tickets'
    | 'databases'
    | 'locations'
    | 'nodes'
    | 'servers'
    | 'users'
    | 'mounts'
    | 'nests';

export interface AdminNavItem {
    id: AdminSectionId;
    label: string;
    href: string;
    icon: IconType;
    group: 'core' | 'management' | 'service';
}

export interface FormFieldOption {
    label: string;
    value: string | number | boolean;
}

export interface FormField {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'url' | 'number' | 'boolean' | 'select' | 'color' | 'password' | 'list';
    description?: string;
    placeholder?: string;
    rows?: number;
    options?: FormFieldOption[];
    getOptions?: (refs: Record<string, any>, values?: Record<string, string>) => FormFieldOption[];
    emptyOptionLabel?: string;
    inputWidth?: 'default' | 'compact';
}

export interface FormFieldGroup {
    id: string;
    page: string;
    title: string;
    description: string;
    fields: FormField[];
}

export interface AdminSubPage {
    id: string;
    label: string;
    description: string;
}

export const ADMIN_BRAND_NAME = 'AetherPanel';

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
    { id: 'overview', label: 'Overview', href: '/admin', icon: LuHouse, group: 'core' },
    { id: 'settings', label: 'Settings', href: '/admin/settings', icon: LuCog, group: 'core' },
    { id: 'flash', label: 'Flash Theme', href: '/admin/flash', icon: LuWand, group: 'core' },
    { id: 'api', label: 'Application API', href: '/admin/api', icon: LuKeyRound, group: 'core' },
    { id: 'tickets', label: 'Tickets', href: '/admin/tickets', icon: LuTicket, group: 'management' },
    { id: 'databases', label: 'Database Hosts', href: '/admin/databases', icon: LuDatabase, group: 'management' },
    { id: 'locations', label: 'Locations', href: '/admin/locations', icon: LuGlobe, group: 'management' },
    { id: 'nodes', label: 'Nodes', href: '/admin/nodes', icon: LuMapPinned, group: 'management' },
    { id: 'servers', label: 'Servers', href: '/admin/servers', icon: LuServer, group: 'management' },
    { id: 'users', label: 'Users', href: '/admin/users', icon: LuUsers, group: 'management' },
    { id: 'mounts', label: 'Mounts', href: '/admin/mounts', icon: LuFolder, group: 'service' },
    { id: 'nests', label: 'Cores', href: '/admin/nests', icon: LuLayoutGrid, group: 'service' },
];

export const SETTINGS_PAGES: AdminSubPage[] = [
    { id: 'index', label: 'Basic', description: 'Core panel identity, URLs, locale, and runtime behavior.' },
    { id: 'advanced', label: 'Advanced', description: 'Cookies, stateful domains, CORS, and captcha security controls.' },
    { id: 'mail', label: 'Mail', description: 'SMTP transport values used by the backend notification system.' },
    { id: 'subdomain', label: 'Subdomain', description: 'Cross-origin and frontend connection settings used by the split panel.' },
    { id: 'priyxstudioai', label: 'AI', description: 'External AI helper endpoints and tokens used by Flash extensions.' },
];

export const FLASH_PAGES: AdminSubPage[] = [
    { id: 'index', label: 'General', description: 'Panel logo, typography, defaults, and global branding.' },
    { id: 'announcement', label: 'Announcements', description: 'Top-level messaging and announcement presentation controls.' },
    { id: 'styling', label: 'Styling', description: 'Backgrounds, radius, effects, and visual atmosphere options.' },
    { id: 'layout', label: 'Layouts', description: 'Dashboard, server, and login layout patterns mirrored from Flash.' },
    { id: 'components', label: 'Components', description: 'Stat cards, dashboard slots, and modular UI component toggles.' },
    { id: 'colors', label: 'Colors', description: 'Dark and light theme palettes used across the Flash interface.' },
    { id: 'advanced', label: 'Advanced', description: 'Accessibility, search, profile, and extra Flash behaviors.' },
    { id: 'social', label: 'Socials', description: 'Community links, support endpoints, and secondary link buttons.' },
    { id: 'eggs', label: 'Shells', description: 'Per-addon shell targeting used by Flash add-on integrations.' },
    { id: 'addons', label: 'Addons', description: 'Enable or disable Flash add-on features from the admin UI.' },
    { id: 'meta', label: 'Meta', description: 'OpenGraph, favicon, and page metadata shown outside the panel.' },
    { id: 'mail', label: 'Mail', description: 'Email branding and social links for outgoing notifications.' },
];

const booleanField = (key: string, label: string, description: string): FormField => ({
    key,
    label,
    type: 'boolean',
    description,
});

export const RUNTIME_FIELD_GROUPS: FormFieldGroup[] = [
    {
        id: 'runtime-brand',
        page: 'index',
        title: 'Brand & Identity',
        description: 'Matches the old Blade basic settings page, but writes into backend config.php overrides.',
        fields: [
            { key: 'APP_NAME', label: 'Panel Name', type: 'text', description: 'Shown throughout the panel and in email copy.' },
            { key: 'APP_ENV', label: 'Environment', type: 'select', description: 'Backend application environment mode.', options: [
                { label: 'production', value: 'production' },
                { label: 'local', value: 'local' },
                { label: 'testing', value: 'testing' },
            ] },
            booleanField('APP_DEBUG', 'Debug Mode', 'Controls backend exception verbosity and debugging behavior.'),
            { key: 'APP_TIMEZONE', label: 'Timezone', type: 'text', description: 'Default backend timezone.' },
            { key: 'APP_LOCALE', label: 'Primary Locale', type: 'text', description: 'Default frontend and email locale.' },
            { key: 'APP_FALLBACK_LOCALE', label: 'Fallback Locale', type: 'text', description: 'Used when translations are missing.' },
            { key: 'APP_SERVICE_AUTHOR', label: 'Service Author', type: 'text', description: 'Default service author string for generated content.' },
        ],
    },
    {
        id: 'runtime-urls',
        page: 'index',
        title: 'URLs',
        description: 'Explicitly separates the frontend origin from the API origin for the monorepo split.',
        fields: [
            { key: 'APP_URL', label: 'API URL', type: 'url', description: 'Public backend origin used by the frontend.' },
            { key: 'PANEL_FRONTEND_URL', label: 'Frontend URL', type: 'url', description: 'Public frontend origin used for redirects and links.' },
            { key: 'SESSION_COOKIE', label: 'Session Cookie Name', type: 'text', description: 'Cookie key shared by the API-authenticated frontend.' },
        ],
    },
    {
        id: 'runtime-security',
        page: 'advanced',
        title: 'Security & Sessions',
        description: 'Cross-origin session and security flags that replace the old environment variables.',
        fields: [
            { key: 'SESSION_DOMAIN', label: 'Session Domain', type: 'text', description: 'Cookie domain for cross-subdomain authentication.' },
            { key: 'SESSION_SAME_SITE', label: 'SameSite Policy', type: 'select', description: 'Cookie SameSite mode for the split frontend/API deployment.', options: [
                { label: 'none', value: 'none' },
                { label: 'lax', value: 'lax' },
                { label: 'strict', value: 'strict' },
            ] },
            booleanField('SESSION_SECURE_COOKIE', 'Secure Cookies', 'Require HTTPS for session cookies.'),
            { key: 'SANCTUM_STATEFUL_DOMAINS', label: 'Stateful Domains', type: 'list', description: 'One domain per line for Sanctum stateful SPA auth.' },
            { key: 'APP_CORS_ALLOWED_ORIGINS', label: 'CORS Allowed Origins', type: 'list', description: 'One origin per line allowed to call the backend with credentials.' },
        ],
    },
    {
        id: 'runtime-recaptcha',
        page: 'advanced',
        title: 'reCAPTCHA',
        description: 'Login and password reset captcha configuration.',
        fields: [
            booleanField('RECAPTCHA_ENABLED', 'Enable reCAPTCHA', 'Turns captcha checks on for auth endpoints.'),
            { key: 'RECAPTCHA_WEBSITE_KEY', label: 'Site Key', type: 'text', description: 'Public browser key used by the frontend.' },
            { key: 'RECAPTCHA_SECRET_KEY', label: 'Secret Key', type: 'password', description: 'Private backend secret used for verification.' },
        ],
    },
    {
        id: 'runtime-mail',
        page: 'mail',
        title: 'Mail Transport',
        description: 'Equivalent to the old mail settings form, stored in backend config overrides.',
        fields: [
            { key: 'MAIL_MAILER', label: 'Mailer', type: 'text', description: 'Laravel mail transport driver.' },
            { key: 'MAIL_HOST', label: 'Host', type: 'text', description: 'SMTP hostname.' },
            { key: 'MAIL_PORT', label: 'Port', type: 'number', description: 'SMTP port.' },
            { key: 'MAIL_USERNAME', label: 'Username', type: 'text', description: 'SMTP account username.' },
            { key: 'MAIL_PASSWORD', label: 'Password', type: 'password', description: 'SMTP account password.' },
            { key: 'MAIL_ENCRYPTION', label: 'Encryption', type: 'select', description: 'SMTP encryption mode.', options: [
                { label: 'tls', value: 'tls' },
                { label: 'ssl', value: 'ssl' },
                { label: 'none', value: '' },
            ] },
            { key: 'MAIL_FROM_ADDRESS', label: 'From Address', type: 'text', description: 'Default sender email.' },
            { key: 'MAIL_FROM_NAME', label: 'From Name', type: 'text', description: 'Default sender display name.' },
        ],
    },
    {
        id: 'runtime-subdomain',
        page: 'subdomain',
        title: 'Frontend Split',
        description: 'Frontend/API connection settings that used to be spread across .env values and old admin pages.',
        fields: [
            { key: 'PANEL_FRONTEND_URL', label: 'Panel URL', type: 'url', description: 'The standalone frontend origin.' },
            { key: 'APP_URL', label: 'API Origin', type: 'url', description: 'The API-only backend origin.' },
            { key: 'SESSION_DOMAIN', label: 'Shared Cookie Domain', type: 'text', description: 'Parent domain for frontend and API cookies.' },
            { key: 'SANCTUM_STATEFUL_DOMAINS', label: 'Sanctum Domains', type: 'list', description: 'Domains treated as first-party SPAs.' },
        ],
    },
    {
        id: 'runtime-ai',
        page: 'priyxstudioai',
        title: 'AI Services',
        description: 'Values referenced by Flash-linked AI integrations and helper tools.',
        fields: [
            { key: 'MCVAPI_URL', label: 'Minecraft Version API URL', type: 'url', description: 'Upstream endpoint for version changer data.' },
            { key: 'MCVAPI_KEY', label: 'Minecraft Version API Key', type: 'password', description: 'Optional private token for the version API.' },
            { key: 'FLASH_THEME_NAME', label: 'Flash Theme Name', type: 'text', description: 'Theme label shown in overview cards.' },
            { key: 'FLASH_THEME_VERSION', label: 'Flash Theme Version', type: 'text', description: 'Current installed Flash theme version.' },
            { key: 'FLASH_THEME_REPOSITORY', label: 'Flash Repository', type: 'url', description: 'Source repository used by the update checker.' },
        ],
    },
];

export const FLASH_FIELD_GROUPS: FormFieldGroup[] = [
    {
        id: 'flash-general',
        page: 'index',
        title: 'General Settings',
        description: 'Primary Flash branding fields copied from the legacy Blade editor.',
        fields: [
            { key: 'logo', label: 'Panel Logo URL', type: 'url', description: 'Primary logo shown in the admin and client UI.' },
            { key: 'logoHeight', label: 'Logo Height', type: 'text', description: 'CSS height for the logo image.' },
            booleanField('fullLogo', 'Logo Only', 'Toggle whether only the logo image is shown without extra text.'),
            { key: 'font', label: 'Font Family', type: 'text', description: 'Primary interface font family.' },
            { key: 'defaultMode', label: 'Default Mode', type: 'select', description: 'The default Flash color mode.', options: [
                { label: 'darkmode', value: 'darkmode' },
                { label: 'lightmode', value: 'lightmode' },
            ] },
            booleanField('pageTitle', 'Page Title', 'Show Flash page title helpers across client pages.'),
            { key: 'copyright', label: 'Footer Credit', type: 'text', description: 'Small copyright or branding note.' },
            { key: 'knowledge_base_url', label: 'Knowledge Base URL', type: 'url', description: 'External help center link used by Flash.' },
        ],
    },
    {
        id: 'flash-announcement',
        page: 'announcement',
        title: 'Announcements',
        description: 'Announcement styling and messaging controls.',
        fields: [
            { key: 'announcementType', label: 'Announcement Style', type: 'select', description: 'Visual tone for the announcement component.', options: [
                { label: 'party', value: 'party' },
                { label: 'info', value: 'info' },
                { label: 'warning', value: 'warning' },
                { label: 'success', value: 'success' },
            ] },
            booleanField('announcementCloseable', 'Closeable', 'Allow users to dismiss the announcement.'),
            { key: 'announcementMessage', label: 'Message', type: 'textarea', description: 'Public announcement body text.', rows: 4 },
        ],
    },
    {
        id: 'flash-styling',
        page: 'styling',
        title: 'Styling',
        description: 'Background, radius, effects, and message presentation controls.',
        fields: [
            { key: 'backgroundImage', label: 'Background Image', type: 'url', description: 'Primary dashboard background image URL.' },
            { key: 'backgroundBlur', label: 'Background Blur', type: 'text', description: 'CSS blur amount applied to the background.' },
            booleanField('backdrop', 'Backdrop Overlay', 'Enable a dark backdrop over the background image.'),
            { key: 'backdropPercentage', label: 'Backdrop Strength', type: 'text', description: 'Opacity percentage used by the backdrop overlay.' },
            { key: 'loginBackground', label: 'Login Background', type: 'url', description: 'Background image used on auth pages.' },
            booleanField('loginGradient', 'Login Gradient', 'Overlay a gradient on the login screen.'),
            booleanField('effects_snow', 'Snow Effect', 'Enable animated snow particles.'),
            booleanField('effects_autumn', 'Autumn Effect', 'Enable autumn leaf particles.'),
            booleanField('effects_stars', 'Star Effect', 'Enable floating star particles.'),
            { key: 'radiusInput', label: 'Input Radius', type: 'text', description: 'Border radius used for form controls.' },
            booleanField('borderInput', 'Input Borders', 'Enable border lines on inputs.'),
            { key: 'radiusBox', label: 'Card Radius', type: 'text', description: 'Border radius used for cards and boxes.' },
            { key: 'flashMessage', label: 'Flash Message Style', type: 'number', description: 'Variation index used by Flash message styling.' },
        ],
    },
    {
        id: 'flash-layout',
        page: 'layout',
        title: 'Layouts',
        description: 'Layout toggles matching the old Flash editor sections.',
        fields: [
            { key: 'dashboardLayout', label: 'Dashboard Layout', type: 'select', description: 'Navigation style used on the dashboard.', options: [
                { label: 'Sidebar', value: '1' },
                { label: 'Icons', value: '2' },
            ] },
            { key: 'layout', label: 'Server Layout', type: 'select', description: 'Layout style used on server pages.', options: [
                { label: 'Sidebar', value: '1' },
                { label: 'Icons', value: '4' },
                { label: 'Floating Top', value: '5' },
                { label: 'Floating Bottom', value: '6' },
            ] },
            { key: 'serverLayout', label: 'Server Dashboard Layout', type: 'number', description: 'Flash server dashboard layout variant.' },
            { key: 'searchComponent', label: 'Search Component', type: 'select', description: 'Choose the dashboard search style.', options: [
                { label: 'Server select bar', value: '1' },
                { label: 'Search bar', value: '2' },
            ] },
            { key: 'loginLayout', label: 'Login Layout', type: 'number', description: 'Login screen layout variant.' },
            { key: 'logoPosition', label: 'Logo Position', type: 'select', description: 'Position of the logo on login screens.', options: [
                { label: 'Above form', value: '1' },
                { label: 'Top corner', value: '2' },
            ] },
            { key: 'socialPosition', label: 'Social Button Position', type: 'select', description: 'Placement of social buttons on login screens.', options: [
                { label: 'Above form', value: '1' },
                { label: 'Under form', value: '2' },
            ] },
        ],
    },
    {
        id: 'flash-components',
        page: 'components',
        title: 'Components',
        description: 'Dashboard modules and content slot configuration.',
        fields: [
            { key: 'serverRow', label: 'Servers Per Row', type: 'number', description: 'How many server cards appear per dashboard row.' },
            { key: 'statsCards', label: 'Stats Card Count', type: 'number', description: 'Number of stat cards shown on the dashboard.' },
            { key: 'graphs', label: 'Graph Count', type: 'number', description: 'Number of graph widgets shown on the dashboard.' },
            booleanField('discordBox', 'Discord Box', 'Show the Discord box widget.'),
            booleanField('socialButtons', 'Social Buttons', 'Show extra social action buttons.'),
            { key: 'slot1', label: 'Slot 1', type: 'text', description: 'Content slot mapping for dashboard module 1.' },
            { key: 'slot2', label: 'Slot 2', type: 'text', description: 'Content slot mapping for dashboard module 2.' },
            { key: 'slot3', label: 'Slot 3', type: 'text', description: 'Content slot mapping for dashboard module 3.' },
            { key: 'slot4', label: 'Slot 4', type: 'text', description: 'Content slot mapping for dashboard module 4.' },
            { key: 'slot5', label: 'Slot 5', type: 'text', description: 'Content slot mapping for dashboard module 5.' },
            { key: 'slot6', label: 'Slot 6', type: 'text', description: 'Content slot mapping for dashboard module 6.' },
            { key: 'slot7', label: 'Slot 7', type: 'text', description: 'Content slot mapping for dashboard module 7.' },
        ],
    },
    {
        id: 'flash-colors-schema',
        page: 'colors',
        title: 'Schema Presets',
        description: 'Apply a balanced full-site palette, then fine-tune the individual tokens below.',
        fields: [
            { key: 'colorSchemaPreset', label: 'Preset', type: 'select', description: 'Applies a complete dark and light palette across the site.', options: FLASH_COLOR_SCHEMA_OPTIONS },
        ],
    },
    {
        id: 'flash-colors-dark',
        page: 'colors',
        title: 'Dark Palette',
        description: 'Dark mode colors used throughout Flash.',
        fields: [
            { key: 'primary', label: 'Primary', type: 'color', description: 'Primary accent color.' },
            { key: 'successText', label: 'Success Text', type: 'color', description: 'Success text color.' },
            { key: 'successBorder', label: 'Success Border', type: 'color', description: 'Success border color.' },
            { key: 'successBackground', label: 'Success Background', type: 'color', description: 'Success background color.' },
            { key: 'dangerText', label: 'Danger Text', type: 'color', description: 'Danger text color.' },
            { key: 'dangerBorder', label: 'Danger Border', type: 'color', description: 'Danger border color.' },
            { key: 'dangerBackground', label: 'Danger Background', type: 'color', description: 'Danger background color.' },
            { key: 'warningText', label: 'Warning Text', type: 'color', description: 'Warning text color.' },
            { key: 'warningBorder', label: 'Warning Border', type: 'color', description: 'Warning border color.' },
            { key: 'warningBackground', label: 'Warning Background', type: 'color', description: 'Warning background color.' },
            { key: 'infoText', label: 'Info Text', type: 'color', description: 'Info text color.' },
            { key: 'infoBorder', label: 'Info Border', type: 'color', description: 'Info border color.' },
            { key: 'infoBackground', label: 'Info Background', type: 'color', description: 'Info background color.' },
            { key: 'secondaryText', label: 'Secondary Text', type: 'color', description: 'Secondary text color.' },
            { key: 'secondaryBorder', label: 'Secondary Border', type: 'color', description: 'Secondary border color.' },
            { key: 'secondaryBackground', label: 'Secondary Background', type: 'color', description: 'Secondary background color.' },
            { key: 'textPrimary', label: 'Text Primary', type: 'color', description: 'Base text color for the site shell.' },
            { key: 'textMuted', label: 'Text Muted', type: 'color', description: 'Muted text color for helper content.' },
            { key: 'surfaceBase', label: 'Surface Base', type: 'color', description: 'Base page background tone.' },
            { key: 'surfaceElevated', label: 'Surface Elevated', type: 'color', description: 'Raised panel and modal background tone.' },
            { key: 'surfaceCard', label: 'Surface Card', type: 'color', description: 'Standard card background tone.' },
            { key: 'surfaceOverlay', label: 'Surface Overlay', type: 'color', description: 'Backdrop and overlay surface tone.' },
            { key: 'borderColor', label: 'Border Color', type: 'color', description: 'Default border color used across the site.' },
            { key: 'borderStrong', label: 'Border Strong', type: 'color', description: 'Stronger border tone for emphasized separators.' },
            { key: 'gray50', label: 'Gray 50', type: 'color', description: 'Dark palette gray 50.' },
            { key: 'gray100', label: 'Gray 100', type: 'color', description: 'Dark palette gray 100.' },
            { key: 'gray200', label: 'Gray 200', type: 'color', description: 'Dark palette gray 200.' },
            { key: 'gray300', label: 'Gray 300', type: 'color', description: 'Dark palette gray 300.' },
            { key: 'gray400', label: 'Gray 400', type: 'color', description: 'Dark palette gray 400.' },
            { key: 'gray500', label: 'Gray 500', type: 'color', description: 'Dark palette gray 500.' },
            { key: 'gray600', label: 'Gray 600', type: 'color', description: 'Dark palette gray 600.' },
            { key: 'gray700', label: 'Gray 700', type: 'color', description: 'Dark palette gray 700.' },
            { key: 'gray800', label: 'Gray 800', type: 'color', description: 'Dark palette gray 800.' },
            { key: 'gray900', label: 'Gray 900', type: 'color', description: 'Dark palette gray 900.' },
        ],
    },
    {
        id: 'flash-colors-light',
        page: 'colors',
        title: 'Light Palette',
        description: 'Light mode colors used by Flash.',
        fields: [
            { key: 'lightmode_primary', label: 'Primary', type: 'color', description: 'Light mode primary accent.' },
            { key: 'lightmode_successText', label: 'Success Text', type: 'color', description: 'Light mode success text color.' },
            { key: 'lightmode_successBorder', label: 'Success Border', type: 'color', description: 'Light mode success border color.' },
            { key: 'lightmode_successBackground', label: 'Success Background', type: 'color', description: 'Light mode success background color.' },
            { key: 'lightmode_dangerText', label: 'Danger Text', type: 'color', description: 'Light mode danger text color.' },
            { key: 'lightmode_dangerBorder', label: 'Danger Border', type: 'color', description: 'Light mode danger border color.' },
            { key: 'lightmode_dangerBackground', label: 'Danger Background', type: 'color', description: 'Light mode danger background color.' },
            { key: 'lightmode_warningText', label: 'Warning Text', type: 'color', description: 'Light mode warning text color.' },
            { key: 'lightmode_warningBorder', label: 'Warning Border', type: 'color', description: 'Light mode warning border color.' },
            { key: 'lightmode_warningBackground', label: 'Warning Background', type: 'color', description: 'Light mode warning background color.' },
            { key: 'lightmode_infoText', label: 'Info Text', type: 'color', description: 'Light mode info text color.' },
            { key: 'lightmode_infoBorder', label: 'Info Border', type: 'color', description: 'Light mode info border color.' },
            { key: 'lightmode_infoBackground', label: 'Info Background', type: 'color', description: 'Light mode info background color.' },
            { key: 'lightmode_secondaryText', label: 'Secondary Text', type: 'color', description: 'Light mode secondary text color.' },
            { key: 'lightmode_secondaryBorder', label: 'Secondary Border', type: 'color', description: 'Light mode secondary border color.' },
            { key: 'lightmode_secondaryBackground', label: 'Secondary Background', type: 'color', description: 'Light mode secondary background color.' },
            { key: 'lightmode_textPrimary', label: 'Text Primary', type: 'color', description: 'Light mode base text color.' },
            { key: 'lightmode_textMuted', label: 'Text Muted', type: 'color', description: 'Light mode helper and muted text color.' },
            { key: 'lightmode_surfaceBase', label: 'Surface Base', type: 'color', description: 'Light mode page background tone.' },
            { key: 'lightmode_surfaceElevated', label: 'Surface Elevated', type: 'color', description: 'Light mode raised surface tone.' },
            { key: 'lightmode_surfaceCard', label: 'Surface Card', type: 'color', description: 'Light mode card surface tone.' },
            { key: 'lightmode_surfaceOverlay', label: 'Surface Overlay', type: 'color', description: 'Light mode overlay and backdrop tone.' },
            { key: 'lightmode_borderColor', label: 'Border Color', type: 'color', description: 'Light mode default border color.' },
            { key: 'lightmode_borderStrong', label: 'Border Strong', type: 'color', description: 'Light mode stronger border tone.' },
            { key: 'lightmode_gray50', label: 'Gray 50', type: 'color', description: 'Light palette gray 50.' },
            { key: 'lightmode_gray100', label: 'Gray 100', type: 'color', description: 'Light palette gray 100.' },
            { key: 'lightmode_gray200', label: 'Gray 200', type: 'color', description: 'Light palette gray 200.' },
            { key: 'lightmode_gray300', label: 'Gray 300', type: 'color', description: 'Light palette gray 300.' },
            { key: 'lightmode_gray400', label: 'Gray 400', type: 'color', description: 'Light palette gray 400.' },
            { key: 'lightmode_gray500', label: 'Gray 500', type: 'color', description: 'Light palette gray 500.' },
            { key: 'lightmode_gray600', label: 'Gray 600', type: 'color', description: 'Light palette gray 600.' },
            { key: 'lightmode_gray700', label: 'Gray 700', type: 'color', description: 'Light palette gray 700.' },
            { key: 'lightmode_gray800', label: 'Gray 800', type: 'color', description: 'Light palette gray 800.' },
            { key: 'lightmode_gray900', label: 'Gray 900', type: 'color', description: 'Light palette gray 900.' },
        ],
    },
    {
        id: 'flash-advanced',
        page: 'advanced',
        title: 'Advanced Behavior',
        description: 'Extra UI toggles and advanced Flash behaviors.',
        fields: [
            { key: 'profileType', label: 'Profile Type', type: 'select', description: 'Avatar provider used by Flash.', options: [
                { label: 'gravatar', value: 'gravatar' },
                { label: 'initials', value: 'initials' },
            ] },
            booleanField('modeToggler', 'Mode Toggler', 'Show the dark/light mode toggle.'),
            booleanField('langSwitch', 'Language Switch', 'Show the language switcher.'),
            booleanField('ipFlag', 'IP Flag', 'Show geographic flag markers for IP-based displays.'),
            booleanField('lowResourcesAlert', 'Low Resource Alert', 'Warn users when servers are nearing limits.'),
            { key: 'searchComponent', label: 'Search Component Variant', type: 'number', description: 'Alternative search component index.' },
        ],
    },
    {
        id: 'flash-socials',
        page: 'social',
        title: 'Social & Support Links',
        description: 'Main external links shown in Flash social areas.',
        fields: [
            { key: 'discord', label: 'Discord ID', type: 'text', description: 'Discord widget or guild identifier.' },
            { key: 'support', label: 'Support URL', type: 'url', description: 'Support destination link.' },
            { key: 'status', label: 'Status URL', type: 'url', description: 'Service status page URL.' },
            { key: 'billing', label: 'Billing URL', type: 'url', description: 'Billing or store URL.' },
            { key: 'social_discord', label: 'Discord Link', type: 'url', description: 'Social Discord button URL.' },
            { key: 'social_billing', label: 'Billing Link', type: 'url', description: 'Social billing button URL.' },
            { key: 'social_status', label: 'Status Link', type: 'url', description: 'Social status button URL.' },
            { key: 'social_custom', label: 'Custom Link', type: 'url', description: 'Extra custom social URL.' },
            { key: 'social_custom_icon', label: 'Custom Icon', type: 'text', description: 'Icon name for the custom link.' },
        ],
    },
    {
        id: 'flash-eggs',
        page: 'eggs',
        title: 'Shell Targeting',
        description: 'Comma-separated egg sets used by each Flash add-on.',
        fields: [
            { key: 'addon_plugin_installer_eggs', label: 'Plugin Installer Shells', type: 'textarea', description: 'Shell IDs used by the plugin installer.', rows: 3 },
            { key: 'addon_mod_installer_eggs', label: 'Mod Installer Shells', type: 'textarea', description: 'Shell IDs used by the mod installer.', rows: 3 },
            { key: 'addon_modpack_installer_eggs', label: 'Modpack Installer Shells', type: 'textarea', description: 'Shell IDs used by the modpack installer.', rows: 3 },
            { key: 'addon_subdomain_eggs', label: 'Subdomain Shells', type: 'textarea', description: 'Shell IDs that expose subdomain controls.', rows: 3 },
            { key: 'addon_split_eggs', label: 'Split Shells', type: 'textarea', description: 'Shell IDs that support split controls.', rows: 3 },
            { key: 'addon_version_changer_eggs', label: 'Version Changer Shells', type: 'textarea', description: 'Shell IDs allowed to use the version changer.', rows: 3 },
        ],
    },
    {
        id: 'flash-addons',
        page: 'addons',
        title: 'Addons',
        description: 'Master toggles for Flash add-ons.',
        fields: [
            booleanField('addon_plugin_installer_enabled', 'Plugin Installer', 'Enable the plugin installer add-on.'),
            booleanField('addon_mod_installer_enabled', 'Mod Installer', 'Enable the mod installer add-on.'),
            booleanField('addon_modpack_installer_enabled', 'Modpack Installer', 'Enable the modpack installer add-on.'),
            booleanField('addon_subdomain_enabled', 'Subdomain', 'Enable the subdomain add-on.'),
            booleanField('addon_split_enabled', 'Split', 'Enable the split add-on.'),
            booleanField('addon_pterogpt_enabled', 'AI Assistant', 'Enable the Flash AI assistant add-on.'),
            booleanField('addon_version_changer_enabled', 'Version Changer', 'Enable the version changer add-on.'),
            booleanField('addon_ticket_system_enabled', 'Ticket System', 'Enable the ticket system add-on.'),
        ],
    },
    {
        id: 'flash-meta',
        page: 'meta',
        title: 'Meta Tags',
        description: 'Metadata used for embeds, tabs, and external link previews.',
        fields: [
            { key: 'meta_title', label: 'Meta Title', type: 'text', description: 'Default page title for embeds and previews.' },
            { key: 'meta_description', label: 'Meta Description', type: 'textarea', description: 'Default OpenGraph description.', rows: 4 },
            { key: 'meta_image', label: 'Meta Image', type: 'url', description: 'OpenGraph preview image URL.' },
            { key: 'meta_favicon', label: 'Favicon', type: 'url', description: 'Favicon path or URL.' },
            { key: 'meta_color', label: 'Theme Color', type: 'color', description: 'Browser theme color.' },
        ],
    },
    {
        id: 'flash-mail',
        page: 'mail',
        title: 'Mail Branding',
        description: 'Outgoing email theme settings.',
        fields: [
            { key: 'mail_mode', label: 'Mail Mode', type: 'select', description: 'Email template color mode.', options: [
                { label: 'light', value: 'light' },
                { label: 'dark', value: 'dark' },
            ] },
            { key: 'mail_logo', label: 'Mail Logo', type: 'url', description: 'Logo used in email templates.' },
            booleanField('mail_logoFull', 'Logo Only', 'Use the full logo layout in email templates.'),
            { key: 'mail_color', label: 'Mail Accent', type: 'color', description: 'Primary email accent color.' },
            { key: 'mail_backgroundColor', label: 'Mail Background', type: 'color', description: 'Email background color.' },
            { key: 'mail_support', label: 'Mail Support Link', type: 'url', description: 'Support URL shown in emails.' },
            { key: 'mail_status', label: 'Mail Status Link', type: 'url', description: 'Status page URL shown in emails.' },
            { key: 'mail_billing', label: 'Mail Billing Link', type: 'url', description: 'Billing URL shown in emails.' },
            { key: 'mail_discord', label: 'Mail Discord', type: 'url', description: 'Discord link used in emails.' },
            { key: 'mail_twitter', label: 'Mail Twitter', type: 'url', description: 'Twitter/X link used in emails.' },
            { key: 'mail_facebook', label: 'Mail Facebook', type: 'url', description: 'Facebook link used in emails.' },
            { key: 'mail_instagram', label: 'Mail Instagram', type: 'url', description: 'Instagram link used in emails.' },
            { key: 'mail_linkedin', label: 'Mail LinkedIn', type: 'url', description: 'LinkedIn link used in emails.' },
            { key: 'mail_youtube', label: 'Mail YouTube', type: 'url', description: 'YouTube link used in emails.' },
        ],
    },
];

export const SECTION_DESCRIPTIONS: Record<AdminSectionId, string> = {
    overview: 'Unified operations workspace for infrastructure, users, and release visibility.',
    settings: 'Runtime behavior, identity, sessions, security, and mail transport.',
    flash: 'Brand, layout, component, and palette controls for the client panel.',
    api: 'Administrative API keys and external access management.',
    tickets: 'Support queue management, routing, and response history.',
    databases: 'Database hosts used when provisioning server databases.',
    locations: 'Regions and placement groups used by nodes.',
    nodes: 'Capacity, connectivity, allocations, and node configuration.',
    servers: 'Provisioned workloads, startup rules, and operational controls.',
    users: 'Accounts, permissions, and identity management.',
    mounts: 'Shared mounts and their server and node assignments.',
    nests: 'Provisioning cores and shell definitions.',
};

export const SECTION_ICONS: Record<AdminSectionId, IconType> = {
    overview: LuHouse,
    settings: LuCog,
    flash: LuSparkles,
    api: LuShield,
    tickets: LuTicket,
    databases: LuDatabase,
    locations: LuGlobe,
    nodes: LuMapPinned,
    servers: LuServer,
    users: LuUsers,
    mounts: LuFolder,
    nests: LuBoxes,
};

export const SECTION_TITLES: Record<AdminSectionId, string> = {
    overview: 'Operations Center',
    settings: 'Runtime Settings',
    flash: 'Theme Studio',
    api: 'Application API',
    tickets: 'Tickets',
    databases: 'Database Hosts',
    locations: 'Locations',
    nodes: 'Nodes',
    servers: 'Servers',
    users: 'Users',
    mounts: 'Mounts',
    nests: 'Cores',
};
