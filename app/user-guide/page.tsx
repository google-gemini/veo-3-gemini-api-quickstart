"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Book, Monitor, Image as ImageIcon, Layers, Film, CreditCard, Folder, Lightbulb, Keyboard } from "lucide-react";
import DynamicHeading from "@/components/ui/DynamicHeading";

export default function UserGuidePage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-white">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-white/20 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <DynamicHeading className="text-xl md:text-2xl" />
                </div>
            </div>

            <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {/* Hero Section */}
                    <div className="p-8 md:p-12 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl text-indigo-600 dark:text-indigo-400">
                                <Book className="w-8 h-8" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                                Comprehensive User Guide
                            </h1>
                        </div>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                            Master Photoverse with our detailed guide to all features, tools, and workflows.
                        </p>
                    </div>

                    <div className="p-8 md:p-12 space-y-12">

                        {/* Overview */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Overview</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                Photoverse is an AI-powered image generation and editing platform that allows users to create, edit, and compose images using various AI models. The platform features a clean, intuitive interface with a left sidebar for file management and a central workspace for creating and editing content.
                            </p>
                        </section>

                        <hr className="border-slate-100 dark:border-slate-800" />

                        {/* Interface Layout */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <Monitor className="w-6 h-6 text-indigo-500" />
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Main Interface Layout</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <h3 className="font-semibold text-lg mb-3 text-slate-900 dark:text-white">Header (Top Bar)</h3>
                                    <ul className="space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                                        <li className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                            <span><strong>Photoverse Logo:</strong> Clickable to return to home</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                            <span><strong>Credits Display:</strong> Shows your current credit balance</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                            <span><strong>User Profile:</strong> Displays username with avatar</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                            <span><strong>Sign Out Button:</strong> Located in the top-right corner</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <h3 className="font-semibold text-lg mb-3 text-slate-900 dark:text-white">Left Sidebar</h3>
                                    <ul className="space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                                        <li className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                            <span><strong>Search Bar:</strong> Field to find previous projects</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                            <span><strong>All Images Section:</strong> Shows total number of images</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                            <span><strong>Custom Folders:</strong> Create and organize your work</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                            <span><strong>History Section:</strong> Thumbnail previews of recent work</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <hr className="border-slate-100 dark:border-slate-800" />

                        {/* Main Features */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <Layers className="w-6 h-6 text-indigo-500" />
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Main Features</h2>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                        <ImageIcon className="w-5 h-5 text-slate-400" />
                                        1. Create Image
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-300 mb-4">The primary feature for generating AI images with a detailed prompt.</p>
                                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 ml-4">
                                        <li><strong>AI Model Selector:</strong> Choose between Gemini 2.5 Flash, Nano Banana Pro, or Imagen 4.0 Fast</li>
                                        <li><strong>Prompt Input Area:</strong> Text field to describe the image you want to create</li>
                                        <li><strong>Toolbar Buttons:</strong> Reset, Saved Prompts, Voice Input, Language Selector</li>
                                        <li><strong>Action Buttons:</strong> Create Image button generates your image based on the prompt</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Layers className="w-5 h-5 text-slate-400" />
                                        2. Edit Image
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-300 mb-4">The photo editor allows adjustment of existing images.</p>
                                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 ml-4">
                                        <li><strong>Upload Area:</strong> Supports PNG, JPG, WEBP (up to 10MB)</li>
                                        <li><strong>Photo Editor Panel:</strong> Brightness, Contrast, and Warmth sliders</li>
                                        <li><strong>Save/Export Options:</strong> Download your edited images</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Layers className="w-5 h-5 text-slate-400" />
                                        3. Compose Image
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-300 mb-4">Combine multiple images into a single composition.</p>
                                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 ml-4">
                                        <li><strong>Multi-Image Upload:</strong> Up to 10 images, each up to 10MB</li>
                                        <li><strong>Image Composer Panel:</strong> Pre-designed templates, inspiration search</li>
                                        <li><strong>Preview Gallery:</strong> View composition examples</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Film className="w-5 h-5 text-slate-400" />
                                        4. Compose Album
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-300 mb-4">Create a themed album with multiple variations of images.</p>
                                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 ml-4">
                                        <li><strong>Source Image Upload:</strong> Upload a subject image as reference</li>
                                        <li><strong>Album Composer:</strong> Select from various album themes</li>
                                        <li><strong>Style Previews:</strong> Visual examples of different album compositions</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <hr className="border-slate-100 dark:border-slate-800" />

                        {/* Credit System */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <CreditCard className="w-6 h-6 text-indigo-500" />
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Credit System</h2>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 mb-6">
                                Photoverse uses a credit-based system for generating content. Your current credit balance is displayed in the top-right corner of the header.
                            </p>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">Image Generation</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-300">Gemini 2.5 Flash</span>
                                            <span className="font-medium text-indigo-600 dark:text-indigo-400">1 credit</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-300">Imagen 4.0 Fast</span>
                                            <span className="font-medium text-indigo-600 dark:text-indigo-400">2 credits</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-300">Nano Banana Pro</span>
                                            <span className="font-medium text-indigo-600 dark:text-indigo-400">3 credits</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">Video Generation (Premium)</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-300">Veo 2</span>
                                            <span className="font-medium text-indigo-600 dark:text-indigo-400">10 credits</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-300">Veo 3</span>
                                            <span className="font-medium text-indigo-600 dark:text-indigo-400">25 credits</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <hr className="border-slate-100 dark:border-slate-800" />

                        {/* File Management & Prompt Library */}
                        <div className="grid md:grid-cols-2 gap-12">
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <Folder className="w-6 h-6 text-indigo-500" />
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">File Management</h2>
                                </div>
                                <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                                    <li><strong>Creating Folders:</strong> Click "+ New Folder" and enter a folder name</li>
                                    <li><strong>Browsing History:</strong> View "All Images" or click custom folders to see their contents</li>
                                    <li><strong>Search:</strong> Use the search bar to find specific projects</li>
                                    <li><strong>Image Actions:</strong> Move images to folders or delete them</li>
                                </ul>
                            </section>

                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <Lightbulb className="w-6 h-6 text-indigo-500" />
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Prompt Library</h2>
                                </div>
                                <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                                    <li><strong>Save Current Prompt:</strong> Store frequently used prompts</li>
                                    <li><strong>Search Prompts:</strong> Find saved prompts quickly</li>
                                    <li><strong>Browse Library:</strong> View all saved prompts</li>
                                </ul>
                            </section>
                        </div>

                        <hr className="border-slate-100 dark:border-slate-800" />

                        {/* Tips & Shortcuts */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <section className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-xl border border-amber-100 dark:border-amber-900/30">
                                <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-4">Tips for Best Results</h2>
                                <ul className="space-y-2 text-amber-800 dark:text-amber-200 text-sm list-disc list-inside">
                                    <li>Use specific, detailed prompts for better image generation</li>
                                    <li>Save frequently used prompts in your Prompt Library</li>
                                    <li>Organize images into folders for easy project management</li>
                                    <li>Use voice input for hands-free prompt entry</li>
                                    <li>Choose models based on your needs and credit balance</li>
                                </ul>
                            </section>

                            <section className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-2 mb-4">
                                    <Keyboard className="w-5 h-5 text-slate-500" />
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Keyboard Shortcuts</h2>
                                </div>
                                <ul className="space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                                    <li className="flex justify-between">
                                        <span>Close modals</span>
                                        <kbd className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono">Esc</kbd>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Voice Input</span>
                                        <span className="text-xs text-slate-500">Microphone Icon</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Language Selection</span>
                                        <span className="text-xs text-slate-500">Globe Icon</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Upload Images</span>
                                        <span className="text-xs text-slate-500">Drag & Drop</span>
                                    </li>
                                </ul>
                            </section>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
