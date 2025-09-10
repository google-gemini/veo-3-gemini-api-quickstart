"use client";

import { useAuth } from "@clerk/nextjs";
import { SignIn } from "@clerk/nextjs";
import UserHeader from "@/components/UserHeader";
import { useEffect, useState } from "react";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { isSignedIn, isLoaded } = useAuth();
    const [mounted, setMounted] = useState(false);

    // 確保組件在客戶端完全載入
    useEffect(() => {
        setMounted(true);
    }, []);

    // 載入中狀態
    if (!mounted || !isLoaded) {
        return (
            <div className="bg-gray-200 text-stone-900 min-h-screen">
                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                    <div className="w-full max-w-md px-4">
                        {/* <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Gemini API Studio
                            </h1>
                            <p className="text-gray-600">
                                AI 圖片和影片生成平台
                            </p>
                        </div> */}
                        <div className="flex justify-center">
                            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 未登入狀態
    if (!isSignedIn) {
        return (
            <div className="bg-gray-200 text-stone-900 min-h-screen">
                <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
                    <div className="w-full max-w-md px-4">
                        {/* <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Gemini API Studio
                            </h1>
                            <p className="text-gray-600">
                                AI 圖片和影片生成平台
                            </p>
                        </div> */}
                        <SignIn routing="hash" />
                    </div>
                </div>
            </div>
        );
    }

    // 已登入狀態
    return (
        <div className="bg-gray-200 text-stone-900">
            <UserHeader />
            <main className="min-h-screen">{children}</main>
        </div>
    );
}
