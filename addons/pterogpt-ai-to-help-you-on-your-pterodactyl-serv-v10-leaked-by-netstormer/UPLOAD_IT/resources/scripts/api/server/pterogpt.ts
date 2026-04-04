import http from '@/api/http';

export interface PteroGPTConfig {
    enabled: boolean;
    ui_mode: 'panel' | 'modal';
    model_mode: 'fixed' | 'list';
    model?: string;
    models?: string[];
}

export interface RateLimits {
    chat: { used: number; limit: number; remaining: number };
    read: { used: number; limit: number; remaining: number };
    write: { used: number; limit: number; remaining: number };
    command: { used: number; limit: number; remaining: number };
}

export interface ChatContext {
    console_lines?: string;
    file_path?: string;
    file_content?: string;
}

export interface ConversationMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatResponse {
    response: string;
}

export const getConfig = async (uuid: string): Promise<PteroGPTConfig> => {
    const { data } = await http.get(`/api/client/servers/${uuid}/pterogpt/config`);
    return data.data;
};

export const getLimits = async (uuid: string): Promise<RateLimits> => {
    const { data } = await http.get(`/api/client/servers/${uuid}/pterogpt/limits`);
    return data.data;
};

export const sendChat = async (
    uuid: string,
    message: string,
    context?: ChatContext,
    conversationHistory?: ConversationMessage[],
    model?: string
): Promise<ChatResponse> => {
    const { data } = await http.post(`/api/client/servers/${uuid}/pterogpt/chat`, {
        message,
        context,
        conversation_history: conversationHistory,
        model,
    });
    return data.data;
};