import React from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface ImagePreviewModalProps {
    imageUrl: string | null;
    onClose: () => void;
}

export default function ImagePreviewModal({
    imageUrl,
    onClose,
}: ImagePreviewModalProps) {
    if (!imageUrl) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
                title="Close preview"
            >
                <X className="w-6 h-6" />
            </button>
            <div
                className="relative w-full h-full max-w-7xl max-h-[90vh] rounded-xl overflow-hidden shadow-2xl flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                <Image
                    src={imageUrl}
                    alt="Full screen preview"
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority
                />
            </div>
        </div>
    );
}
