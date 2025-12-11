"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import ImagePreviewModal from "@/components/ui/ImagePreviewModal";

interface ImagePreviewContextType {
    openPreview: (imageUrl: string) => void;
    closePreview: () => void;
}

const ImagePreviewContext = createContext<ImagePreviewContextType | undefined>(
    undefined
);

export function ImagePreviewProvider({ children }: { children: ReactNode }) {
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const openPreview = (imageUrl: string) => {
        setPreviewImage(imageUrl);
    };

    const closePreview = () => {
        setPreviewImage(null);
    };

    return (
        <ImagePreviewContext.Provider value={{ openPreview, closePreview }}>
            {children}
            <ImagePreviewModal imageUrl={previewImage} onClose={closePreview} />
        </ImagePreviewContext.Provider>
    );
}

export function useImagePreview() {
    const context = useContext(ImagePreviewContext);
    if (context === undefined) {
        throw new Error(
            "useImagePreview must be used within an ImagePreviewProvider"
        );
    }
    return context;
}
