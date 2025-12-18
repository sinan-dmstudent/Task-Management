import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    className,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    ...props
}) => {





    return (
        <button
            className={cn("btn", `btn-${variant}`, `btn-${size}`, fullWidth && "w-full", className)}
            {...props}
        />
    );
};
