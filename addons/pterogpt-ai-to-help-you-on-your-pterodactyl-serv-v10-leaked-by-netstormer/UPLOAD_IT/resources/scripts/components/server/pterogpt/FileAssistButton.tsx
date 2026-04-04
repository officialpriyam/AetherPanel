import React from 'react';
import tw from 'twin.macro';
import styled from 'styled-components';
import { usePteroGPTContext } from './PteroGPTProvider';

const Button = styled.button`
    ${tw`bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1`}
`;

interface Props {
    filePath: string;
    fileContent: string;
}

export const FileAssistButton: React.FC<Props> = ({ filePath, fileContent }) => {
    const { config, setIsOpen, setFileContext } = usePteroGPTContext();

    if (!config?.enabled) {
        return null;
    }

    const handleClick = () => {
        setFileContext({ path: filePath, content: fileContent });
        setIsOpen(true);
    };

    return (
        <Button onClick={handleClick} title="Get AI assistance for this file">
            AI Help
        </Button>
    );
};