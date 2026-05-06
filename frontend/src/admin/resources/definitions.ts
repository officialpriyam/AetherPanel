import type { FormField, FormFieldOption } from '../config';
import { adminHttp } from '../api';
import { getRelationItems } from '../utils';

export const DAEMON_BASE_PRESETS = {
    linux: '/var/lib/ourpanel/volumes',
    windows: 'C:\\ourpanel\\volumes',
} as const;

const sortOptions = (options: FormFieldOption[]): FormFieldOption[] =>
    [...options].sort((left, right) => String(left.label).localeCompare(String(right.label)));

const getNodeLocation = (node: Record<string, any>): Record<string, any> | null =>
    getRelationItems(node, 'location')[0] ?? node.location ?? null;

const getNodeAllocations = (node: Record<string, any>): Record<string, any>[] => {
    const relationshipAllocations = getRelationItems(node, 'allocations');

    if (relationshipAllocations.length > 0) {
        return relationshipAllocations;
    }

    return Array.isArray(node.allocations) ? node.allocations : [];
};

const buildLocationOptions = (refs: Record<string, any>): FormFieldOption[] =>
    sortOptions((refs.locations || []).map((location: Record<string, any>) => ({
        value: location.id,
        label: `#${location.id} - ${location.short}${location.long ? ` (${location.long})` : ''}`,
    })));

const buildUserOptions = (refs: Record<string, any>): FormFieldOption[] =>
    sortOptions((refs.users || []).map((user: Record<string, any>) => ({
        value: user.id,
        label: `#${user.id} - ${user.username}${user.email ? ` (${user.email})` : ''}`,
    })));

const collectEggRefs = (refs: Record<string, any>): Record<string, any>[] => {
    if (Array.isArray(refs.eggs) && refs.eggs.length > 0) {
        return refs.eggs;
    }

    return (refs.nests || []).flatMap((nest: Record<string, any>) =>
        getRelationItems(nest, 'eggs').map((egg) => ({
            ...egg,
            nest_name: nest.name,
        }))
    );
};

const buildEggOptions = (refs: Record<string, any>): FormFieldOption[] =>
    sortOptions(collectEggRefs(refs).map((egg: Record<string, any>) => ({
        value: egg.id,
        label: `#${egg.id} - ${egg.name}${egg.nest_name ? ` (${egg.nest_name})` : ''}`,
    })));

const buildNestOptions = (refs: Record<string, any>): FormFieldOption[] =>
    sortOptions((refs.nests || []).map((nest: Record<string, any>) => ({
        value: nest.id,
        label: `#${nest.id} - ${nest.name}`,
    })));

const buildFreeAllocationOptions = (refs: Record<string, any>): FormFieldOption[] =>
    sortOptions((refs.nodes || []).flatMap((node: Record<string, any>) => {
        const location = getNodeLocation(node);

        return getNodeAllocations(node)
            .filter((allocation) => !allocation.assigned)
            .map((allocation) => ({
                value: allocation.id,
                label: `#${allocation.id} - ${node.name}${location ? ` / ${location.short}` : ''} (${allocation.alias || allocation.ip}:${allocation.port})`,
            }));
    }));

const buildAllocationOptions = (refs: Record<string, any>): FormFieldOption[] =>
    sortOptions((refs.nodes || []).flatMap((node: Record<string, any>) => {
        const location = getNodeLocation(node);

        return getNodeAllocations(node).map((allocation) => ({
            value: allocation.id,
            label: `#${allocation.id} - ${node.name}${location ? ` / ${location.short}` : ''} (${allocation.alias || allocation.ip}:${allocation.port})${allocation.assigned ? ' [assigned]' : ''}`,
        }));
    }));

export const userFields: FormField[] = [
    { key: 'email', label: 'Email', type: 'text', description: 'Primary account email.' },
    { key: 'username', label: 'Username', type: 'text', description: 'Panel username.' },
    { key: 'first_name', label: 'First Name', type: 'text', description: 'Client first name.' },
    { key: 'last_name', label: 'Last Name', type: 'text', description: 'Client last name.' },
    { key: 'language', label: 'Language', type: 'text', description: 'Locale key such as en.' },
    { key: 'password', label: 'Password', type: 'password', description: 'Leave blank on updates to keep the current password.' },
    { key: 'root_admin', label: 'Administrator', type: 'boolean', description: 'Grant full administrative access.' },
];

