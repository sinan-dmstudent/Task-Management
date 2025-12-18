import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';

export const TaskList: React.FC = () => {
    const { tasks, departments, currentUser, getUnreadCount, isTaskNew } = useAppContext();
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Completed' | 'Overdue'>('All');
    const [filterDept, setFilterDept] = useState<string>('All');

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
        const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';

        const matchesStatus = filterStatus === 'All'
            ? true
            : filterStatus === 'Completed' ? task.status === 'Completed'
                : filterStatus === 'Overdue' ? isOverdue
                    : task.status !== 'Completed'; // Pending

        const matchesDept = filterDept === 'All' ? true : task.departmentId === filterDept;

        return matchesSearch && matchesStatus && matchesDept;
    }).sort((a, b) => {
        const unreadA = getUnreadCount(a.id);
        const unreadB = getUnreadCount(b.id);

        if (unreadA > 0 && unreadB === 0) return -1;
        if (unreadB > 0 && unreadA === 0) return 1;
        return 0;
    });

    return (
        <div className="flex flex-col gap-md fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">Tasks</h1>
                {currentUser?.role === 'Admin' && (
                    <Link
                        to="/create-task"
                        className="btn btn-primary btn-sm w-8 h-8 p-0 flex items-center justify-center shadow-md rounded-full"
                        aria-label="Create Task"
                        title="Create Task"
                    >
                        <Plus size={18} className="animate-bounce" />
                    </Link>
                )}
            </div>



            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={16} />
                <Input
                    placeholder="Search tasks..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Department Filter - Only for Admins */}
            {currentUser?.role === 'Admin' && (
                <div className="flex gap-sm overflow-x-auto pb-1">
                    <select
                        className="input h-9 text-xs py-1"
                        value={filterDept}
                        onChange={e => setFilterDept(e.target.value)}
                    >
                        <option value="All">All Departments</option>
                        {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Tabs */}
            <div className="flex p-1 bg-[var(--border)] rounded-lg">
                {(['All', 'Pending', 'Overdue', 'Completed'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilterStatus(tab)}
                        className={cn(
                            "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                            filterStatus === tab
                                ? "bg-white text-[var(--text-main)] shadow-sm"
                                : "text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Task List */}
            <div className="flex flex-col gap-sm">
                {filteredTasks.length === 0 ? (
                    <div className="text-center py-10 text-secondary text-sm">No tasks found.</div>
                ) : (
                    filteredTasks.map(task => {
                        const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';
                        return (
                            <Link to={`/tasks/${task.id}`} key={task.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Card hoverable className={`flex flex-col gap-xs ${isOverdue ? 'border-red-200 bg-red-50/30' : ''}`}>
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs text-primary font-medium">{departments.find(d => d.id === task.departmentId)?.name}</span>
                                        <div className="flex gap-1">
                                            {isTaskNew(task.id) && (
                                                <Badge variant="info" className="animate-pulse">New</Badge>
                                            )}
                                            {isOverdue && (
                                                <Badge variant="error" className="animate-pulse">Overdue</Badge>
                                            )}
                                            <Badge variant={
                                                task.status === 'Completed' ? 'success' :
                                                    task.status === 'In Progress' ? 'warning' : 'neutral'
                                            }>
                                                {task.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <h3 className="font-medium text-sm">{task.title}</h3>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex -space-x-2">
                                            {/* Avatars placeholder */}
                                            <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                                        </div>
                                        <span className={`text-xs ${isOverdue ? 'text-red-600 font-bold' : 'text-secondary'}`}>
                                            {new Date(task.dueDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {getUnreadCount(task.id) > 0 && (
                                        <div className="absolute top-10 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse z-10">
                                            {getUnreadCount(task.id)} new
                                        </div>
                                    )}
                                </Card>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
};
