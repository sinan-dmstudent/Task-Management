import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Clock } from 'lucide-react';
import type { Task } from '../../../types';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';

interface OverdueAlertModalProps {
    tasks: Task[];
    onClose: () => void;
}

export const OverdueAlertModal: React.FC<OverdueAlertModalProps> = ({ tasks, onClose }) => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Small delay for fade-in effect
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleViewTask = (taskId: string) => {
        navigate(`/tasks/${taskId}`);
        onClose();
    };

    if (tasks.length === 0) return null;

    if (!isVisible) return null; // Simple visibility control for inline animation

    return (
        <div className={`w-full bg-white rounded-2xl shadow-lg border border-red-100 overflow-hidden mb-6 animate-in fade-in slide-in-from-top-4 duration-500`}>
            <div className="bg-red-50/50 p-6 flex flex-col items-center text-center border-b border-red-100">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-3 animate-bounce">
                    <AlertCircle size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Attention Required</h2>
                <p className="text-sm text-gray-600 mt-1">
                    You have <span className="font-bold text-red-600">{tasks.length} overdue task{tasks.length > 1 ? 's' : ''}</span> that require immediate action.
                </p>
            </div>

            <div className="p-4 flex flex-col gap-2 bg-white">
                {tasks.map(task => (
                    <Card
                        key={task.id}
                        hoverable
                        className="flex items-center justify-between p-3 border border-red-100 hover:border-red-300 transition-colors shadow-sm"
                        onClick={() => handleViewTask(task.id)}
                    >
                        <div className="flex flex-col overflow-hidden">
                            <span className="font-bold text-sm truncate text-gray-800">{task.title}</span>
                            <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                                <Clock size={12} />
                                Overdue by {Math.ceil((new Date().getTime() - new Date(task.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days
                            </span>
                        </div>
                        <ArrowRight size={16} className="text-gray-400" />
                    </Card>
                ))}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                <Button
                    variant="ghost"
                    className="flex-1 justify-center text-gray-500 hover:bg-gray-200"
                    onClick={onClose}
                >
                    Remind Me Later
                </Button>
                <Button
                    variant="primary"
                    className="flex-1 justify-center bg-[var(--primary)] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    onClick={() => navigate('/tasks')}
                >
                    View All Tasks
                </Button>
            </div>
        </div>
    );
};
