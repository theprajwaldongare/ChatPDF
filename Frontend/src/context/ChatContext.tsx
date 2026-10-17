import { createContext,useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface ChatHistoryItem{
    id: string;
    name: string;
}

interface ChatContextType {
    history: ChatHistoryItem[];
    refreshHistory: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({children}: {children: ReactNode}) {
    const [history, setHistory] = useState<ChatHistoryItem[]>([]);

    const refreshHistory = useCallback(async () => {
        const allChats: ChatHistoryItem[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('chat_')) {
                try {
                    const chatData = JSON.parse(localStorage.getItem(key) || '{}');
                    allChats.push({ id: chatData.id, name: chatData.name});
                } catch (error) {
                    console.error(`Error parsing chat data for key ${key}:`, error);
                }
            }
        }
        setHistory(allChats);
    }, []);

    useEffect(() => {
        refreshHistory();
    }, []);

    return (
        <ChatContext.Provider value={{ history, refreshHistory }}>
            {children}
        </ChatContext.Provider>
    );
}

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
};