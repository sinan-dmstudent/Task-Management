import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'neutral', ...props }) => {
    return (
        <span
            className={cn("badge", `badge-${variant}`, className)}
            {...props}
        />
    );
};
