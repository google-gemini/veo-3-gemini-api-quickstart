"use client";

import { useUser, UserButton } from "@clerk/nextjs";

export default function UserHeader() {
    const { user, isLoaded } = useUser();

    if (!isLoaded) {
        return (
            <header className="fixed top-4 left-4 z-40 flex items-center gap-3 p-2 bg-transparent">
                <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
                <div className="w-20 h-4 bg-gray-300 rounded animate-pulse" />
            </header>
        );
    }

    return (
        <header className="fixed top-4 left-4 z-40 flex items-center gap-3 p-2 bg-transparent">
            <UserButton
                appearance={{
                    elements: {
                        userButtonPopoverActionButton__manageAccount: {
                            display: 'none'
                        },
                        userButtonPopoverCard: {
                            pointerEvents: 'auto'
                        }
                    }
                }}
                userProfileMode="navigation"
                userProfileUrl={undefined}
            />
            {user && (
                <span className="text-sm font-medium text-gray-700">
                    {user.firstName || user.username || '用戶'}
                </span>
            )}
        </header>
    );
}
