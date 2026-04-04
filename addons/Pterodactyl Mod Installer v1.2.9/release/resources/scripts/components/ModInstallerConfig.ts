import tw, { TwStyle } from 'twin.macro';

interface DataType {
    style: {
        [style: string]: {
            buttonUninstall?: TwStyle;
            buttonUpdate?: TwStyle;
            buttonInstall?: TwStyle;
            openExternal?: TwStyle;
            versionsButton?: TwStyle;
            entryStyle?: TwStyle;
            rounding?: string;
            primaryColor?: string;
            secondaryColor?: string;
            inputBorder?: string;
        };
    };
    config: {
        amountPerPage: number;
    };
}

/**
 * Find tailwind styles here: https://tailwindcss.com/
 * If you have any questions ask in the support Discord
 */
const data: DataType = {
    style: {
        default: {
            buttonUninstall: tw`text-lg bg-red-700 hover:bg-red-800 text-white rounded-lg p-1 mx-auto w-full border-2 border-red-500`,
            buttonUpdate: tw`text-lg bg-yellow-700 hover:bg-yellow-800 text-white rounded-lg p-1 mx-auto w-full border-2 border-yellow-500`,
            buttonInstall: tw`text-lg bg-green-500 hover:bg-green-400 text-white rounded-lg p-1 mx-auto w-full border-2 border-green-600`,
            openExternal: tw`w-10 h-10 ml-2 bg-indigo-600 hover:bg-indigo-700 border-2 border-indigo-500 rounded-lg`,
            versionsButton: tw`rounded-lg p-1 mx-auto w-full text-lg bg-gray-600 hover:bg-indigo-500 text-white mt-4`,
            entryStyle: tw`rounded-lg hover:ring-2 ring-gray-500 bg-neutral-700`,
            rounding: 'rounded-lg',
            primaryColor: '#3f4d5a',
            secondaryColor: '#6b7280',
            inputBorder: '0',
        },
        dark: {
            buttonUninstall: tw`text-lg bg-red-700 hover:bg-red-800 text-white rounded-lg p-1 mx-auto w-full border-2 border-red-500`,
            buttonUpdate: tw`text-lg bg-yellow-700 hover:bg-yellow-800 text-white rounded-lg p-1 mx-auto w-full border-2 border-yellow-500`,
            buttonInstall: tw`text-lg bg-green-500 hover:bg-green-400 text-white rounded-lg p-1 mx-auto w-full border-2 border-green-600`,
            openExternal: tw`w-10 h-10 ml-2 bg-indigo-600 hover:bg-indigo-700 border-2 border-indigo-500 rounded-lg`,
            versionsButton: tw`rounded-lg p-1 mx-auto w-full text-lg bg-gray-600 hover:bg-indigo-500 text-white mt-4`,
            entryStyle: tw`rounded-lg hover:ring-2 ring-gray-500`,
            rounding: 'rounded-full',
            primaryColor: '#202020',
            secondaryColor: '#101010',
            inputBorder: '2',
        },
    },
    config: {
        amountPerPage: 16,
    },
};

const style = data.style['default'];
const config = data.config;

export { style, config };
