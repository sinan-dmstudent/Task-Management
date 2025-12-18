import React from 'react';

import { BottomNav } from './BottomNav';
import { Outlet } from 'react-router-dom';

export const Layout: React.FC = () => {
    return (
        <div className="min-h-screen bg-body flex">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                <main className="flex-1 container pb-24 pt-8 p-4">
                    <Outlet />
                </main>

                {/* Bottom Navigation - All Devices */}
                <BottomNav />
            </div>
        </div>
    );
};