export const locationFields: FormField[] = [
    { key: 'short', label: 'Short Code', type: 'text', description: 'Short location identifier, for example us.nyc.lvl3.' },
    { key: 'long', label: 'Description', type: 'textarea', description: 'Human-friendly location description.', rows: 4 },
];

export const nodeFields: FormField[] = [
    { key: 'name', label: 'Name', type: 'text', description: 'Node display name.' },
    { key: 'description', label: 'Description', type: 'textarea', description: 'Node description.', rows: 4 },
    { key: 'location_id', label: 'Location', type: 'select', description: 'Choose the location this node belongs to.', getOptions: buildLocationOptions, emptyOptionLabel: 'Select a location' },
    { key: 'fqdn', label: 'FQDN', type: 'text', description: 'Public node hostname.' },
    { key: 'scheme', label: 'Scheme', type: 'select', description: 'Transport used to reach Wings.', options: [
        { label: 'https', value: 'https' },
        { label: 'http', value: 'http' },
    ] },
    { key: 'daemon_base_profile', label: 'Daemon Base Preset', type: 'select', description: 'Choose Linux or Windows default before saving.', options: [
        { label: 'Linux', value: 'linux' },
        { label: 'Windows', value: 'windows' },
    ] },
    { key: 'public', label: 'Public Node', type: 'boolean', description: 'Allow automatic deployment to this node.' },
    { key: 'behind_proxy', label: 'Behind Proxy', type: 'boolean', description: 'Skip local certificate discovery when proxied.' },
    { key: 'maintenance_mode', label: 'Maintenance Mode', type: 'boolean', description: 'Temporarily prevent scheduling on this node.' },
    { key: 'memory', label: 'Memory (MiB)', type: 'number', description: 'Total node memory capacity.' },
    { key: 'memory_overallocate', label: 'Memory Overallocate (%)', type: 'number', description: 'Allowed memory overallocation percentage.' },
    { key: 'disk', label: 'Disk (MiB)', type: 'number', description: 'Total node disk capacity.' },
    { key: 'disk_overallocate', label: 'Disk Overallocate (%)', type: 'number', description: 'Allowed disk overallocation percentage.' },
    { key: 'upload_size', label: 'Upload Size (MiB)', type: 'number', description: 'Maximum upload size for this node.' },
    { key: 'daemon_listen', label: 'Daemon Port', type: 'number', description: 'Wings API port.' },
    { key: 'daemon_sftp', label: 'SFTP Port', type: 'number', description: 'Wings SFTP port.' },
    { key: 'daemon_base', label: 'Daemon Base Path', type: 'text', description: 'Filesystem base path for server volumes. Auto-filled from the preset.' },
];

export const serverCreateFields: FormField[] = [
    { key: 'name', label: 'Server Name', type: 'text', description: 'Primary server display name.' },
    { key: 'description', label: 'Description', type: 'textarea', description: 'Optional server description.', rows: 3 },
    { key: 'user', label: 'Owner', type: 'select', description: 'Choose the user that owns this server.', getOptions: buildUserOptions, emptyOptionLabel: 'Select an owner' },
    { key: 'allocation_default', label: 'Default Allocation', type: 'select', description: 'Choose the primary allocation for this server.', getOptions: buildFreeAllocationOptions, emptyOptionLabel: 'Select an allocation' },
    { key: 'egg', label: 'Egg', type: 'select', description: 'Choose the egg used to define this server.', getOptions: buildEggOptions, emptyOptionLabel: 'Select an egg' },
    { key: 'docker_image', label: 'Docker Image', type: 'text', description: 'Docker image used at runtime.' },
    { key: 'startup', label: 'Startup Command', type: 'text', description: 'Startup command template.' },
    { key: 'limits_memory', label: 'Memory (MiB)', type: 'number', description: 'Memory limit.' },
    { key: 'limits_swap', label: 'Swap (MiB)', type: 'number', description: 'Swap limit.' },
    { key: 'limits_disk', label: 'Disk (MiB)', type: 'number', description: 'Disk limit.' },
    { key: 'limits_io', label: 'IO Weight', type: 'number', description: 'Block IO weight.' },
    { key: 'limits_cpu', label: 'CPU (%)', type: 'number', description: 'CPU limit percentage.' },
    { key: 'limits_threads', label: 'CPU Threads', type: 'text', description: 'Pinned CPU threads list.' },
    { key: 'feature_limits_databases', label: 'Database Limit', type: 'number', description: 'Allowed databases.' },
    { key: 'feature_limits_allocations', label: 'Allocation Limit', type: 'number', description: 'Allowed extra allocations.' },
    { key: 'feature_limits_backups', label: 'Backup Limit', type: 'number', description: 'Allowed backups.' },
    { key: 'skip_scripts', label: 'Skip Install Script', type: 'boolean', description: 'Skip the egg install script.' },
    { key: 'oom_disabled', label: 'Disable OOM Killer', type: 'boolean', description: 'Allow the container to continue past its memory limit.' },
    { key: 'start_on_completion', label: 'Start On Completion', type: 'boolean', description: 'Automatically start the server after install.' },
    { key: 'environment_json', label: 'Environment JSON', type: 'textarea', description: 'Raw environment variable object for the egg.', rows: 8 },
];

