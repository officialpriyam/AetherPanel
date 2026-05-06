import { FormField } from './config';

export const isPlainObject = (value: unknown): value is Record<string, any> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

export const normalizeApiPayload = (input: any): any => {
    if (input?.object === 'list' && Array.isArray(input.data)) {
        return input.data.map((entry: any) => normalizeApiPayload(entry));
    }

    if (input?.attributes && input?.object) {
        const normalizedAttributes = normalizeApiPayload(input.attributes);
        const normalizedRelationships = isPlainObject(input.relationships)
            ? Object.fromEntries(
                Object.entries(input.relationships).map(([key, value]) => [key, normalizeApiPayload(value)])
            )
            : undefined;

        const normalized = {
            ...normalizedAttributes,
            __object: input.object,
        };

        if (normalizedRelationships && Object.keys(normalizedRelationships).length > 0) {
            normalized.relationships = normalizedRelationships;

            Object.entries(normalizedRelationships).forEach(([key, value]) => {
                if (normalized[key] === undefined) {
                    normalized[key] = value;
                }
            });
        }

        return normalized;
    }

    if (Array.isArray(input)) {
        return input.map((entry) => normalizeApiPayload(entry));
    }

    if (isPlainObject(input)) {
        return Object.fromEntries(
            Object.entries(input).map(([key, value]) => [key, normalizeApiPayload(value)])
        );
    }

    return input;
};

export const getRelationItems = (value: any, key: string): any[] => {
    const relation = value?.relationships?.[key] ?? value?.[key];
    const normalized = normalizeApiPayload(relation);

    return Array.isArray(normalized) ? normalized : normalized ? [normalized] : [];
};

export const get = (value: any, path: string, fallback: any = ''): any => {
    const result = path.split('.').reduce<any>((carry, segment) => {
        if (carry === null || carry === undefined) {
            return undefined;
        }

        return carry[segment];
    }, value);

    return result ?? fallback;
};

export const toTitleCase = (value: string): string =>
    value
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (character) => character.toUpperCase());

export const formatScalar = (value: unknown): string => {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }

    if (Array.isArray(value)) {
        return value.length ? value.join(', ') : '—';
    }

    if (typeof value === 'object') {
        return JSON.stringify(value, null, 2);
    }

    return String(value);
};

export const isTruthy = (value: unknown): boolean => {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'number') {
        return value !== 0;
    }

    return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

export const fieldValueToInput = (field: FormField, value: unknown): string => {
    if (field.type === 'boolean') {
        return isTruthy(value) ? 'true' : 'false';
    }

    if (field.type === 'select' && (value === null || value === undefined || value === '')) {
        return field.options?.length ? String(field.options[0].value) : '';
    }

    if (field.type === 'list') {
        return Array.isArray(value) ? value.join('\n') : String(value ?? '');
    }

    return value === null || value === undefined ? '' : String(value);
};

export const inputToFieldValue = (field: FormField, value: string): any => {
    if (field.type === 'boolean') {
        return value === 'true';
    }

    if (field.type === 'number') {
        return value === '' ? '' : Number(value);
    }

    if (field.type === 'list') {
        return value
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);
    }

    return value;
};

export const buildInitialFieldState = (fields: FormField[], source: Record<string, any>): Record<string, string> =>
    fields.reduce<Record<string, string>>((state, field) => {
        state[field.key] = fieldValueToInput(field, source[field.key]);
        return state;
    }, {});

export const serializeFieldState = (fields: FormField[], state: Record<string, string>): Record<string, any> =>
    fields.reduce<Record<string, any>>((payload, field) => {
        payload[field.key] = inputToFieldValue(field, state[field.key] ?? '');
        return payload;
    }, {});

export const sortByLabel = <T extends Record<string, any>>(items: T[], key: string): T[] =>
    [...items].sort((left, right) => String(left[key] ?? '').localeCompare(String(right[key] ?? '')));

