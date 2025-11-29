import React, { useEffect, useState, useMemo } from "react";
import { Layers, LayoutGrid, Palette, Wand2, RotateCcw, Grid, Columns, Rows, UserCheck, Lightbulb, Type, Image as ImageIcon, Maximize2, Search } from "lucide-react";
import Image from "next/image";
import { useImagePreview } from "@/context/ImagePreviewContext";

import { PromptLibrary } from "@/components/ui/PromptLibrary";

interface ImageComposerControlsProps {
    onPromptChange: (prompt: string) => void;
    className?: string;
    onGenerate?: () => void;
    isGenerating?: boolean;
    canGenerate?: boolean;
    onSampleSelect?: (sample: SamplePrompt | null) => void;
}

const COMPOSITION_STYLES = [
    { value: "blend", label: "Blend", desc: "Seamlessly blend images" },
    { value: "collage", label: "Collage", desc: "Artistic arrangement" },
    { value: "style_transfer", label: "Style Transfer", desc: "Apply style to content" },
    { value: "subject_placement", label: "Subject Placement", desc: "Place subject in background" },
];

const VIBES = [
    { value: "realistic", label: "Realistic" },
    { value: "artistic", label: "Artistic" },
    { value: "fantasy", label: "Fantasy" },
    { value: "cinematic", label: "Cinematic" },
];

interface SamplePrompt {
    id: string;
    label: string;
    image: string;
    prompt: string;
    alias?: string;
}

interface PromptGroup {
    id: string;
    label: string;
    items: SamplePrompt[];
}

