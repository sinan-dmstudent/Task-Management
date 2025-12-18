import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, hoverable, ...props }) => {
    return (
        <div
            className={cn(
                "card",
                hoverable && "transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer",
                className
            )}
            {...props}
        />
    );
};
