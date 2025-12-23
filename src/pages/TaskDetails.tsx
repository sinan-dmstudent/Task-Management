import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { ArrowLeft, MessageSquare, Calendar, User, Paperclip, Trash2, Edit2, Check, X } from 'lucide-react';
import type { Status } from '../types';

export const TaskDetails: React.FC = () => {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const {
        tasks, departments, staff, currentUser,
        updateTaskStatus, addComment, deleteTask, markTaskAsRead,
        updateComment, deleteComment, setTaskListOpenState
    } = useAppContext();
    const [commentInput, setCommentInput] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    React.useEffect(() => {
        if (taskId) {
            markTaskAsRead(taskId);
        }
        setTaskListOpenState(true);
        return () => {
            setTaskListOpenState(false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [taskId, setTaskListOpenState]);

    const task = tasks.find(t => t.id === taskId);
    const department = departments.find(d => d.id === task?.departmentId);


    if (!task) {
        return <div className="p-4 text-center">Task not found</div>;
    }

    const handleStatusChange = (newStatus: Status) => {
        updateTaskStatus(task.id, newStatus);
    };

    const handleDeleteTask = async () => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await deleteTask(task.id);
                navigate('/tasks'); // Navigate to task list after deletion
            } catch (error) {
                console.error('Failed to delete task:', error);
                alert('Failed to delete task.');
            }
        }
    };

    const handleSendComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentInput.trim()) return;
        addComment(task.id, commentInput);
        setCommentInput('');
    };

    const handleStartEdit = (commentId: string, content: string) => {
        setEditingCommentId(commentId);
        setEditContent(content);
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditContent('');
    };

    const handleSaveEdit = async (commentId: string) => {
        if (!editContent.trim()) return;
        try {
            await updateComment(task.id, commentId, editContent);
            setEditingCommentId(null);
            setEditContent('');
        } catch (error) {
            console.error('Failed to update comment:', error);
            alert('Failed to update comment');
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (window.confirm('Delete this comment?')) {
            try {
                await deleteComment(task.id, commentId);
            } catch (error) {
                console.error('Failed to delete comment:', error);
                alert('Failed to delete comment');
            }
        }
    };

    return (
        <div className="flex flex-col gap-md pb-6 fade-in">
            {/* Header Navigation */}
            <div className="flex items-center gap-sm">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-secondary hover:text-primary">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-bold truncate flex-1">Task Details</h1>
                {currentUser.role === 'Admin' && (
                    <button
                        onClick={handleDeleteTask}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Task"
                    >
                        <Trash2 size={20} />
                    </button>
                )}
            </div>

            {/* Main Info */}
            <div className="flex flex-col gap-xs">
                <div className="flex justify-between items-start">
                    <span className="text-xs text-secondary uppercase font-medium tracking-wide">{department?.name}</span>
                    <Badge variant={task.priority === 'High' ? 'error' : task.priority === 'Medium' ? 'warning' : 'info'}>
                        {task.priority}
                    </Badge>
                </div>
                <h2 className="text-xl font-bold leading-tight">{task.title}</h2>
                <p className="text-sm text-secondary leading-relaxed mt-1">
                    {task.description}
                </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-md py-4 border-t border-b border-[var(--border)]">
                <div className="flex flex-col gap-xs">
                    <div className="flex items-center gap-xs text-xs text-secondary">
                        <Calendar size={14} />
                        <span>Due Date</span>
                    </div>
                    <span className="text-sm font-medium">{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>

                <div className="flex flex-col gap-xs">
                    <div className="flex items-center gap-xs text-xs text-secondary">
                        <User size={14} />
                        <span>Assigned By</span>
                    </div>
                    {/* Show creator name if available, otherwise Admin */}
                    <span className="text-sm font-medium">
                        {staff.find(s => s.id === task.createdBy)?.name || 'Admin'}
                    </span>
                </div>
            </div>

            {/* Attachments Section */}
            {task.attachments && task.attachments.length > 0 && (
                <div className="flex flex-col gap-xs py-2">
                    <div className="flex items-center gap-xs text-xs text-secondary font-bold">
                        <Paperclip size={14} />
                        <span>Attachments</span>
                    </div>
                    <div className="flex flex-col gap-xs mt-1">
                        {task.attachments.map(att => (
                            <a
                                key={att.id}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-[var(--primary)] hover:underline flex items-center gap-2 p-2 bg-white rounded border border-[var(--border)]"
                            >
                                <Paperclip size={14} className="text-secondary" />
                                {att.name}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Status Actions */}
            <div className="flex flex-col gap-sm">
                <span className="text-sm font-bold">Status</span>
                <div className="flex gap-2 p-1 overflow-x-auto no-scrollbar">
                    {(['Not Started', 'In Progress', 'Completed'] as Status[]).map((s) => (
                        <button
                            key={s}
                            onClick={() => handleStatusChange(s)}
                            className={`flex-1 py-3 px-4 text-sm font-bold rounded-lg transition-all transform active:scale-95 duration-200 border shadow-sm ${task.status === s
                                    ? 'bg-violet-600 text-white border-violet-600 ring-2 ring-violet-200'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-violet-400 hover:text-violet-600'
                                }`}
                            style={{
                                minWidth: '100px',
                                backgroundColor: task.status === s ? '#7c3aed' : undefined,
                                color: task.status === s ? '#ffffff' : undefined,
                                borderColor: task.status === s ? '#7c3aed' : undefined
                            }}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Comments Section */}
            <div className="flex flex-col gap-md pt-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-sm">
                        <MessageSquare size={18} />
                        Comments ({task.comments.length})
                    </h3>
                </div>

                <div className="flex flex-col gap-md">
                    {task.comments.map(comment => {
                        const author = staff.find(s => s.id === comment.authorId);
                        const isMe = author?.id === currentUser.id;
                        const isEditing = editingCommentId === comment.id;

                        return (
                            <div key={comment.id} className={`flex gap-sm ${isMe ? 'flex-row-reverse' : ''}`}>
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {author?.name.charAt(0)}
                                </div>
                                <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    {isEditing ? (
                                        <div className="flex flex-col gap-1 items-end w-full min-w-[200px]">
                                            <Input
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                autoFocus
                                                className="text-sm"
                                            />
                                            <div className="flex gap-2 mt-1">
                                                <button onClick={() => handleSaveEdit(comment.id)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                                                    <Check size={16} />
                                                </button>
                                                <button onClick={handleCancelEdit} className="p-1 text-red-500 hover:bg-red-50 rounded">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="group relative">
                                            <div className={`p-3 rounded-lg text-sm ${isMe ? 'bg-[var(--primary-light)] text-[var(--primary-hover)]' : 'bg-white border border-[var(--border)]'}`}>
                                                {comment.content}
                                            </div>
                                            {isMe && (
                                                <div className="absolute top-0 -left-14 h-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity px-2">
                                                    <button onClick={() => handleStartEdit(comment.id, comment.content)} className="p-1 text-gray-500 hover:text-blue-500">
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button onClick={() => handleDeleteComment(comment.id)} className="p-1 text-gray-500 hover:text-red-500">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <span className="text-[10px] text-secondary mt-1">
                                        {comment.createdAt ? new Date(comment.createdAt).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Add Comment Input */}
                <form onSubmit={handleSendComment} className="flex gap-sm items-center mt-2 sticky bottom-0 bg-[var(--bg-body)] p-2 -mx-2">
                    <Input
                        placeholder="Add a comment..."
                        className="flex-1"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                    />
                    <Button type="submit" size="sm" disabled={!commentInput.trim()}>
                        Send
                    </Button>
                </form>
            </div>
        </div>
    );
};
