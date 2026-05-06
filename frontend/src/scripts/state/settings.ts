import { action, Action } from 'easy-peasy';

export interface SiteSettings {
    name: string;
    locale: string;
    flash: {
        logo: string,
        fullLogo: boolean,
        logoHeight: string,
        discord: string,
        support: string,
        status: string,
        billing: string,
        
        announcementType: string,
        announcementCloseable: boolean,
        announcementMessage: string,
        announcementTimeout: string,
        announcementIcon: string,
      
        /* COMPONENTS */
        serverRow: number,
        socialButtons: boolean,
        discordBox: boolean,
      
        statsCards: number,
        graphs: number,
      
        slot1: string,
        slot2: string,
        slot3: string,
        slot4: string,
        slot5: string,
        slot6: string,
        slot7: string,
      
        /* SOCIALS */
        social_discord: string,
        social_billing: string,
        social_status: string,
        social_custom: string,
        social_custom_icon: string,
        addon_plugin_installer_enabled: boolean,
        addon_mod_installer_enabled: boolean,
        addon_modpack_installer_enabled: boolean,
        addon_subdomain_enabled: boolean,
        addon_split_enabled: boolean,
        addon_pterogpt_enabled: boolean,
        addon_version_changer_enabled: boolean,
        addon_ticket_system_enabled: boolean,
        addon_plugin_installer_eggs: string,
        addon_mod_installer_eggs: string,
        addon_modpack_installer_eggs: string,
        addon_subdomain_eggs: string,
        addon_split_eggs: string,
        addon_version_changer_eggs: string,
      
        /* LAYOUT */
        layout: number,
        dashboardLayout: number,
        serverLayout: number,
        searchComponent: number,
        logoPosition: number,
        socialPosition: number,
        loginLayout: number,
      
        /* STYLING */
        backgroundImage: string,
        backgroundBlur: string,
        backdrop: boolean,
        backdropPercentage: string,
        defaultMode: string,
        modeToggler: boolean,
        langSwitch: boolean,
        copyright: string,
        radiusInput: string,
        borderInput: boolean,
        radiusBox: string,
        flashMessage: number,
        pageTitle: boolean,
        loginBackground: string,
        loginGradient: boolean,
        effects_snow: boolean,
        effects_autumn: boolean,
        effects_stars: boolean,
        meta_color: string,
        meta_title: string,
        meta_description: string,
        meta_image: string,
        meta_favicon: string,
        meta_keywords: string,
        search_indexing: string,
        font: string,
      
        profileType: string,
        ipFlag: boolean;
        lowResourcesAlert: boolean;
        knowledge_base_url: string;

        /* COLORS */
        colorSchemaPreset: string,
        primary: string,
        successText: string,
        successBorder: string,
        successBackground: string,
        dangerText: string,
        dangerBorder: string,
        dangerBackground: string,
        secondaryText: string,
        secondaryBorder: string,
        secondaryBackground: string,
        warningText: string,
        warningBorder: string,
        warningBackground: string,
        infoText: string,
        infoBorder: string,
        infoBackground: string,
        textPrimary: string,
        textMuted: string,
        surfaceBase: string,
        surfaceElevated: string,
        surfaceCard: string,
        surfaceOverlay: string,
        borderColor: string,
        borderStrong: string,
        gray50: string,
        gray100: string,
        gray200: string,
        gray300: string,
        gray400: string,
        gray500: string,
        gray600: string,
        gray700: string,
        gray800: string,
        gray900: string,
        lightmode_primary: string,
        lightmode_successText: string,
        lightmode_successBorder: string,
        lightmode_successBackground: string,
        lightmode_dangerText: string,
        lightmode_dangerBorder: string,
        lightmode_dangerBackground: string,
        lightmode_secondaryText: string,
        lightmode_secondaryBorder: string,
        lightmode_secondaryBackground: string,
        lightmode_warningText: string,
        lightmode_warningBorder: string,
        lightmode_warningBackground: string,
        lightmode_infoText: string,
        lightmode_infoBorder: string,
        lightmode_infoBackground: string,
        lightmode_textPrimary: string,
        lightmode_textMuted: string,
        lightmode_surfaceBase: string,
        lightmode_surfaceElevated: string,
        lightmode_surfaceCard: string,
        lightmode_surfaceOverlay: string,
        lightmode_borderColor: string,
        lightmode_borderStrong: string,
        lightmode_gray50: string,
        lightmode_gray100: string,
        lightmode_gray200: string,
        lightmode_gray300: string,
        lightmode_gray400: string,
        lightmode_gray500: string,
        lightmode_gray600: string,
        lightmode_gray700: string,
        lightmode_gray800: string,
        lightmode_gray900: string,
    };
    recaptcha: {
        enabled: boolean;
        siteKey: string;
    };
}

export interface SettingsStore {
    data?: SiteSettings;
    setSettings: Action<SettingsStore, SiteSettings>;
}

const settings: SettingsStore = {
    data: undefined,

    setSettings: action((state, payload) => {
        state.data = payload;
    }),
};

export default settings;
