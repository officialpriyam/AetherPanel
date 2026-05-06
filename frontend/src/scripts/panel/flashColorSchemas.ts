export const FLASH_COLOR_SCHEMA_FIELDS = [
    'primary',
    'successText',
    'successBorder',
    'successBackground',
    'dangerText',
    'dangerBorder',
    'dangerBackground',
    'secondaryText',
    'secondaryBorder',
    'secondaryBackground',
    'warningText',
    'warningBorder',
    'warningBackground',
    'infoText',
    'infoBorder',
    'infoBackground',
    'textPrimary',
    'textMuted',
    'surfaceBase',
    'surfaceElevated',
    'surfaceCard',
    'surfaceOverlay',
    'borderColor',
    'borderStrong',
    'gray50',
    'gray100',
    'gray200',
    'gray300',
    'gray400',
    'gray500',
    'gray600',
    'gray700',
    'gray800',
    'gray900',
    'lightmode_primary',
    'lightmode_successText',
    'lightmode_successBorder',
    'lightmode_successBackground',
    'lightmode_dangerText',
    'lightmode_dangerBorder',
    'lightmode_dangerBackground',
    'lightmode_secondaryText',
    'lightmode_secondaryBorder',
    'lightmode_secondaryBackground',
    'lightmode_warningText',
    'lightmode_warningBorder',
    'lightmode_warningBackground',
    'lightmode_infoText',
    'lightmode_infoBorder',
    'lightmode_infoBackground',
    'lightmode_textPrimary',
    'lightmode_textMuted',
    'lightmode_surfaceBase',
    'lightmode_surfaceElevated',
    'lightmode_surfaceCard',
    'lightmode_surfaceOverlay',
    'lightmode_borderColor',
    'lightmode_borderStrong',
    'lightmode_gray50',
    'lightmode_gray100',
    'lightmode_gray200',
    'lightmode_gray300',
    'lightmode_gray400',
    'lightmode_gray500',
    'lightmode_gray600',
    'lightmode_gray700',
    'lightmode_gray800',
    'lightmode_gray900',
] as const;

export type FlashColorSchemaField = typeof FLASH_COLOR_SCHEMA_FIELDS[number];

export type FlashColorSchemaDefinition = {
    id: string;
    label: string;
    description: string;
    values: Partial<Record<FlashColorSchemaField, string>>;
};

const cyanSchema: FlashColorSchemaDefinition = {
    id: 'cyan',
    label: 'Cyan',
    description: 'Cool cyan with deep ocean neutrals and restrained contrast.',
    values: {
        primary: '#38BDF8',
        successText: '#DDFEF1',
        successBorder: '#2FC76C',
        successBackground: '#124A35',
        dangerText: '#FFE3E8',
        dangerBorder: '#E86C86',
        dangerBackground: '#612132',
        secondaryText: '#D8E7F2',
        secondaryBorder: '#30506A',
        secondaryBackground: '#152235',
        warningText: '#FFE8BE',
        warningBorder: '#D6A250',
        warningBackground: '#5B4118',
        infoText: '#D8F6FF',
        infoBorder: '#4DBBDB',
        infoBackground: '#133E54',
        textPrimary: '#F2FBFF',
        textMuted: '#8FB6C8',
        surfaceBase: '#08111A',
        surfaceElevated: '#0C1723',
        surfaceCard: '#122031',
        surfaceOverlay: '#0A1520',
        borderColor: '#22384C',
        borderStrong: '#33536F',
        gray50: '#F4FBFF',
        gray100: '#D7EDF8',
        gray200: '#B6D6E5',
        gray300: '#90ADBD',
        gray400: '#6F8898',
        gray500: '#526679',
        gray600: '#38495D',
        gray700: '#223244',
        gray800: '#101B28',
        gray900: '#07111A',
        lightmode_primary: '#0EA5C6',
        lightmode_successText: '#11583A',
        lightmode_successBorder: '#28A45D',
        lightmode_successBackground: '#DDF9EB',
        lightmode_dangerText: '#7B1E33',
        lightmode_dangerBorder: '#D85C7A',
        lightmode_dangerBackground: '#FDE5EB',
        lightmode_secondaryText: '#294154',
        lightmode_secondaryBorder: '#C7DCE8',
        lightmode_secondaryBackground: '#EDF7FB',
        lightmode_warningText: '#7A4A06',
        lightmode_warningBorder: '#D29A35',
        lightmode_warningBackground: '#FFF4DB',
        lightmode_infoText: '#0E5168',
        lightmode_infoBorder: '#45A8C6',
        lightmode_infoBackground: '#DFF6FC',
        lightmode_textPrimary: '#102130',
        lightmode_textMuted: '#5D7B8D',
        lightmode_surfaceBase: '#F5FBFD',
        lightmode_surfaceElevated: '#FFFFFF',
        lightmode_surfaceCard: '#F2F8FC',
        lightmode_surfaceOverlay: '#E5F2F8',
        lightmode_borderColor: '#D4E4EE',
        lightmode_borderStrong: '#B7CDD9',
        lightmode_gray50: '#08111A',
        lightmode_gray100: '#163146',
        lightmode_gray200: '#27475C',
        lightmode_gray300: '#416178',
        lightmode_gray400: '#628097',
        lightmode_gray500: '#8CAABD',
        lightmode_gray600: '#B8D2E1',
        lightmode_gray700: '#D9EAF2',
        lightmode_gray800: '#EEF7FB',
        lightmode_gray900: '#FFFFFF',
    },
};

