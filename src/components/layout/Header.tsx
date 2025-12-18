import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Menu } from 'lucide-react';
import { Button } from '../common/Button';
import { Link } from 'react-router-dom';

interface HeaderProps {
    onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const { currentUser } = useAppContext();

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-primary text-white px-4 flex items-center justify-between shadow-md z-50">
            <div className="flex items-center gap-md">
                <Button
                    variant="ghost"
                    className="text-white p-0 hover:bg-white/10 lg:hidden"
                    onClick={onMenuClick}
                >
                    <Menu size={24} />
                </Button>
                <Link to="/" className="font-bold text-lg">TaskMgr</Link>
            </div>

            <div className="flex items-center gap-md">
                <Link to="/settings" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm hover:bg-white/30 transition-colors">
                    {currentUser.name.charAt(0)}
                </Link>
            </div>
        </header>
    );
};