export default function ImageComposerControls({
    onPromptChange,
    className = "",
    onGenerate,
    isGenerating = false,
    canGenerate = false,
    onSampleSelect,
}: ImageComposerControlsProps) {
    const { openPreview } = useImagePreview();
    const [compositionStyle, setCompositionStyle] = useState("");
    const [layout, setLayout] = useState("grid");
    const [vibe, setVibe] = useState("realistic");
    const [density, setDensity] = useState(50); // 0 to 100

    // Nano Banana Features
    const [characterConsistency, setCharacterConsistency] = useState(false);
    const [matchLighting, setMatchLighting] = useState(false);
    const [textIntegration, setTextIntegration] = useState("");

    // Samples
    const [promptGroups, setPromptGroups] = useState<PromptGroup[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Derived samples based on selected group
    const samples = useMemo(() => {
        return selectedGroupId
            ? promptGroups.find(g => g.id === selectedGroupId)?.items || []
            : [];
    }, [selectedGroupId, promptGroups]);

    // Fetch samples on mount
    useEffect(() => {
        fetch("/prompt.json")
            .then(res => res.json())
            .then((data: PromptGroup[]) => {
                setPromptGroups(data);
                if (data.length > 0) {
                    setSelectedGroupId(data[0].id);
                }
            })
            .catch(err => console.error("Failed to load prompts:", err));
    }, []);

    // Generate prompt whenever values change
    useEffect(() => {
        const parts = [];

        // If a sample is selected, start with its prompt
        if (selectedSampleId) {
            const sample = samples.find(s => s.id === selectedSampleId);
            if (sample) {
                parts.push(sample.alias || sample.prompt);
            }
        } else {
            // Otherwise start with composition style
            if (compositionStyle === "blend") {
                parts.push("Seamlessly blend these images together into a cohesive scene");
            } else if (compositionStyle === "collage") {
                parts.push("Create an artistic collage of these images");
                // Layout (only for collage)
                if (layout === "grid") parts.push("arrange in a grid layout");
                else if (layout === "horizontal") parts.push("arrange horizontally side-by-side");
                else if (layout === "vertical") parts.push("arrange vertically stacked");
            } else if (compositionStyle === "style_transfer") {
                parts.push("Apply the artistic style of the first image to the content of the other images");
            } else if (compositionStyle === "subject_placement") {
                parts.push("Place the subject from the first image into the background of the second image");
            }
        }

        // Append enhancements from controls
        // We only append if they are explicitly set/changed from defaults or if we are enhancing a sample
        // For simplicity, we always check the current state of controls.

        // Nano Banana Features
        if (characterConsistency) {
            parts.push("maintain the exact appearance and identity of the character from the first image");
        }
        if (matchLighting) {
            parts.push("harmonize the lighting, shadows, and perspective across all elements");
        }
        if (textIntegration.trim()) {
            parts.push(`render the text '${textIntegration}' clearly in the image in a stylish font`);
        }

        // Vibe (only if not default "realistic" OR if we are enhancing a sample)
        if (vibe !== "realistic") {
            parts.push(`make it look ${vibe}`);
        }

        // Density (only if extreme values)
        if (density < 30) {
            parts.push("keep the composition minimalist and clean");
        } else if (density > 70) {
            parts.push("make the composition highly detailed and complex");
        }

        // Join parts. If using a sample, ensure we don't duplicate if the sample already contains the text.
        // A simple join is usually fine for prompts as models handle redundancy well.
        const prompt = parts.join(". ") + ".";
        onPromptChange(prompt);
    }, [compositionStyle, layout, vibe, density, characterConsistency, matchLighting, textIntegration, selectedSampleId, samples, onPromptChange]);

    const handleReset = () => {
        setCompositionStyle("");
        setLayout("grid");
        setVibe("realistic");
        setDensity(50);
        setCharacterConsistency(false);
        setMatchLighting(false);
        setTextIntegration("");
        setSelectedSampleId(null);
        onSampleSelect?.(null);
    };

    const handleSampleSelect = (sample: SamplePrompt) => {
        if (selectedSampleId === sample.id) {
            setSelectedSampleId(null); // Deselect
            onSampleSelect?.(null);
        } else {
            setSelectedSampleId(sample.id);
            onSampleSelect?.(sample);
        }
    };

    const handleOpenPreview = (e: React.MouseEvent, image: string) => {
        e.stopPropagation();
        openPreview(image);
    };

    return (
        <>
            <div
                className={`bg-white/80 dark:bg-black/60 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-xl text-slate-800 dark:text-slate-100 overflow-y-auto max-h-[80vh] ${className}`}
            >
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-white/5 backdrop-blur-md p-2 -mx-2 rounded-lg z-10">
                    <h3 className="text-sm font-semibold uppercase tracking-wider opacity-70">
                        Image Composer
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleReset}
                            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                            title="Reset all"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                        <PromptLibrary
                            currentPrompt={""}
                            onSelectPrompt={(text) => onPromptChange(text)}
                        />
                    </div>
                </div>

                <div className="space-y-6">

                    {/* Sample Prompts - Vertical List */}
                    {samples.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-xs mb-1.5">
                                <ImageIcon className="w-3.5 h-3.5" />
                                <span>Inspiration</span>
                            </div>

                            {/* Group Selector */}
                            {promptGroups.length > 0 && (
                                <div className="flex gap-1 mb-2 overflow-x-auto pb-1 no-scrollbar">
                                    {promptGroups.map(group => (
                                        <button
                                            key={group.id}
                                            onClick={() => setSelectedGroupId(group.id)}
                                            className={`px-2 py-1 text-[10px] rounded-full whitespace-nowrap transition-colors ${selectedGroupId === group.id
                                                ? "bg-indigo-500 text-white"
                                                : "bg-white/10 text-slate-400 hover:bg-white/20"
                                                }`}
                                        >
                                            {group.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="relative mb-2">
                                <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search inspiration..."
                                    className="w-full pl-8 pr-2 py-1.5 text-xs border border-white/10 rounded-md bg-black/20 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                {samples
                                    .filter(s =>
                                        !searchQuery ||
                                        s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        s.prompt.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map((sample) => (
                                        <div
                                            key={sample.id}
                                            onClick={() => handleSampleSelect(sample)}
                                            className={`flex items-center gap-3 p-2 rounded-lg border transition-all group cursor-pointer ${selectedSampleId === sample.id
                                                ? "bg-indigo-500/10 border-indigo-500 ring-1 ring-indigo-500"
                                                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30"
                                                }`}
                                        >
                                            <div
                                                className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-slate-800 group/image"
                                                onClick={(e) => handleOpenPreview(e, sample.image)}
                                            >
                                                <Image
                                                    src={sample.image}
                                                    alt={sample.label}
                                                    fill
                                                    className="object-cover transition-transform group-hover/image:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors flex items-center justify-center">
                                                    <Maximize2 className="w-4 h-4 text-white opacity-0 group-hover/image:opacity-100 transition-opacity drop-shadow-md" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-medium truncate">{sample.label}</div>
                                                <div className="text-[10px] opacity-60 line-clamp-2 leading-tight mt-0.5">
                                                    {sample.alias || sample.prompt}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    <div className="h-px bg-white/10" />

                    {/* Composition Style */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs mb-1.5">
                            <Layers className="w-3.5 h-3.5" />
                            <span>Composition Mode</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {COMPOSITION_STYLES.map((s) => (
                                <button
                                    key={s.value}
                                    onClick={() => {
                                        setSelectedSampleId(null); // Switching base mode clears sample
                                        onSampleSelect?.(null);
                                        setCompositionStyle(s.value);
                                    }}
                                    className={`text-xs py-2 px-3 rounded-md border text-left transition-all ${compositionStyle === s.value && !selectedSampleId
                                        ? "bg-indigo-500 text-white border-indigo-600 shadow-sm"
                                        : "bg-white/40 border-transparent hover:bg-white/60 text-slate-700"
                                        }`}
                                >
                                    <div className="font-medium">{s.label}</div>
                                    <div className="text-[10px] opacity-80">{s.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Layout (Conditional) */}
                    {compositionStyle === "collage" && !selectedSampleId && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center gap-1.5 text-xs mb-1.5">
                                <LayoutGrid className="w-3.5 h-3.5" />
                                <span>Layout</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setLayout("grid")}
                                    className={`flex-1 p-2 rounded-md border flex justify-center ${layout === "grid"
                                        ? "bg-indigo-500 text-white border-indigo-600"
                                        : "bg-white/40 border-transparent hover:bg-white/60 text-slate-700"
                                        }`}
                                    title="Grid"
                                >
                                    <Grid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setLayout("horizontal")}
                                    className={`flex-1 p-2 rounded-md border flex justify-center ${layout === "horizontal"
                                        ? "bg-indigo-500 text-white border-indigo-600"
                                        : "bg-white/40 border-transparent hover:bg-white/60 text-slate-700"
                                        }`}
                                    title="Horizontal"
                                >
                                    <Columns className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setLayout("vertical")}
                                    className={`flex-1 p-2 rounded-md border flex justify-center ${layout === "vertical"
                                        ? "bg-indigo-500 text-white border-indigo-600"
                                        : "bg-white/40 border-transparent hover:bg-white/60 text-slate-700"
                                        }`}
                                    title="Vertical"
                                >
                                    <Rows className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="h-px bg-white/10" />

                    {/* Advanced Features (Nano Banana) */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-medium opacity-50 uppercase tracking-wider">Advanced Features</h4>

                        {/* Character Consistency */}
                        <button
                            onClick={() => setCharacterConsistency(!characterConsistency)}
                            className={`w-full flex items-center justify-between text-xs py-2 px-3 rounded-md border transition-all ${characterConsistency
                                ? "bg-indigo-500 text-white border-indigo-600"
                                : "bg-white/40 border-transparent hover:bg-white/60 text-slate-700"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Maintain Character Identity</span>
                            </div>
                            <div className={`w-8 h-4 rounded-full relative transition-colors ${characterConsistency ? "bg-white/30" : "bg-black/10"}`}>
                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${characterConsistency ? "left-4.5" : "left-0.5"}`} style={{ left: characterConsistency ? 'calc(100% - 14px)' : '2px' }} />
                            </div>
                        </button>

                        {/* Match Lighting */}
                        <button
                            onClick={() => setMatchLighting(!matchLighting)}
                            className={`w-full flex items-center justify-between text-xs py-2 px-3 rounded-md border transition-all ${matchLighting
                                ? "bg-indigo-500 text-white border-indigo-600"
                                : "bg-white/40 border-transparent hover:bg-white/60 text-slate-700"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Lightbulb className="w-3.5 h-3.5" />
                                <span>Harmonize Lighting</span>
                            </div>
                            <div className={`w-8 h-4 rounded-full relative transition-colors ${matchLighting ? "bg-white/30" : "bg-black/10"}`}>
                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${matchLighting ? "left-4.5" : "left-0.5"}`} style={{ left: matchLighting ? 'calc(100% - 14px)' : '2px' }} />
                            </div>
                        </button>

                        {/* Text Integration */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-xs mb-1.5">
                                <Type className="w-3.5 h-3.5" />
                                <span>Add Text</span>
                            </div>
                            <input
                                type="text"
                                value={textIntegration}
                                onChange={(e) => setTextIntegration(e.target.value)}
                                placeholder="Enter text to render..."
                                className="w-full text-xs p-2 rounded-md border border-white/20 bg-white/40 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-white/10" />

                    {/* Vibe */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs mb-1.5">
                            <Palette className="w-3.5 h-3.5" />
                            <span>Vibe / Style</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {VIBES.map((v) => (
                                <button
                                    key={v.value}
                                    onClick={() => setVibe(v.value)}
                                    className={`text-xs py-1.5 px-2 rounded-md border transition-all ${vibe === v.value
                                        ? "bg-indigo-500 text-white border-indigo-600"
                                        : "bg-white/40 border-transparent hover:bg-white/60 text-slate-700"
                                        }`}
                                >
                                    {v.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Density */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                                <Wand2 className="w-3.5 h-3.5" />
                                <span>Complexity</span>
                            </div>
                            <span className="opacity-70">
                                {density < 30 ? "Minimal" : density > 70 ? "Complex" : "Balanced"}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={density}
                            onChange={(e) => setDensity(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-500"
                        />
                    </div>

                    {onGenerate && (
                        <>
                            <div className="h-px bg-white/10" />
                            <button
                                onClick={onGenerate}
                                disabled={isGenerating || !canGenerate}
                                className={`w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${isGenerating || !canGenerate
                                    ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/25"
                                    }`}
                            >
                                {isGenerating ? (
                                    <>Generating...</>
                                ) : (
                                    <>
                                        <Wand2 className="w-4 h-4 fill-current" />
                                        Generate Composition
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>

        </>
    );
}
