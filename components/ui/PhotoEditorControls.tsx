import React, { useEffect, useState } from "react";
import { Sun, Contrast, Thermometer, Palette, RotateCcw, Eraser, Image as ImageIcon, Wand2 } from "lucide-react";

interface PhotoEditorControlsProps {
    onPromptChange: (prompt: string) => void;
    className?: string;
    onGenerate?: () => void;
    isGenerating?: boolean;
    canGenerate?: boolean;
}

const STYLES = [
    { value: "none", label: "Original" },
    { value: "cinematic", label: "Cinematic" },
    { value: "vintage", label: "Vintage" },
    { value: "black and white", label: "Black & White" },
    { value: "hdr", label: "HDR" },
    { value: "cyberpunk", label: "Cyberpunk" },
    { value: "pastel", label: "Pastel" },
    { value: "oil painting", label: "Oil Painting" },
    { value: "watercolor", label: "Watercolor" },
];

export default function PhotoEditorControls({
    onPromptChange,
    className = "",
    onGenerate,
    isGenerating = false,
    canGenerate = false,
}: PhotoEditorControlsProps) {
    const [brightness, setBrightness] = useState(0);
    const [contrast, setContrast] = useState(0);
    const [warmth, setWarmth] = useState(0);
    const [style, setStyle] = useState("none");

    // Advanced controls state
    const [backgroundAction, setBackgroundAction] = useState<string | null>(null);
    const [removalAction, setRemovalAction] = useState<string | null>(null);
    const [enhancementAction, setEnhancementAction] = useState<string | null>(null);

    // Generate prompt whenever values change
    useEffect(() => {
        const parts = [];

        // Brightness
        if (brightness !== 0) {
            const intensity = Math.abs(brightness);
            const direction = brightness > 0 ? "increase" : "decrease";
            const adj = intensity > 50 ? "significantly" : "slightly";
            parts.push(`${adj} ${direction} brightness`);
        }

        // Contrast
        if (contrast !== 0) {
            const intensity = Math.abs(contrast);
            const direction = contrast > 0 ? "increase" : "decrease";
            const adj = intensity > 50 ? "significantly" : "slightly";
            parts.push(`${adj} ${direction} contrast`);
        }

        // Warmth
        if (warmth !== 0) {
            const intensity = Math.abs(warmth);
            const direction = warmth > 0 ? "warmer" : "cooler";
            const adj = intensity > 50 ? "much" : "a bit";
            parts.push(`make the image ${adj} ${direction}`);
        }

        // Style
        if (style !== "none") {
            parts.push(`apply a ${style} style`);
        }

        // Background Actions
        if (backgroundAction === "remove") {
            parts.push("remove the background, keep the subject on a white background");
        } else if (backgroundAction === "blur") {
            parts.push("blur the background, shallow depth of field");
        } else if (backgroundAction === "bw") {
            parts.push("make the background black and white, keep the subject in color");
        }

        // Removal Actions
        if (removalAction === "people") {
            parts.push("remove all people from the background");
        } else if (removalAction === "text") {
            parts.push("remove any text or watermarks from the image");
        }

        // Enhancement Actions
        if (enhancementAction === "lighting") {
            parts.push("fix the lighting, make it balanced and professional");
        } else if (enhancementAction === "sharpen") {
            parts.push("make the image high resolution, sharp details, 4k");
        }

        // Base instruction if nothing selected, or combine parts
        const prompt =
            parts.length > 0
                ? `Edit this image: ${parts.join(", ")}.`
                : "";

        onPromptChange(prompt);
    }, [brightness, contrast, warmth, style, backgroundAction, removalAction, enhancementAction, onPromptChange]);

    const handleReset = () => {
        setBrightness(0);
        setContrast(0);
        setWarmth(0);
        setStyle("none");
        setBackgroundAction(null);
        setRemovalAction(null);
        setEnhancementAction(null);
    };

    return (
        <div
            className={`bg-white/80 dark:bg-black/60 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-xl text-slate-800 dark:text-slate-100 overflow-y-auto max-h-[80vh] ${className}`}
        >
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white/5 backdrop-blur-md p-2 -mx-2 rounded-lg z-10">
                <h3 className="text-sm font-semibold uppercase tracking-wider opacity-70">
                    Photo Editor
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
                {/* Basic Adjustments */}
                <div className="space-y-4">
                    <h4 className="text-xs font-medium opacity-50 uppercase tracking-wider">Adjustments</h4>

                    {/* Brightness */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                                <Sun className="w-3.5 h-3.5" />
                                <span>Brightness</span>
                            </div>
                            <span className="opacity-70">{brightness > 0 ? "+" : ""}{brightness}</span>
                        </div>
                        <input
                            type="range"
                            min="-100"
                            max="100"
                            value={brightness}
                            onChange={(e) => setBrightness(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-500"
                        />
                    </div>

                    {/* Contrast */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                                <Contrast className="w-3.5 h-3.5" />
                                <span>Contrast</span>
                            </div>
                            <span className="opacity-70">{contrast > 0 ? "+" : ""}{contrast}</span>
                        </div>
                        <input
                            type="range"
                            min="-100"
                            max="100"
                            value={contrast}
                            onChange={(e) => setContrast(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-500"
                        />
                    </div>

                    {/* Warmth */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                                <Thermometer className="w-3.5 h-3.5" />
                                <span>Warmth</span>
                            </div>
                            <span className="opacity-70">{warmth > 0 ? "+" : ""}{warmth}</span>
                        </div>
                        <div className="relative w-full h-1.5 bg-gradient-to-r from-blue-300 via-gray-200 to-orange-300 rounded-lg">
                            <input
                                type="range"
                                min="-100"
                                max="100"
                                value={warmth}
                                onChange={(e) => setWarmth(parseInt(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border border-gray-300 rounded-full shadow-sm pointer-events-none"
                                style={{ left: `${((warmth + 100) / 200) * 100}%`, transform: 'translate(-50%, -50%)' }}
                            />
                        </div>
                    </div>
                </div>

                <div className="h-px bg-white/10" />

                {/* Advanced Actions */}
                <div className="space-y-4">
                    <h4 className="text-xs font-medium opacity-50 uppercase tracking-wider">Advanced Tools</h4>

                    {/* Background */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs mb-1.5">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Background</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <button
                                onClick={() => setBackgroundAction(backgroundAction === "remove" ? null : "remove")}
                                className={`text-xs py-2 px-3 rounded-md border text-left transition-all ${backgroundAction === "remove" ? "bg-indigo-500 text-white border-indigo-600" : "bg-white/40 border-transparent hover:bg-white/60 text-slate-700"}`}
                            >
                                Remove Background
                            </button>
                            <button
                                onClick={() => setBackgroundAction(backgroundAction === "blur" ? null : "blur")}
                                className={`text-xs py-2 px-3 rounded-md border text-left transition-all ${backgroundAction === "blur" ? "bg-indigo-500 text-white border-indigo-600" : "bg-white/40 border-transparent hover:bg-white/60 text-slate-700"}`}
                            >
                                Blur Background
                            </button>
                            <button
                                onClick={() => setBackgroundAction(backgroundAction === "bw" ? null : "bw")}
                                className={`text-xs py-2 px-3 rounded-md border text-left transition-all ${backgroundAction === "bw" ? "bg-indigo-500 text-white border-indigo-600" : "bg-white/40 border-transparent hover:bg-white/60 text-slate-700"}`}
                            >
                                B&W Background
                            </button>
                        </div>
                    </div>

                    {/* Removal */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs mb-1.5">
                            <Eraser className="w-3.5 h-3.5" />
                            <span>Magic Eraser</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setRemovalAction(removalAction === "people" ? null : "people")}
                                className={`text-xs py-2 px-3 rounded-md border transition-all ${removalAction === "people" ? "bg-indigo-500 text-white border-indigo-600" : "bg-white/40 border-transparent hover:bg-white/60 text-slate-700"}`}
                            >
                                Remove People
                            </button>
                            <button
                                onClick={() => setRemovalAction(removalAction === "text" ? null : "text")}
                                className={`text-xs py-2 px-3 rounded-md border transition-all ${removalAction === "text" ? "bg-indigo-500 text-white border-indigo-600" : "bg-white/40 border-transparent hover:bg-white/60 text-slate-700"}`}
                            >
                                Remove Text
                            </button>
                        </div>
                    </div>

                    {/* Enhancement */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs mb-1.5">
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>Enhance</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setEnhancementAction(enhancementAction === "lighting" ? null : "lighting")}
                                className={`text-xs py-2 px-3 rounded-md border transition-all ${enhancementAction === "lighting" ? "bg-indigo-500 text-white border-indigo-600" : "bg-white/40 border-transparent hover:bg-white/60 text-slate-700"}`}
                            >
                                Fix Lighting
                            </button>
                            <button
                                onClick={() => setEnhancementAction(enhancementAction === "sharpen" ? null : "sharpen")}
                                className={`text-xs py-2 px-3 rounded-md border transition-all ${enhancementAction === "sharpen" ? "bg-indigo-500 text-white border-indigo-600" : "bg-white/40 border-transparent hover:bg-white/60 text-slate-700"}`}
                            >
                                Sharpen / Upscale
                            </button>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-white/10" />

                {/* Style Selector */}
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs mb-1.5">
                        <Palette className="w-3.5 h-3.5" />
                        <span>Style / Filter</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {STYLES.map((s) => (
                            <button
                                key={s.value}
                                onClick={() => setStyle(s.value)}
                                className={`text-xs py-1.5 px-2 rounded-md border transition-all ${style === s.value
                                    ? "bg-indigo-500 text-white border-indigo-600 shadow-sm"
                                    : "bg-white/40 border-transparent hover:bg-white/60 text-slate-700"
                                    }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
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
                                    Generate Edit
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
