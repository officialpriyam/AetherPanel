<?php

namespace Pterodactyl\Http\ViewComposers;

use Illuminate\View\View;
use Pterodactyl\Services\Helpers\AssetHashService;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class AssetComposer
{
    /**
     * AssetComposer constructor.
     */
    public function __construct(private AssetHashService $assetHashService, private SettingsRepositoryInterface $settings)
    {
    }

    /**
     * Provide access to the asset service in the views.
     */
    public function compose(View $view): void
    {
        $view->with('asset', $this->assetHashService);
        $view->with('siteConfiguration', [
            'name' => config('app.name') ?? 'Pterodactyl',
            'flash' => [
                'logo' => $this->settings->get('settings::flash:logo', '/flash/Flash.png'),
                'fullLogo' => $this->settings->get('settings::flash:fullLogo', false),
                'logoHeight' => $this->settings->get('settings::flash:logoHeight', '32px'),

                /* SOCIALS */ 
                'discord' => $this->settings->get('settings::flash:discord', '715281172422197300'),
                'support' => $this->settings->get('settings::flash:support', 'https://discord.gg/p6Sz3X3YFe'),
                'status' => $this->settings->get('settings::flash:status', 'https://status.priyxstudio.one'),
                'billing' => $this->settings->get('settings::flash:billing', 'https://billing.priyxstudio.one'),

                'announcementType' => $this->settings->get('settings::flash:announcementType', 'party'),
                'announcementCloseable' => $this->settings->get('settings::flash:announcementCloseable', false),
                'announcementMessage' => $this->settings->get('settings::flash:announcementMessage', 'We have a brand new game panel design!'),

                /* MAIL */
                'mail_color' => $this->settings->get('settings::flash:mail_color', '#1E293B'),
                'mail_backgroundColor' => $this->settings->get('settings::flash:mail_backgroundColor', '#F5F5FF'),
                'mail_logo' => $this->settings->get('settings::flash:mail_logo', 'https://flash.gg/flash.png'),
                'mail_logoFull' => $this->settings->get('settings::flash:mail_logoFull', false),
                'mail_mode' => $this->settings->get('settings::flash:mail_mode', 'light'),

                'mail_discord' => $this->settings->get('settings::flash:mail_discord', 'https://flash.gg/discord'),
                'mail_twitter' => $this->settings->get('settings::flash:mail_twitter', 'https://x.com'),
                'mail_facebook' => $this->settings->get('settings::flash:mail_facebook', 'https://facebook.com'),
                'mail_instagram' => $this->settings->get('settings::flash:mail_instagram', 'https://instagram.com'),
                'mail_linkedin' => $this->settings->get('settings::flash:mail_linkedin', 'https://linkedin.com'),
                'mail_youtube' => $this->settings->get('settings::flash:mail_youtube', 'https://youtube.com'),

                'mail_status' => $this->settings->get('settings::flash:mail_status', 'https://flash.gg/status'),
                'mail_billing' => $this->settings->get('settings::flash:mail_billing', 'https://flash.gg/billing'),
                'mail_support' => $this->settings->get('settings::flash:mail_support', 'https://flash.gg/support'),

                /* COMPONENTS */
                'serverRow' => $this->settings->get('settings::flash:serverRow', 1),
                'socialButtons' => $this->settings->get('settings::flash:socialButtons', false),
                'discordBox' => $this->settings->get('settings::flash:discordBox', true),
                'social_discord' => $this->settings->get('settings::flash:social_discord', 'https://discord.gg/'),
                'social_billing' => $this->settings->get('settings::flash:social_billing', 'https://billing.example.com'),
                'social_status' => $this->settings->get('settings::flash:social_status', 'https://status.example.com'),
                'social_custom' => $this->settings->get('settings::flash:social_custom', ''),
                'social_custom_icon' => $this->settings->get('settings::flash:social_custom_icon', 'link'),
                'addon_plugin_installer_enabled' => $this->settings->get('settings::flash:addon_plugin_installer_enabled', 'true'),
                'addon_mod_installer_enabled' => $this->settings->get('settings::flash:addon_mod_installer_enabled', 'true'),
                'addon_modpack_installer_enabled' => $this->settings->get('settings::flash:addon_modpack_installer_enabled', 'true'),
                'addon_subdomain_enabled' => $this->settings->get('settings::flash:addon_subdomain_enabled', 'true'),
                'addon_split_enabled' => $this->settings->get('settings::flash:addon_split_enabled', 'true'),
                'addon_pterogpt_enabled' => $this->settings->get('settings::flash:addon_pterogpt_enabled', 'true'),
                'addon_version_changer_enabled' => $this->settings->get('settings::flash:addon_version_changer_enabled', 'true'),
                'addon_ticket_system_enabled' => $this->settings->get('settings::flash:addon_ticket_system_enabled', 'true'),
                'addon_plugin_installer_eggs' => $this->settings->get('settings::flash:addon_plugin_installer_eggs', ''),
                'addon_mod_installer_eggs' => $this->settings->get('settings::flash:addon_mod_installer_eggs', ''),
                'addon_modpack_installer_eggs' => $this->settings->get('settings::flash:addon_modpack_installer_eggs', ''),
                'addon_subdomain_eggs' => $this->settings->get('settings::flash:addon_subdomain_eggs', ''),
                'addon_split_eggs' => $this->settings->get('settings::flash:addon_split_eggs', ''),
                'addon_version_changer_eggs' => $this->settings->get('settings::flash:addon_version_changer_eggs', ''),

                'statsCards' => $this->settings->get('settings::flash:statsCards', 1),
                'graphs' => $this->settings->get('settings::flash:graphs', 2),
                
                'slot1' => $this->settings->get('settings::flash:slot1', 'disabled'),
                'slot2' => $this->settings->get('settings::flash:slot2', 'disabled'),
                'slot3' => $this->settings->get('settings::flash:slot3', 'disabled'),
                'slot4' => $this->settings->get('settings::flash:slot4', 'disabled'),
                'slot5' => $this->settings->get('settings::flash:slot5', 'disabled'),
                'slot6' => $this->settings->get('settings::flash:slot6', 'disabled'),
                'slot7' => $this->settings->get('settings::flash:slot7', 'disabled'),

                /* LAYOUT */
                'layout' => $this->settings->get('settings::flash:layout', 1),
                'dashboardLayout' => $this->settings->get('settings::flash:dashboardLayout', 1),
                'serverLayout' => $this->settings->get('settings::flash:serverLayout', 1),
                'searchComponent' => $this->settings->get('settings::flash:searchComponent', 1),
                'logoPosition' => $this->settings->get('settings::flash:logoPosition', 1),
                'socialPosition' => $this->settings->get('settings::flash:socialPosition', 1),
                'loginLayout' => $this->settings->get('settings::flash:loginLayout', 1),

                /* STYLING */
                'backgroundImage' => $this->settings->get('settings::flash:backgroundImage', 'none'),
                'backgroundImageLight' => $this->settings->get('settings::flash:backgroundImage', 'none'),
                'backgroundBlur' => $this->settings->get('settings::flash:backgroundBlur', '0px'),
                'backdrop' => $this->settings->get('settings::flash:backdrop', true),
                'backdropPercentage' => $this->settings->get('settings::flash:backdropPercentage', '80%'),
                'defaultMode' => $this->settings->get('settings::flash:defaultMode', 'darkmode'),
                'copyright' => $this->settings->get('settings::flash:copyright', 'Designed by priyxstudio'),
                'radiusInput' => $this->settings->get('settings::flash:radiusInput', '7px'),
                'borderInput' => $this->settings->get('settings::flash:borderInput', true),
                'radiusBox' => $this->settings->get('settings::flash:radiusBox', '10px'),
                'flashMessage' => $this->settings->get('settings::flash:flashMessage', 1),
                'pageTitle' => $this->settings->get('settings::flash:pageTitle', true),
                'loginBackground' => $this->settings->get('settings::flash:loginBackground', '/flash/background-login.png'),
                'loginGradient' => $this->settings->get('settings::flash:loginGradient', false),
                'effects_snow' => $this->settings->get('settings::flash:effects_snow', false),
                'effects_autumn' => $this->settings->get('settings::flash:effects_autumn', false),
                'effects_stars' => $this->settings->get('settings::flash:effects_stars', false),

                /* META DATA */
                'meta_color' => $this->settings->get('settings::flash:meta_color', '#1E293B'),
                'meta_title' => $this->settings->get('settings::flash:meta_title', 'Pterodactyl Panel'),
                'meta_description' => $this->settings->get('settings::flash:meta_description', 'Our official Pterodactyl panel'),
                'meta_image' => $this->settings->get('settings::flash:meta_image', '/flash/meta-tags.png'),
                'meta_favicon' => $this->settings->get('settings::flash:meta_favicon', '/flash/Flash.png'),

                /* ADVANCED */
                'font' => $this->settings->get('settings::flash:font', 'Roboto'),
                'profileType' => $this->settings->get('settings::flash:profileType', 'gravatar'),
                'modeToggler' => $this->settings->get('settings::flash:modeToggler', true),
                'langSwitch' => $this->settings->get('settings::flash:langSwitch', true),
                'ipFlag' => $this->settings->get('settings::flash:ipFlag', true),
                'lowResourcesAlert' => $this->settings->get('settings::flash:lowResourcesAlert', false),
                'knowledge_base_url' => $this->settings->get('settings::flash:knowledge_base_url', ''),

                /* COLORS */
                'primary' => $this->settings->get('settings::flash:primary', '#2563EB'),
                
                'successText' => $this->settings->get('settings::flash:successText', '#E1FFD8'),
                'successBorder' => $this->settings->get('settings::flash:successBorder', '#56AA2B'),
                'successBackground' => $this->settings->get('settings::flash:successBackground', '#3D8F1F'),

                'dangerText' => $this->settings->get('settings::flash:dangerText', '#FFD8D8'),
                'dangerBorder' => $this->settings->get('settings::flash:dangerBorder', '#AA2A2A'),
                'dangerBackground' => $this->settings->get('settings::flash:dangerBackground', '#8F1F20'),

                'secondaryText' => $this->settings->get('settings::flash:secondaryText', '#E2E8F0'),
                'secondaryBorder' => $this->settings->get('settings::flash:secondaryBorder', '#475569'),
                'secondaryBackground' => $this->settings->get('settings::flash:secondaryBackground', '#1E293B'),

                'gray50' => $this->settings->get('settings::flash:gray50', '#F8FAFC'),
                'gray100' => $this->settings->get('settings::flash:gray100', '#F1F5F9'),
                'gray200' => $this->settings->get('settings::flash:gray200', '#E2E8F0'),
                'gray300' => $this->settings->get('settings::flash:gray300', '#94A3B8'),
                'gray400' => $this->settings->get('settings::flash:gray400', '#64748B'),
                'gray500' => $this->settings->get('settings::flash:gray500', '#334155'),
                'gray600' => $this->settings->get('settings::flash:gray600', '#1E293B'),
                'gray700' => $this->settings->get('settings::flash:gray700', '#0F172A'),
                'gray800' => $this->settings->get('settings::flash:gray800', '#0B0F1A'),
                'gray900' => $this->settings->get('settings::flash:gray900', '#020617'),

                /* COLORS LIGHTMODE */
                'lightmode_primary' => $this->settings->get('settings::flash:lightmode_primary', '#2563EB'),
                
                'lightmode_successText' => $this->settings->get('settings::flash:lightmode_successText', '#E1FFD8'),
                'lightmode_successBorder' => $this->settings->get('settings::flash:lightmode_successBorder', '#56AA2B'),
                'lightmode_successBackground' => $this->settings->get('settings::flash:lightmode_successBackground', '#3D8F1F'),

                'lightmode_dangerText' => $this->settings->get('settings::flash:lightmode_dangerText', '#FFD8D8'),
                'lightmode_dangerBorder' => $this->settings->get('settings::flash:lightmode_dangerBorder', '#AA2A2A'),
                'lightmode_dangerBackground' => $this->settings->get('settings::flash:lightmode_dangerBackground', '#8F1F20'),

                'lightmode_secondaryText' => $this->settings->get('settings::flash:lightmode_secondaryText', '#334155'),
                'lightmode_secondaryBorder' => $this->settings->get('settings::flash:lightmode_secondaryBorder', '#CBD5E1'),
                'lightmode_secondaryBackground' => $this->settings->get('settings::flash:lightmode_secondaryBackground', '#E2E8F0'),

                'lightmode_gray50' => $this->settings->get('settings::flash:lightmode_gray50', '#0F172A'),
                'lightmode_gray100' => $this->settings->get('settings::flash:lightmode_gray100', '#1E293B'),
                'lightmode_gray200' => $this->settings->get('settings::flash:lightmode_gray200', '#334155'),
                'lightmode_gray300' => $this->settings->get('settings::flash:lightmode_gray300', '#475569'),
                'lightmode_gray400' => $this->settings->get('settings::flash:lightmode_gray400', '#64748B'),
                'lightmode_gray500' => $this->settings->get('settings::flash:lightmode_gray500', '#94A3B8'),
                'lightmode_gray600' => $this->settings->get('settings::flash:lightmode_gray600', '#CBD5E1'),
                'lightmode_gray700' => $this->settings->get('settings::flash:lightmode_gray700', '#E2E8F0'),
                'lightmode_gray800' => $this->settings->get('settings::flash:lightmode_gray800', '#F1F5F9'),
                'lightmode_gray900' => $this->settings->get('settings::flash:lightmode_gray900', '#FFFFFF'),
            ],
            'locale' => config('app.locale') ?? 'en',
            'recaptcha' => [
                'enabled' => config('recaptcha.enabled', false),
                'siteKey' => config('recaptcha.website_key') ?? '',
            ],
        ]);
    }
}
