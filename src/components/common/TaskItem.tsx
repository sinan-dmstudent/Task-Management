import React from 'react';
import { Card } from './Card';
import { useAppContext } from '../../context/AppContext';
import type { Task } from '../../types';
import { Calendar } from 'lucide-react';

interface TaskItemProps {
    task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
    const { getUnreadCount, isTaskNew, staff, currentUser } = useAppContext();
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';
    const hasUnread = getUnreadCount(task.id) > 0;
    const isNew = isTaskNew(task.id);

    // Get assigned staff name
    // Determine the name to display based on user role
    const getDisplayUser = () => {
        if (currentUser?.role === 'Admin') {
            // Admin sees who they assigned it to
            const assignedRec = staff.find(s => s.id === task.assignedStaffId);
            return assignedRec?.name || 'Unassigned';
        } else {
            // Staff sees who assigned it (Creator/Admin)
            const creator = staff.find(s => s.id === task.createdBy);
            if (creator) return creator.name;

            // Fallback: If creator not explicitly linked, show name of the first Admin found
            // This handles legacy tasks or cases where createdBy might be missing
            const firstAdmin = staff.find(s => s.role === 'Admin');
            return firstAdmin?.name || 'Admin';
        }
    };
    const displayUserName = getDisplayUser();

    // Determine styles based on status/priority
    const getStatusStyles = () => {
        if (isOverdue) return { border: 'bg-gradient-to-b from-red-500 to-red-600', text: 'text-red-600', bg: 'bg-red-50' };
        if (task.priority === 'High') return { border: 'bg-gradient-to-b from-orange-500 to-red-500', text: 'text-orange-600', bg: 'bg-orange-50' };
        if (task.status === 'Completed') return { border: 'bg-gradient-to-b from-emerald-400 to-emerald-600', text: 'text-emerald-600', bg: 'bg-emerald-50' };
        // Default (Primary/Violet theme for standard tasks to match app interface)
        return { border: 'bg-gradient-to-b from-violet-500 to-purple-600', text: 'text-violet-600', bg: 'bg-white' };
    };

    const styles = getStatusStyles();

    return (
        <div className="relative group mb-3">
            <Card hoverable className={`relative overflow-hidden p-0 border-0 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${styles.bg}`}>
                {/* Colorful Status Border (Left) */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${styles.border}`} />

                {/* Priority Badge - Absolute Top Right */}
                <div
                    className={`absolute px-4 py-1.5 rounded-lg shadow-sm z-10 font-bold text-sm text-white`}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        backgroundColor: task.status === 'Completed' ? '#C1E59F' : (task.priority === 'High' ? '#AA2B1D' : task.priority === 'Medium' ? '#F7B980' : '#ABE0F0')
                    }}
                >
                    <span>{task.status === 'Completed' ? 'Completed' : task.priority}</span>
                </div>

                <div className="pl-5 pr-4 py-4 flex flex-col gap-3">
                    {/* Header: Title and Indicators */}
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1 pr-8">
                            <h3
                                className={`font-bold text-base leading-tight ${task.status === 'Completed' ? 'text-gray-500 line-through' : '!text-[#6b7280]'}`}
                                style={task.status !== 'Completed' ? { color: '#6b7280' } : undefined}
                            >
                                {task.title}
                            </h3>
                        </div>

                        {/* Notification Dots (Only) */}
                        {(hasUnread || isNew) && (
                            <div className="flex gap-1 absolute top-4 right-8"> {/* Adjusted right pos to not overlap badge */}
                                {isNew && <span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse ring-2 ring-white" />}
                                {hasUnread && <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse ring-2 ring-white" />}
                            </div>
                        )}
                    </div>

                    {/* Body: Description */}
                    <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                        {task.description || 'No description provided'}
                    </p>

                    {/* Footer: User and Date (No Border) */}
                    <div className="flex justify-between items-end mt-1">
                        {/* User Section - Just the name */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-700">
                                {displayUserName}
                            </span>
                        </div>

                        {/* Date Section */}
                        <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: '#9c4df4' }}>
                            <Calendar size={14} />
                            <span>
                                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};
