import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Input } from '../components/common/Input';
import { Plus } from 'lucide-react';
import { TaskItem } from '../components/common/TaskItem';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';

export const TaskList: React.FC = () => {
    const { tasks, departments, currentUser, setTaskListOpenState, getUnreadCount } = useAppContext();
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Completed' | 'Overdue'>('All');
    const [filterDept, setFilterDept] = useState<string>('All');

    React.useEffect(() => {
        setTaskListOpenState(true);
        return () => {
            setTaskListOpenState(false);
        };
    }, [setTaskListOpenState]);

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
                        className="btn btn-primary btn-sm w-10 h-10 p-0 flex items-center justify-center shadow-md rounded-full"
                        aria-label="Create Task"
                        title="Create Task"
                    >
                        <Plus size={24} className="animate-bounce" />
                    </Link>
                )}
            </div>



            {/* Search */}
            <div className="relative">
                <Input
                    placeholder="Search tasks..."
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
            {/* Navigation Tabs - Updated Design */}
            <div className="flex gap-2 p-1 overflow-x-auto no-scrollbar">
                {(['All', 'Pending', 'Overdue', 'Completed'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilterStatus(tab)}
                        className={cn(
                            "flex-1 py-3 px-4 text-sm font-bold rounded-lg transition-all transform active:scale-95 duration-200 border shadow-sm",
                            filterStatus === tab
                                ? "bg-violet-600 text-white border-violet-600 ring-2 ring-violet-200" // Use Tailwind color names that map to same hex or close
                                : "bg-white text-gray-600 border-gray-200 hover:border-violet-400 hover:text-violet-600"
                        )}
                        style={{
                            minWidth: '100px',
                            backgroundColor: filterStatus === tab ? '#7c3aed' : undefined,
                            color: filterStatus === tab ? '#ffffff' : undefined,
                            borderColor: filterStatus === tab ? '#7c3aed' : undefined
                        }}
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
                    filteredTasks.map(task => (
                        <Link to={`/tasks/${task.id}`} key={task.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <TaskItem task={task} />
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};
