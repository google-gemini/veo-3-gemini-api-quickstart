import React, { useEffect, useState } from "react";
import { Image as ImageIcon, Maximize2, Plus, Trash2, Play, RotateCcw, Upload, Search } from "lucide-react";
import Image from "next/image";
import { useImagePreview } from "@/context/ImagePreviewContext";

interface AlbumItem {
    id: string;
    label: string;
    image: string;
    prompt: string;
    selected?: boolean;
}

interface AlbumSample {
    id: string;
    label: string;
    image: string;
    images: AlbumItem[];
}

interface AlbumComposerControlsProps {
    onAlbumItemsChange: (items: AlbumItem[]) => void;
    onThemeSelect: (themeImage: string) => void;
    onSourceImageChange: (file: File | null) => void;
    onGenerate: () => void;
    isGenerating: boolean;
    className?: string;
}

export default function AlbumComposerControls({
    onAlbumItemsChange,
    onThemeSelect,
    onSourceImageChange,
    onGenerate,
    isGenerating,
    className = "",
}: AlbumComposerControlsProps) {
    const { openPreview } = useImagePreview();
    const [samples, setSamples] = useState<AlbumSample[]>([]);
    const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
    const [items, setItems] = useState<AlbumItem[]>([]);
    const [sourceImage, setSourceImage] = useState<File | null>(null);
    const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch samples on mount
    useEffect(() => {
        fetch("/prompt-album.json")
            .then(res => res.json())
            .then(data => setSamples(data))
            .catch(err => console.error("Failed to load album prompts:", err));
    }, []);

    useEffect(() => {
        onAlbumItemsChange(items.filter(p => p.prompt.trim() !== "" && p.selected !== false));
    }, [items, onAlbumItemsChange]);

    useEffect(() => {
        if (sourceImage) {
            const url = URL.createObjectURL(sourceImage);
            setSourceImageUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setSourceImageUrl(null);
        }
    }, [sourceImage]);

    const handleSampleSelect = (sample: AlbumSample) => {
        if (selectedSampleId === sample.id) {
            setSelectedSampleId(null);
            onThemeSelect("");
            setItems([]);
        } else {
            setSelectedSampleId(sample.id);
            onThemeSelect(sample.image);
            // Load items from the album with selected=true by default
            setItems(sample.images.map(img => ({ ...img, selected: true })));
        }
    };

    const handleSourceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSourceImage(file);
            onSourceImageChange(file);
        }
    };

    const handleAddPrompt = () => {
        setItems([...items, { id: Date.now().toString(), label: "Custom", image: "", prompt: "", selected: true }]);
    };

    const handleRemovePrompt = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handlePromptChange = (index: number, value: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], prompt: value };
        setItems(newItems);
    };

    const handleSelectionChange = (index: number, checked: boolean) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], selected: checked };
        setItems(newItems);
    };

    const handleReset = () => {
        setSelectedSampleId(null);
        onThemeSelect("");
        setItems([]);
        setSourceImage(null);
        onSourceImageChange(null);
    }

    const handleOpenPreview = (e: React.MouseEvent, image: string) => {
        e.stopPropagation();
        openPreview(image);
    };

    return (
        <div className={`bg-white/80 dark:bg-black/60 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-xl text-slate-800 dark:text-slate-100 overflow-y-auto max-h-[80vh] ${className}`}>
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white/5 backdrop-blur-md p-2 -mx-2 rounded-lg z-10">
                <h3 className="text-sm font-semibold uppercase tracking-wider opacity-70">
                    Album Composer
                </h3>
                <button
                    onClick={handleReset}
                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                    title="Reset all"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-6">
                {/* Source Image Upload */}
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs mb-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Source Image (Subject)</span>
                    </div>
                    <div
                        className={`relative aspect-video rounded-lg border-2 border-dashed transition-colors cursor-pointer overflow-hidden ${sourceImage ? "border-indigo-500/50 bg-indigo-500/5" : "border-white/20 hover:border-white/40 hover:bg-white/5"
                            }`}
                        onClick={() => document.getElementById("album-source-upload")?.click()}
                    >
                        {sourceImageUrl ? (
                            <Image
                                src={sourceImageUrl}
                                alt="Source"
                                fill
                                className="object-contain"
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-xs opacity-50 gap-2">
                                <Upload className="w-6 h-6" />
                                <span>Click to upload source image</span>
                            </div>
                        )}
                        <input
                            id="album-source-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleSourceImageUpload}
                        />
                    </div>
                </div>

                <div className="h-px bg-white/10" />

                {/* Theme Selection */}
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs mb-1.5">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Select Album Style</span>
                    </div>
                    <div className="relative mb-2">
                        <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search styles..."
                            className="w-full pl-8 pr-2 py-1.5 text-xs border border-white/10 rounded-md bg-black/20 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    {samples.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                            {samples
                                .filter(s =>
                                    !searchQuery ||
                                    s.label.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map((sample) => (
                                    <div
                                        key={sample.id}
                                        onClick={() => handleSampleSelect(sample)}
                                        className={`relative aspect-square rounded-lg overflow-hidden border cursor-pointer group ${selectedSampleId === sample.id
                                            ? "ring-2 ring-indigo-500 border-transparent"
                                            : "border-white/10 hover:border-white/30"
                                            }`}
                                    >
                                        <Image
                                            src={sample.image}
                                            alt={sample.label}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <Maximize2
                                                className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md absolute top-2 right-2"
                                                onClick={(e) => handleOpenPreview(e, sample.image)}
                                            />
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-[10px] text-white truncate">
                                            {sample.label}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div className="text-xs opacity-50">Loading albums...</div>
                    )}
                </div>

                <div className="h-px bg-white/10" />

                {/* Prompts Input */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Prompts for Album</span>
                        </div>
                        <button
                            onClick={handleAddPrompt}
                            className="text-indigo-500 hover:text-indigo-400 flex items-center gap-1"
                        >
                            <Plus className="w-3 h-3" /> Add
                        </button>
                    </div>

                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <div key={index} className="flex gap-2 items-start">
                                <div className="pt-2">
                                    <input
                                        type="checkbox"
                                        checked={item.selected !== false}
                                        onChange={(e) => handleSelectionChange(index, e.target.checked)}
                                        className="cursor-pointer"
                                    />
                                </div>
                                {item.image && (
                                    <div className="w-8 h-8 relative rounded overflow-hidden shrink-0 mt-1 border border-white/20">
                                        <Image src={item.image} alt="Style" fill className="object-cover" />
                                    </div>
                                )}
                                <input
                                    type="text"
                                    value={item.prompt}
                                    onChange={(e) => handlePromptChange(index, e.target.value)}
                                    placeholder={`Prompt ${index + 1}...`}
                                    className={`flex-1 text-xs p-2 rounded-md border border-white/20 bg-white/40 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${item.selected === false ? "opacity-50" : ""}`}
                                />
                                {items.length > 1 && (
                                    <button
                                        onClick={() => handleRemovePrompt(index)}
                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-md"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                        {items.length === 0 && (
                            <div className="text-xs opacity-50 text-center py-4 border border-dashed border-white/20 rounded-lg">
                                Select an album to load prompts
                            </div>
                        )}
                    </div>
                </div>

                <div className="h-px bg-white/10" />

                <button
                    onClick={onGenerate}
                    disabled={isGenerating || !selectedSampleId || !sourceImage || items.every(p => !p.prompt.trim())}
                    className={`w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${isGenerating || !selectedSampleId || !sourceImage || items.every(p => !p.prompt.trim())
                        ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/25"
                        }`}
                >
                    {isGenerating ? (
                        <>Generating...</>
                    ) : (
                        <>
                            <Play className="w-4 h-4 fill-current" />
                            Generate Album
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
