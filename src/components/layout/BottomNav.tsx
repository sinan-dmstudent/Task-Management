import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CheckSquare, Users, Building2, Settings } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface NavItem {
    to: string;
    icon: React.ElementType;
    label: string;
    adminOnly?: boolean;
}

export const BottomNav: React.FC = () => {
    const { isAdmin } = useAppContext();

    const baseNavItems: NavItem[] = [
        { to: '/', icon: Home, label: 'Dashboard', adminOnly: false },
        { to: '/tasks', icon: CheckSquare, label: 'Tasks', adminOnly: false },
        { to: '/departments', icon: Building2, label: 'Departments', adminOnly: true },
        { to: '/users', icon: Users, label: 'Users', adminOnly: true },
        { to: '/settings', icon: Settings, label: 'Settings', adminOnly: false },
    ];

    const visibleItems = baseNavItems.filter((item) => !item.adminOnly || isAdmin);


    const navItems: NavItem[] = [...visibleItems];

    return (
        <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 pb-safe shadow-md">
            <ul className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <li key={item.to} className="flex-1 flex justify-center">
                        <NavLink
                            to={item.to}
                            end={item.to === '/'}
                            aria-label={item.label}
                            title={item.label}
                            className={({ isActive }) =>
                                `flex items-center justify-center w-full h-full text-gray-500 hover:text-gray-900 transition-colors ${isActive
                                    ? 'text-primary'
                                    : ''
                                }`
                            }
                        >
                            <item.icon size={24} />
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
};
