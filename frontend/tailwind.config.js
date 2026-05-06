const colors = require('tailwindcss/colors');

const gray = {
    50: 'var(--gray50)',
    100: 'var(--gray100)',
    200: 'var(--gray200)',
    300: 'var(--gray300)',
    400: 'var(--gray400)',
    500: 'var(--gray500)',
    600: 'var(--gray600)',
    700: 'var(--gray700)',
    800: 'var(--gray800)',
    900: 'var(--gray900)',
};

module.exports = {
    content: [
        './app/**/*.{js,ts,tsx}',
        './src/scripts/**/*.{js,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                header: ['"IBM Plex Sans"', '"Roboto"', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                box: 'var(--radiusBox)',
                component: 'var(--radiusInput)'
            },
            colors: {
                black: '#131a20',
                // "primary" and "neutral" are deprecated, prefer the use of "blue" and "gray"
                // in new code.
                flash: 'var(--primary)',
                spark: 'var(--primary)',
                success: {
                    50: 'var(--successText)',
                    100: 'var(--successBorder)',
                    200: 'var(--successBackground)'
                },
                danger: {
                    50: 'var(--dangerText)',
                    100: 'var(--dangerBorder)',
                    200: 'var(--dangerBackground)'
                },
                secondary: {
                    50: 'var(--secondaryText)',
                    100: 'var(--secondaryBorder)',
                    200: 'var(--secondaryBackground)'
                },
                primary: {
                    DEFAULT: 'var(--primary)',
                    50: 'var(--primary-50, var(--primary))',
                    100: 'var(--primary-100, var(--primary))',
                    200: 'var(--primary-200, var(--primary))',
                    300: 'var(--primary-300, var(--primary))',
                    400: 'var(--primary-400, var(--primary))',
                    500: 'var(--primary-500, var(--primary))',
                    600: 'var(--primary-600, var(--primary))',
                    700: 'var(--primary-700, var(--primary))',
                    800: 'var(--primary-800, var(--primary))',
                    900: 'var(--primary-900, var(--primary))',
                    950: 'var(--primary-950, var(--primary))',
                },
                gray: gray,
                neutral: gray,
                cyan: colors.cyan,
            },
            fontSize: {
                '2xs': '0.625rem',
            },
            transitionDuration: {
                250: '250ms',
            },
            borderColor: theme => ({
                default: theme('colors.neutral.400', 'currentColor'),
            }),
        },
    },
    plugins: [
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
    ]
};

