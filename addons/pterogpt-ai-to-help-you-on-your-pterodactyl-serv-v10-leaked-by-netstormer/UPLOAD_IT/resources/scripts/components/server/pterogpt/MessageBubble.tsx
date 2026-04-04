import React from 'react';
import tw from 'twin.macro';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const UserMessage = styled.div`
    ${tw`bg-neutral-700 text-neutral-100 rounded-lg px-4 py-3 mb-3`}
    max-width: 100%;
    overflow-wrap: break-word;
    word-wrap: break-word;
    &::before {
        content: 'You';
        ${tw`block text-xs text-cyan-400 mb-2 font-semibold uppercase tracking-wide`}
    }
`;

const AssistantMessage = styled.div`
    ${tw`bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-lg px-4 py-3 mb-3`}
    max-width: 100%;
    overflow-wrap: break-word;
    word-wrap: break-word;
    &::before {
        content: 'Assistant';
        ${tw`block text-xs text-neutral-400 mb-2 font-semibold uppercase tracking-wide`}
    }
`;

const MessageContent = styled.div`
    ${tw`text-sm leading-relaxed`}
    max-width: 100%;
    overflow-wrap: break-word;
    word-wrap: break-word;
    /* Markdown styling */
    p {
        ${tw`mb-2 last:mb-0`}
        overflow-wrap: break-word;
        word-wrap: break-word;
    }
    code {
        ${tw`bg-black bg-opacity-50 rounded px-1 py-0.5 text-xs font-mono text-cyan-300`}
        overflow-wrap: break-word;
        word-wrap: break-word;
    }
    pre {
        ${tw`bg-black bg-opacity-50 rounded p-3 mb-2`}
        overflow-x: auto;
        max-width: 100%;
        code {
            ${tw`p-0 bg-transparent text-neutral-300`}
            white-space: pre;
        }
    }
    ul, ol {
        ${tw`ml-4 mb-2 space-y-1`}
    }
    li {
        ${tw`text-sm`}
    }
    strong {
        ${tw`font-semibold text-neutral-100`}
    }
    em {
        ${tw`italic text-neutral-300`}
    }
    h1, h2, h3, h4, h5, h6 {
        ${tw`font-semibold text-neutral-100 mb-2 mt-3 first:mt-0`}
    }
    h1 { ${tw`text-lg`} }
    h2 { ${tw`text-base`} }
    h3 { ${tw`text-sm`} }
    blockquote {
        ${tw`border-l-4 border-neutral-600 pl-3 italic text-neutral-400 mb-2`}
    }
    a {
        ${tw`text-cyan-400 hover:text-cyan-300 underline`}
    }
    hr {
        ${tw`border-neutral-700 my-3`}
    }
    table {
        ${tw`border-collapse mb-2 text-sm`}
        width: 100%;
        max-width: 100%;
        display: block;
        overflow-x: auto;
    }
    th, td {
        ${tw`border border-neutral-700 px-2 py-1 text-left`}
        overflow-wrap: break-word;
        word-wrap: break-word;
    }
    th {
        ${tw`bg-neutral-700 font-semibold`}
    }
`;

interface Props {
    role: 'user' | 'assistant';
    content: string;
}

export const MessageBubble: React.FC<Props> = ({ role, content }) => {
    const Message = role === 'user' ? UserMessage : AssistantMessage;

    return (
        <Message>
            <MessageContent>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </MessageContent>
        </Message>
    );
};