export const serverDetailsFields: FormField[] = [
    { key: 'name', label: 'Server Name', type: 'text', description: 'Primary server display name.' },
    { key: 'description', label: 'Description', type: 'textarea', description: 'Server description.', rows: 3 },
    { key: 'user', label: 'Owner', type: 'select', description: 'Choose the user that owns this server.', getOptions: buildUserOptions, emptyOptionLabel: 'Select an owner' },
    { key: 'external_id', label: 'External ID', type: 'text', description: 'Optional third-party identifier.' },
];

export const serverBuildFields: FormField[] = [
    { key: 'allocation', label: 'Primary Allocation', type: 'select', description: 'Choose the primary allocation for this server.', getOptions: buildAllocationOptions, emptyOptionLabel: 'Select an allocation' },
    { key: 'limits_memory', label: 'Memory (MiB)', type: 'number', description: 'Memory limit.' },
    { key: 'limits_swap', label: 'Swap (MiB)', type: 'number', description: 'Swap limit.' },
    { key: 'limits_disk', label: 'Disk (MiB)', type: 'number', description: 'Disk limit.' },
    { key: 'limits_io', label: 'IO Weight', type: 'number', description: 'Block IO weight.' },
    { key: 'limits_cpu', label: 'CPU (%)', type: 'number', description: 'CPU limit.' },
    { key: 'limits_threads', label: 'CPU Threads', type: 'text', description: 'Pinned thread list.' },
    { key: 'feature_limits_databases', label: 'Database Limit', type: 'number', description: 'Allowed databases.' },
    { key: 'feature_limits_allocations', label: 'Allocation Limit', type: 'number', description: 'Allowed extra allocations.' },
    { key: 'feature_limits_backups', label: 'Backup Limit', type: 'number', description: 'Allowed backups.' },
    { key: 'oom_disabled', label: 'Disable OOM Killer', type: 'boolean', description: 'Disable OOM kills.' },
];

export const serverStartupFields: FormField[] = [
    { key: 'startup', label: 'Startup Command', type: 'text', description: 'Startup template used by the server.' },
    { key: 'egg', label: 'Egg', type: 'select', description: 'Choose the egg used by the server.', getOptions: buildEggOptions, emptyOptionLabel: 'Select an egg' },
    { key: 'image', label: 'Docker Image', type: 'text', description: 'Docker image override.' },
    { key: 'skip_scripts', label: 'Skip Scripts', type: 'boolean', description: 'Skip install scripts during update.' },
    { key: 'environment_json', label: 'Environment JSON', type: 'textarea', description: 'Raw environment key/value object.', rows: 8 },
];

export const mountFields: FormField[] = [
    { key: 'name', label: 'Name', type: 'text', description: 'Display name for the shared mount.' },
    { key: 'description', label: 'Description', type: 'textarea', description: 'Optional description shown to admins.', rows: 4 },
    { key: 'source', label: 'Source Path', type: 'text', description: 'Absolute source path on the node.' },
    { key: 'target', label: 'Target Path', type: 'text', description: 'Destination path inside the container.' },
    { key: 'read_only', label: 'Read Only', type: 'boolean', description: 'Prevent writes inside the container.' },
    { key: 'user_mountable', label: 'User Mountable', type: 'boolean', description: 'Allow users to enable the mount on servers.' },
];

export const nestFields: FormField[] = [
    { key: 'name', label: 'Name', type: 'text', description: 'Nest name shown in provisioning flows.' },
    { key: 'description', label: 'Description', type: 'textarea', description: 'Short description for this nest.', rows: 4 },
];

