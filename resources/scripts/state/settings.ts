import { action, Action } from 'easy-peasy';

export interface SiteSettings {
    name: string;
    locale: string;
    flash: {
        logo: string,
        fullLogo: boolean,
        logoHeight: string,
        
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
        meta_keywords: string,
        search_indexing: string,
      
        profileType: string,
        ipFlag: boolean;
        lowResourcesAlert: boolean;
        knowledge_base_url: string;

        /* COLORS */
        primary: string,
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
