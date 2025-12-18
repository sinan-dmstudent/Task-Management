import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ className, label, error, id, ...props }) => {
    const inputId = id || props.name;
    return (
        <div className="w-full flex-col flex gap-sm">
            {label && <label htmlFor={inputId} className="label">{label}</label>}
            <input
                id={inputId}
                className={cn("input", error && "border-[var(--error)]", className)}
                {...props}
            />
            {error && <span className="text-xs text-[var(--error)]">{error}</span>}
        </div>
    );
};
