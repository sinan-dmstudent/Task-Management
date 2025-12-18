import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Clock, AlertCircle, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { OverdueAlertModal } from '../components/features/tasks/OverdueAlertModal';

export const Dashboard: React.FC = () => {
    const { tasks, currentUser, departments } = useAppContext();
    const navigate = useNavigate();
    const [showOverdueModal, setShowOverdueModal] = React.useState(false);

    // Recent Tasks (Limit to 3)
    // Recent Tasks (Sorted by Unread, then Date)
    const { getUnreadCount, isTaskNew } = useAppContext();
    const recentTasks = [...tasks]
        .sort((a, b) => {
            const unreadA = getUnreadCount(a.id);
            const unreadB = getUnreadCount(b.id);

            // Prioritize Unread
            if (unreadA > 0 && unreadB === 0) return -1;
            if (unreadB > 0 && unreadA === 0) return 1;

            // Then Date
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
        .slice(0, 5); // Increased slice to show more potentially active tasks

    // Check for overdue tasks on mount
    // Filter: Overdue AND Not Completed AND Assigned to Me (prevent admin overwhelm)
    const overdueTasks = tasks.filter(t =>
        new Date(t.dueDate) < new Date() &&
        t.status !== 'Completed' &&
        t.assignedStaffId === currentUser.id
    );

    React.useEffect(() => {
        // Prevent showing every single time they click back to dashboard - basic session check
        // Or if user specifically requested "immediately upon opening the app", maybe every time is fine?
        // Let's do a simple check: if > 0 overdue.
        if (overdueTasks.length > 0) {
            // Check if we already showed it this session?
            const hasShown = sessionStorage.getItem('overdue_alert_shown');
            if (!hasShown) {
                setShowOverdueModal(true);
                sessionStorage.setItem('overdue_alert_shown', 'true');
            }
        }
    }, [overdueTasks.length]); // Depend on length so if new overdue tasks appear (unlikely in session) or first load

    // Statistics
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;
    const highPriorityTasks = tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length;


    return (
        <div className="flex flex-col gap-md fade-in relative">
            <div className="flex flex-col gap-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold">Hello, {currentUser?.name.split(' ')[0]} 👋</h1>
                    {currentUser?.role === 'Admin' && (
                        <Link to="/create-task" className="btn btn-primary btn-sm flex items-center gap-xs shadow-md animate-pulse">
                            <Plus size={16} className="animate-bounce" />
                            Create
                        </Link>
                    )}
                </div>
                <p className="text-sm text-secondary -mt-2">Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-md">
                <Card className="flex flex-col gap-sm items-center justify-center py-6 bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white border-none shadow-lg" style={{ background: 'linear-gradient(135deg, var(--primary), #a855f7)', color: 'white' }}>
                    <div className="text-3xl font-bold">{pendingTasks}</div>
                    <div className="text-xs opacity-90">Pending Tasks</div>
                </Card>
                <Card className="flex flex-col gap-sm items-center justify-center py-6 bg-white">
                    <div className="text-3xl font-bold text-success" style={{ color: 'var(--success)' }}>{completedTasks}</div>
                    <div className="text-xs text-secondary">Completed</div>
                </Card>
            </div>

            {/* Overdue Alert (Inline) */}
            {
                showOverdueModal && (
                    <OverdueAlertModal
                        tasks={overdueTasks}
                        onClose={() => setShowOverdueModal(false)}
                    />
                )
            }

            {/* Quick Actions / High Priority */}
            {
                highPriorityTasks > 0 && !showOverdueModal && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-md" style={{ backgroundColor: '#fef2f2', borderColor: '#fee2e2' }}>
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                            <AlertCircle size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm text-[var(--text-main)]">Attention Needed</span>
                            <span className="text-xs text-secondary">You have {highPriorityTasks} high priority tasks pending.</span>
                        </div>
                    </div>
                )
            }

            {/* Recent Activity */}
            <section className="flex flex-col gap-md mt-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">Recent Tasks</h2>
                    <Link to="/tasks" className="text-xs text-primary font-medium">View All</Link>
                </div>

                <div className="flex flex-col gap-sm">
                    {recentTasks.map(task => {
                        const dept = departments.find(d => d.id === task.departmentId);
                        const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';

                        return (
                            <Card
                                key={task.id}
                                hoverable
                                className={`flex flex-col gap-xs p-3 cursor-pointer ${isOverdue ? 'border-red-200 bg-red-50/30' : ''}`}
                                onClick={() => navigate(`/tasks/${task.id}`)}
                            >
                                <div className="flex justify-between items-start">
                                    <span className="text-xs text-secondary font-medium uppercase tracking-wider">{dept?.name}</span>
                                    <div className="flex gap-1">
                                        {isTaskNew(task.id) && (
                                            <Badge variant="info" className="animate-pulse px-1.5 py-0.5 text-[10px]">New</Badge>
                                        )}
                                        {isOverdue && (
                                            <Badge variant="error" className="animate-pulse px-1.5 py-0.5 text-[10px]">Overdue</Badge>
                                        )}
                                        <Badge variant={task.priority === 'High' ? 'error' : task.priority === 'Medium' ? 'warning' : 'info'}>
                                            {task.priority}
                                        </Badge>
                                    </div>
                                </div>
                                <h3 className="font-bold text-sm truncate">{task.title}</h3>
                                <div className={`flex items-center gap-xs text-xs mt-1 ${isOverdue ? 'text-red-600 font-bold' : 'text-secondary'}`}>
                                    <Clock size={12} />
                                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                </div>
                                {getUnreadCount(task.id) > 0 && (
                                    <div className="absolute top-10 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                        {getUnreadCount(task.id)} new
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </section>
        </div >
    );
};