export const eggFields: FormField[] = [
    { key: 'nest_id', label: 'Nest', type: 'select', description: 'Choose the parent nest for this egg.', getOptions: buildNestOptions, emptyOptionLabel: 'Select a nest' },
    { key: 'name', label: 'Name', type: 'text', description: 'Egg name shown to administrators.' },
    { key: 'image', label: 'Image URL', type: 'url', description: 'Optional remote image used by some themes.' },
    { key: 'description', label: 'Description', type: 'textarea', description: 'Egg description.', rows: 4 },
    { key: 'docker_images', label: 'Docker Images', type: 'textarea', description: 'One image per line. Use label|image to provide aliases.', rows: 6 },
    { key: 'startup', label: 'Startup', type: 'textarea', description: 'Startup command template.', rows: 4 },
    { key: 'config_from', label: 'Config From Egg', type: 'select', description: 'Optionally copy configuration defaults from another egg.', getOptions: buildEggOptions, emptyOptionLabel: 'Do not inherit from another egg' },
    { key: 'config_stop', label: 'Stop Command', type: 'text', description: 'Stop command used by the egg.' },
    { key: 'config_startup', label: 'Startup Detection JSON', type: 'textarea', description: 'Raw JSON for startup parsing.', rows: 5 },
    { key: 'config_logs', label: 'Log Parsing JSON', type: 'textarea', description: 'Raw JSON for log parsing.', rows: 5 },
    { key: 'config_files', label: 'Config Files JSON', type: 'textarea', description: 'Raw JSON describing editable files.', rows: 5 },
    { key: 'force_outgoing_ip', label: 'Force Outgoing IP', type: 'boolean', description: 'Force outgoing network traffic through the node IP.' },
];

export const eggVariableFields: FormField[] = [
    { key: 'name', label: 'Name', type: 'text', description: 'Variable display name.' },
    { key: 'description', label: 'Description', type: 'textarea', description: 'Admin-facing description.', rows: 3 },
    { key: 'env_variable', label: 'Environment Variable', type: 'text', description: 'Unique uppercase variable key.' },
    { key: 'default_value', label: 'Default Value', type: 'textarea', description: 'Default value injected into new servers.', rows: 3 },
    { key: 'rules', label: 'Validation Rules', type: 'text', description: 'Laravel validation rule string.' },
    { key: 'user_viewable', label: 'User Viewable', type: 'boolean', description: 'Expose this variable to users.' },
    { key: 'user_editable', label: 'User Editable', type: 'boolean', description: 'Allow users to change this variable.' },
];

export const eggScriptFields: FormField[] = [
    { key: 'copy_script_from', label: 'Copy Script From Egg', type: 'select', description: 'Optionally copy script data from another egg.', getOptions: buildEggOptions, emptyOptionLabel: 'Do not copy from another egg' },
    { key: 'script_is_privileged', label: 'Privileged', type: 'boolean', description: 'Run the install container in privileged mode.' },
    { key: 'script_entry', label: 'Script Entry', type: 'text', description: 'Entrypoint command for installs.' },
    { key: 'script_container', label: 'Script Container', type: 'text', description: 'Container image used for installs.' },
    { key: 'script_install', label: 'Install Script', type: 'textarea', description: 'Shell script executed during installation.', rows: 10 },
];