const limeSchema: FlashColorSchemaDefinition = {
    id: 'lime',
    label: 'Lime Green',
    description: 'Fresh lime accent with dark olive neutrals and softer highlights.',
    values: {
        primary: '#84CC16',
        successText: '#E9FFD9',
        successBorder: '#6EB63B',
        successBackground: '#28491C',
        dangerText: '#FFE5E1',
        dangerBorder: '#E37A67',
        dangerBackground: '#5F2B20',
        secondaryText: '#E1E7CF',
        secondaryBorder: '#49553B',
        secondaryBackground: '#1B2416',
        warningText: '#FFE7B7',
        warningBorder: '#D5A043',
        warningBackground: '#5C4012',
        infoText: '#E1FFF4',
        infoBorder: '#58CFA1',
        infoBackground: '#173E32',
        textPrimary: '#F8FAEF',
        textMuted: '#A8B28F',
        surfaceBase: '#0C1008',
        surfaceElevated: '#13190E',
        surfaceCard: '#1A2113',
        surfaceOverlay: '#12180D',
        borderColor: '#313C26',
        borderStrong: '#465438',
        gray50: '#FAFDF1',
        gray100: '#E8EED7',
        gray200: '#D4DBBC',
        gray300: '#B3BC94',
        gray400: '#919C77',
        gray500: '#6E795A',
        gray600: '#505942',
        gray700: '#363D2E',
        gray800: '#1B2116',
        gray900: '#0E120A',
        lightmode_primary: '#65A30D',
        lightmode_successText: '#215826',
        lightmode_successBorder: '#4F9B3A',
        lightmode_successBackground: '#E8F8DD',
        lightmode_dangerText: '#7B3021',
        lightmode_dangerBorder: '#DA6E59',
        lightmode_dangerBackground: '#FDE9E4',
        lightmode_secondaryText: '#334126',
        lightmode_secondaryBorder: '#D4DEC6',
        lightmode_secondaryBackground: '#F3F8EE',
        lightmode_warningText: '#754C0F',
        lightmode_warningBorder: '#CA9434',
        lightmode_warningBackground: '#FFF3D9',
        lightmode_infoText: '#215A48',
        lightmode_infoBorder: '#49B98F',
        lightmode_infoBackground: '#E2F8EE',
        lightmode_textPrimary: '#1B2415',
        lightmode_textMuted: '#66725A',
        lightmode_surfaceBase: '#F8FBF2',
        lightmode_surfaceElevated: '#FFFFFF',
        lightmode_surfaceCard: '#F2F7EC',
        lightmode_surfaceOverlay: '#EAF1E0',
        lightmode_borderColor: '#D9E3CC',
        lightmode_borderStrong: '#C0CFB1',
        lightmode_gray50: '#0E120A',
        lightmode_gray100: '#222B18',
        lightmode_gray200: '#364628',
        lightmode_gray300: '#55684A',
        lightmode_gray400: '#728564',
        lightmode_gray500: '#95A68A',
        lightmode_gray600: '#BFCEB5',
        lightmode_gray700: '#DCE8D4',
        lightmode_gray800: '#EFF5EA',
        lightmode_gray900: '#FFFFFF',
    },
};

export const FLASH_COLOR_SCHEMAS: FlashColorSchemaDefinition[] = [
    {
        id: 'custom',
        label: 'Custom',
        description: 'Keep the current values and tune every token manually.',
        values: {},
    },
    cyanSchema,
    limeSchema,
];

export const FLASH_COLOR_SCHEMA_OPTIONS = FLASH_COLOR_SCHEMAS.map((schema) => ({
    label: schema.label,
    value: schema.id,
}));

export const getFlashColorSchema = (schemaId: unknown): FlashColorSchemaDefinition => {
    const normalized = String(schemaId || 'custom').trim().toLowerCase();
    return FLASH_COLOR_SCHEMAS.find((schema) => schema.id === normalized) || FLASH_COLOR_SCHEMAS[0];
};

export const getFlashColorSchemaValue = (
    schemaId: unknown,
    field: FlashColorSchemaField
): string | undefined => getFlashColorSchema(schemaId).values[field];

export const applyFlashColorSchema = (
    state: Record<string, string>,
    schemaId: unknown,
    overwriteExisting = true
): Record<string, string> => {
    const schema = getFlashColorSchema(schemaId);
    const nextState: Record<string, string> = { ...state, colorSchemaPreset: schema.id };

    FLASH_COLOR_SCHEMA_FIELDS.forEach((field) => {
        const presetValue = schema.values[field];
        if (!presetValue) {
            return;
        }

        const currentValue = String(nextState[field] ?? '').trim();
        if (overwriteExisting || currentValue === '') {
            nextState[field] = presetValue;
        }
    });

    return nextState;
};
