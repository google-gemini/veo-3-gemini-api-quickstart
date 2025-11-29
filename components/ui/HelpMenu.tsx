"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { HelpCircle, Phone, Mail, Globe, ExternalLink, X, Book } from "lucide-react";
import SupportModal from "./SupportModal";
import UserGuideModal from "./UserGuideModal";

export default function HelpMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [showContact, setShowContact] = useState(false);
    const [showSupport, setShowSupport] = useState(false);
    const [showUserGuide, setShowUserGuide] = useState(false);
    const [mounted, setMounted] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const contactModal = showContact && mounted ? createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Contact Us</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">We&apos;re here to help!</p>
                    </div>
                    <button
                        onClick={() => setShowContact(false)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-white/50 dark:hover:bg-black/20 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                            <Phone className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Mobile</p>
                            <a href="tel:+919600437108" className="text-slate-900 dark:text-white font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                +91 9600437108
                            </a>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Email</p>
                            <a href="mailto:team@aignite.biz" className="text-slate-900 dark:text-white font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                team@aignite.biz
                            </a>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Website</p>
                            <a href="https://aignite.biz" target="_blank" rel="noopener noreferrer" className="text-slate-900 dark:text-white font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                aignite.biz
                            </a>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-400">
                        &copy; {new Date().getFullYear()} AIgnite. All rights reserved.
                    </p>
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                title="Help & Support"
            >
                <HelpCircle className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <button
                        onClick={() => {
                            setShowSupport(true);
                            setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                        <ExternalLink className="w-4 h-4 text-indigo-500" />
                        Support Page
                    </button>
                    <button
                        onClick={() => {
                            setShowUserGuide(true);
                            setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                        <Book className="w-4 h-4 text-indigo-500" />
                        User Guide
                    </button>
                    <button
                        onClick={() => {
                            setShowContact(true);
                            setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                        <Phone className="w-4 h-4 text-indigo-500" />
                        Contact Us
                    </button>
                </div>
            )}

            {contactModal}
            <SupportModal isOpen={showSupport} onClose={() => setShowSupport(false)} />
            <UserGuideModal isOpen={showUserGuide} onClose={() => setShowUserGuide(false)} />
        </div>
    );
}
