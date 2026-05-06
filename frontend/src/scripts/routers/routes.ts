import React, { lazy } from 'react';
import {
    UserIcon,
    EyeIcon,
    TerminalIcon,
    FolderOpenIcon,
    DatabaseIcon,
    CalendarIcon,
    UserGroupIcon,
    CubeTransparentIcon,
    PuzzleIcon,
    SaveIcon,
    GlobeIcon,
    ScissorsIcon,
    PlayIcon,
    CogIcon,
    AtSymbolIcon,
    LightningBoltIcon,
    SwitchVerticalIcon,
} from '@heroicons/react/outline';

type RouteComponent = React.ComponentType<any> | React.LazyExoticComponent<React.ComponentType<any>>;

const AccountOverviewContainer = lazy(() => import('@/components/dashboard/AccountOverviewContainer'));
const ActivityLogContainer = lazy(() => import('@/components/dashboard/activity/ActivityLogContainer'));
const DashboardContainer = lazy(() => import('@/components/server/dashboard/DashboardContainer'));
const ServerConsole = lazy(() => import('@/components/server/console/ServerConsoleContainer'));
const FullConsoleContainer = lazy(() => import('@/components/server/console/FullConsoleContainer'));
const DatabasesContainer = lazy(() => import('@/components/server/databases/DatabasesContainer'));
const ScheduleContainer = lazy(() => import('@/components/server/schedules/ScheduleContainer'));
const UsersContainer = lazy(() => import('@/components/server/users/UsersContainer'));
const BackupContainer = lazy(() => import('@/components/server/backups/BackupContainer'));
const NetworkContainer = lazy(() => import('@/components/server/network/NetworkContainer'));
const StartupContainer = lazy(() => import('@/components/server/startup/StartupContainer'));
const FileManagerContainer = lazy(() => import('@/components/server/files/FileManagerContainer'));
const FileEditContainer = lazy(() => import('@/components/server/files/FileEditContainer'));
const SettingsContainer = lazy(() => import('@/components/server/settings/SettingsContainer'));
const PluginInstallerContainer = lazy(() => import('@/components/server/plugin/PluginInstallerContainer'));
const ModManagerContainer = lazy(() => import('@/components/server/mods/ModManagerContainer'));
const McModpacksContainer = lazy(() => import('@/components/server/mcmodpacks/McModpacksContainer'));
const SubdomainContainer = lazy(() => import('@/components/server/subdomain/SubdomainContainer'));
const SplitContainer = lazy(() => import('@/components/server/split/SplitContainer'));
const VersionChangerContainer = lazy(() => import('@/components/server/versionchanger/VersionChangerContainer'));
const ServerActivityLogContainer = lazy(() => import('@/components/server/ServerActivityLogContainer'));
const ScheduleEditContainer = lazy(() => import('@/components/server/schedules/ScheduleEditContainer'));

/*
        ██╗██╗  ░██╗░░░░░░░██╗░█████╗░██████╗░███╗░░██╗  ██╗██╗
        ██║██║  ░██║░░██╗░░██║██╔══██╗██╔══██╗████╗░██║  ██║██║
        ██║██║  ░╚██╗████╗██╔╝███████║██████╔╝██╔██╗██║  ██║██║
        ╚═╝╚═╝  ░░████╔═████║░██╔══██║██╔══██╗██║╚████║  ╚═╝╚═╝
        ██╗██╗  ░░╚██╔╝░╚██╔╝░██║░░██║██║░░██║██║░╚███║  ██╗██╗
        ╚═╝╚═╝  ░░░╚═╝░░░╚═╝░░╚═╝░░╚═╝╚═╝░░╚═╝╚═╝░░╚══╝  ╚═╝╚═╝


        Read this before doing addon modifications

        Flash Theme has already handled many panel 
        modifications for you, so there's no need for 
        any changes in the "ServerRouter.tsx" file.

        To add an adodn to your theme, you just need
        to add an icon from the Heroicons font pack to
        the import statement on line 16. You can find
        the icons at https://v1.heroicons.com/. For
        instance, if you want to add "inbox-in", include
        the following in the import statement: 

        "InboxInIcon," 
        
        Your import statement might look like this example:

        import { InboxInIcon, UserIcon, EyeIcon, ... 

        After importing the desired icon, refer to the addon's
        readme file and include the required import line. 
        An example might be:

        import PluginInstallerContainer from '@/components/server/plugin/PluginInstallerContainer';

        Once you've imported the correct icon and the component,
        you simply need to follow the instructions in the addon's
        readme to add the route. Don't forget to include
        the icon in the route definition. Here's an example:

        {
            path: '/plugin-installer',
            permission: null,
            name: 'Plugin installer',
            icon: InboxInIcon,  
            component: PluginInstallerContainer,
            exact: true,
        },
*/

