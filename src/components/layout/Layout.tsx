import React from 'react';
import { BottomNav } from './BottomNav';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

export const Layout: React.FC = () => {
    const { session, loading } = useAppContext();
    const location = useLocation();

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!session) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

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
