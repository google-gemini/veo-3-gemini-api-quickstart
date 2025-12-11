import { useState, useEffect } from 'react';

export interface SavedPrompt {
    id: string;
    name: string;
    text: string;
    timestamp: number;
}

export function usePromptLibrary() {
    const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('savedPrompts');
        if (stored) {
            try {
                setSavedPrompts(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse saved prompts", e);
            }
        }
    }, []);

    const savePrompt = (text: string, name: string) => {
        const newPrompt: SavedPrompt = {
            id: Date.now().toString(),
            name,
            text,
            timestamp: Date.now(),
        };
        const updated = [newPrompt, ...savedPrompts];
        setSavedPrompts(updated);
        localStorage.setItem('savedPrompts', JSON.stringify(updated));
    };

    const deletePrompt = (id: string) => {
        const updated = savedPrompts.filter(p => p.id !== id);
        setSavedPrompts(updated);
        localStorage.setItem('savedPrompts', JSON.stringify(updated));
    };

    return {
        savedPrompts,
        savePrompt,
        deletePrompt,
    };
}