interface RouteDefinition {
    path: string;
    // If undefined is passed this route is still rendered into the router itself
    // but no navigation link is displayed in the sub-navigation menu.
    name: string | undefined;
    component: RouteComponent;
    icon?: React.ComponentType<any>;
    exact?: boolean;
}

interface ServerRouteDefinition extends RouteDefinition {
    permission: string | string[] | null;
    nestId?: number;
    eggId?: number;
    nestIds?: number[];
    eggIds?: number[];
}  

interface Routes {
    // All of the routes available under "/account"
    account: RouteDefinition[];
    // All of the routes available under "/server/:id"
    server: {
        general: ServerRouteDefinition[];
        management: ServerRouteDefinition[];
        configuration: ServerRouteDefinition[];
    };
}

export default {
    account: [
        {
            path: '/',
            name: 'account',
            icon: UserIcon,
            component: AccountOverviewContainer,
            exact: true,
        },
        {
            path: '/activity',
            name: 'account-activity',
            icon: EyeIcon,
            component: ActivityLogContainer,
        },
    ],
    server: {
        general: [
            {
                path: '/',
                permission: null,
                name: 'console',
                icon: TerminalIcon,
                component: ServerConsole,
                exact: true,
            },
            {
                path: '/console/popup',
                permission: null,
                icon: TerminalIcon,
                name: undefined,
                component: FullConsoleContainer,
            },
            {
                path: '/settings',
                permission: ['settings.*', 'file.sftp'],
                name: 'settings',
                icon: CogIcon,
                component: SettingsContainer,
            },
            {
                path: '/activity',
                permission: 'activity.*',
                name: 'activity',
                icon: EyeIcon,
                component: ServerActivityLogContainer,
            },
        ],
        management: [
            {
                path: '/files',
                permission: 'file.*',
                name: 'files',
                icon: FolderOpenIcon,
                component: FileManagerContainer,
            },
            {
                path: '/plugins',
                permission: 'file.*',
                name: 'plugin-installer',
                icon: LightningBoltIcon,
                component: PluginInstallerContainer,
                nestId: 1,
            },
            {
                path: '/mods',
                permission: 'file.*',
                name: 'mod-installer',
                icon: PuzzleIcon,
                component: ModManagerContainer,
                nestId: 1,
            },
            {
                path: '/mcmodpacks',
                permission: 'file.update',
                name: 'modpack-installer',
                icon: CubeTransparentIcon,
                component: McModpacksContainer,
                nestId: 1,
            },
            {
                path: '/minecraft/versions',
                permission: 'file.update',
                name: 'version-changer',
                icon: SwitchVerticalIcon,
                component: VersionChangerContainer,
            },
            {
                path: '/subdomains',
                permission: 'subdomain.manage',
                name: 'subdomain-manager',
                icon: AtSymbolIcon,
                component: SubdomainContainer,
            },
            {
                path: '/split',
                permission: 'split.manage',
                name: 'split-server',
                icon: ScissorsIcon,
                component: SplitContainer,
            },
            {
                path: '/files/:action(edit|new)',
                permission: 'file.*',
                name: undefined,
                component: FileEditContainer,
            },
            {
                path: '/databases',
                permission: 'database.*',
                name: 'databases',
                icon: DatabaseIcon,
                component: DatabasesContainer,
            },
            {
                path: '/backups',
                permission: 'backup.*',
                name: 'backups',
                icon: SaveIcon,
                component: BackupContainer,
            },
            {
                path: '/network',
                permission: 'allocation.*',
                name: 'network',
                icon: GlobeIcon,
                component: NetworkContainer,
            },
        ],
        configuration: [
            {
                path: '/schedules',
                permission: 'schedule.*',
                name: 'schedules',
                icon: CalendarIcon,
                component: ScheduleContainer,
            },
            {
                path: '/schedules/:id',
                permission: 'schedule.*',
                name: undefined,
                component: ScheduleEditContainer,
            },
            {
                path: '/users',
                permission: 'user.*',
                name: 'users',
                icon: UserGroupIcon,
                component: UsersContainer,
            },
            {
                path: '/startup',
                permission: 'startup.*',
                name: 'startup',
                icon: PlayIcon,
                component: StartupContainer,
            },
        ]
    }
} as Routes;