export const apiKeyFields: FormField[] = [
    { key: 'memo', label: 'Description', type: 'text', description: 'Human-friendly description for this application key.' },
    { key: 'r_allocations', label: 'Allocations', type: 'select', description: 'Permission level for allocations.', options: [
        { label: 'No Access', value: 0 },
        { label: 'Read Only', value: 1 },
        { label: 'Read + Write', value: 3 },
    ] },
    { key: 'r_database_hosts', label: 'Database Hosts', type: 'select', description: 'Permission level for database hosts.', options: [
        { label: 'No Access', value: 0 },
        { label: 'Read Only', value: 1 },
        { label: 'Read + Write', value: 3 },
    ] },
    { key: 'r_eggs', label: 'Eggs', type: 'select', description: 'Permission level for eggs.', options: [
        { label: 'No Access', value: 0 },
        { label: 'Read Only', value: 1 },
        { label: 'Read + Write', value: 3 },
    ] },
    { key: 'r_locations', label: 'Locations', type: 'select', description: 'Permission level for locations.', options: [
        { label: 'No Access', value: 0 },
        { label: 'Read Only', value: 1 },
        { label: 'Read + Write', value: 3 },
    ] },
    { key: 'r_nests', label: 'Nests', type: 'select', description: 'Permission level for nests.', options: [
        { label: 'No Access', value: 0 },
        { label: 'Read Only', value: 1 },
        { label: 'Read + Write', value: 3 },
    ] },
    { key: 'r_nodes', label: 'Nodes', type: 'select', description: 'Permission level for nodes.', options: [
        { label: 'No Access', value: 0 },
        { label: 'Read Only', value: 1 },
        { label: 'Read + Write', value: 3 },
    ] },
    { key: 'r_server_databases', label: 'Server Databases', type: 'select', description: 'Permission level for server databases.', options: [
        { label: 'No Access', value: 0 },
        { label: 'Read Only', value: 1 },
        { label: 'Read + Write', value: 3 },
    ] },
    { key: 'r_servers', label: 'Servers', type: 'select', description: 'Permission level for servers.', options: [
        { label: 'No Access', value: 0 },
        { label: 'Read Only', value: 1 },
        { label: 'Read + Write', value: 3 },
    ] },
    { key: 'r_users', label: 'Users', type: 'select', description: 'Permission level for users.', options: [
        { label: 'No Access', value: 0 },
        { label: 'Read Only', value: 1 },
        { label: 'Read + Write', value: 3 },
    ] },
];

export const nodeDetailTabs = [
    { id: 'index', label: 'Overview', description: 'Usage, capacity, and high-level node information.' },
    { id: 'settings', label: 'Settings', description: 'Primary node settings and secret rotation.' },
    { id: 'configuration', label: 'Configuration', description: 'Wings configuration data for this node.' },
    { id: 'allocation', label: 'Allocations', description: 'Allocation creation and removal tools.' },
    { id: 'servers', label: 'Servers', description: 'Servers currently assigned to this node.' },
];

export const serverDetailTabs = [
    { id: 'index', label: 'Overview', description: 'Primary server identity and summary details.' },
    { id: 'details', label: 'Details', description: 'Owner, name, external ID, and description.' },
    { id: 'build', label: 'Build', description: 'Limits, allocations, and feature limits.' },
    { id: 'startup', label: 'Startup', description: 'Startup command, egg, image, and environment.' },
    { id: 'database', label: 'Database', description: 'Server database creation and password resets.' },
    { id: 'manage', label: 'Manage', description: 'Suspend, reinstall, and destructive actions.' },
];

export const eggDetailTabs = [
    { id: 'index', label: 'Details', description: 'Base egg configuration and provisioning fields.' },
    { id: 'variables', label: 'Variables', description: 'Environment variables attached to the egg.' },
    { id: 'scripts', label: 'Scripts', description: 'Install script configuration and inheritance.' },
];

export const createPayloadForServer = (state: Record<string, string>) => ({
    name: state.name,
    description: state.description || null,
    user: Number(state.user),
    egg: Number(state.egg),
    docker_image: state.docker_image,
    startup: state.startup,
    environment: state.environment_json ? JSON.parse(state.environment_json) : {},
    skip_scripts: state.skip_scripts === 'true',
    oom_disabled: state.oom_disabled === 'true',
    limits: {
        memory: Number(state.limits_memory || 0),
        swap: Number(state.limits_swap || 0),
        disk: Number(state.limits_disk || 0),
        io: Number(state.limits_io || 500),
        cpu: Number(state.limits_cpu || 0),
        threads: state.limits_threads || null,
    },
    feature_limits: {
        databases: Number(state.feature_limits_databases || 0),
        allocations: Number(state.feature_limits_allocations || 0),
        backups: Number(state.feature_limits_backups || 0),
    },
    allocation: {
        default: Number(state.allocation_default),
    },
    start_on_completion: state.start_on_completion === 'true',
});

export const loadLocationsRef = async () => {
    const { data } = await adminHttp.get('/api/admin/references/locations');
    return data?.data ?? {};
};

export const loadServerRefs = async () => {
    const { data } = await adminHttp.get('/api/admin/references/servers');
    return data?.data ?? {};
};

export const loadMountRefs = async () => {
    const { data } = await adminHttp.get('/api/admin/references/mounts');
    return data?.data ?? {};
};

export const loadTicketRefs = async () => {
    const { data } = await adminHttp.get('/api/admin/tickets/meta');
    return data?.data ?? {};
};

export const loadNestRefs = async () => {
    const { data } = await adminHttp.get('/api/admin/references/nests');
    return data?.data ?? {};
};
