import React, { useState } from "react";
import { Book, Trash2, Plus, X, Check, Search } from "lucide-react";
import { usePromptLibrary, SavedPrompt } from "@/hooks/usePromptLibrary";

interface PromptLibraryProps {
    onSelectPrompt: (text: string) => void;
    currentPrompt: string;
}

export const PromptLibrary: React.FC<PromptLibraryProps> = ({
    onSelectPrompt,
    currentPrompt,
}) => {
    const { savedPrompts, savePrompt, deletePrompt } = usePromptLibrary();
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newPromptName, setNewPromptName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const handleSave = () => {
        if (!newPromptName.trim() || !currentPrompt.trim()) return;
        savePrompt(currentPrompt, newPromptName);
        setNewPromptName("");
        setIsSaving(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`h-10 w-10 flex items-center justify-center rounded-full transition-colors ${isOpen ? "bg-indigo-100 text-indigo-600" : "bg-white/50 hover:bg-white/70 text-slate-700"
                    }`}
                title="Saved Prompts"
            >
                <Book className="w-5 h-5" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute bottom-12 left-0 z-50 w-80 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-96">
                        <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                            <h3 className="font-medium text-sm text-slate-700 dark:text-slate-200">
                                Prompt Library
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-2 top-1.5 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search prompts..."
                                    className="w-full pl-7 pr-2 py-1 text-xs border rounded bg-slate-50 dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            {isSaving ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newPromptName}
                                        onChange={(e) => setNewPromptName(e.target.value)}
                                        placeholder="Name this prompt..."
                                        className="flex-1 px-2 py-1 text-sm border rounded dark:bg-slate-800 dark:border-slate-700"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSave();
                                            if (e.key === 'Escape') setIsSaving(false);
                                        }}
                                    />
                                    <button
                                        onClick={handleSave}
                                        disabled={!newPromptName.trim()}
                                        className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setIsSaving(false)}
                                        className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsSaving(true)}
                                    disabled={!currentPrompt.trim()}
                                    className="w-full flex items-center justify-center gap-2 py-1.5 text-sm bg-indigo-5 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Save Current Prompt
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {savedPrompts
                                .filter(p =>
                                    !searchQuery ||
                                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    p.text.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-xs">
                                    {searchQuery ? "No matching prompts found." : "No saved prompts yet."}
                                </div>
                            ) : (
                                savedPrompts
                                    .filter(p =>
                                        !searchQuery ||
                                        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        p.text.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map((prompt) => (
                                        <div
                                            key={prompt.id}
                                            className="group flex items-start gap-2 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                        >
                                            <button
                                                onClick={() => {
                                                    onSelectPrompt(prompt.text);
                                                    setIsOpen(false);
                                                }}
                                                className="flex-1 text-left"
                                            >
                                                <div className="font-medium text-sm text-slate-700 dark:text-slate-200">
                                                    {prompt.name}
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                                                    {prompt.text}
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => deletePrompt(prompt.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
