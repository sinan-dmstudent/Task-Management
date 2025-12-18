import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ArrowLeft, Paperclip } from 'lucide-react';
import type { Priority, Attachment } from '../types';

export const TaskForm: React.FC = () => {
    const navigate = useNavigate();
    const { addTask, departments, staff, currentUser } = useAppContext();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState<Priority>('Medium');
    const [departmentId, setDepartmentId] = useState('');
    const [assignedStaffId, setAssignedStaffId] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    React.useEffect(() => {
        if (currentUser.role !== 'Admin') {
            navigate('/');
        }
    }, [currentUser, navigate]);

    if (currentUser.role !== 'Admin') return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const newAttachments: Attachment[] = files.map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                taskId: 'temp',
                name: file.name,
                url: URL.createObjectURL(file), // Create local URL for preview
                type: file.type.startsWith('image/') ? 'image' : 'document',
                file: file
            }));
            setAttachments(prev => [...prev, ...newAttachments]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !description || !departmentId || !dueDate || !assignedStaffId) {
            alert(`Please fill in all required fields.`);
            return;
        }

        setIsSubmitting(true);
        try {
            console.log('Submitting task...');
            await addTask({
                title,
                description,
                dueDate: new Date(dueDate).toISOString(),
                priority,
                status: 'Not Started',
                departmentId,
                assignedStaffId: assignedStaffId || undefined,
                attachments: attachments
            });
            console.log('Task created successfully, navigating...');
            navigate('/tasks');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Failed to create task:', error);
            alert(`Failed to create task: ${error.message || 'Unknown error'}`);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-md fade-in">
            <div className="flex items-center gap-sm mb-4">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-secondary hover:text-primary">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Create New Task</h1>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                <Input
                    label="Task Title"
                    placeholder="e.g. Fix Projector"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                />

                <div className="flex flex-col gap-sm">
                    <label className="label">Description</label>
                    <textarea
                        className="input h-32 py-2 resize-none"
                        placeholder="Describe the task details..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                    />
                </div>

                <div className="flex flex-col gap-sm">
                    <label className="label">Attachments (Optional)</label>
                    <div className="flex items-center gap-sm">
                        <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-xs px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-md text-sm hover:bg-[var(--bg-body)] transition-colors">
                            <Paperclip size={16} />
                            <span>Attach Files</span>
                            <input
                                id="file-upload"
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                        <span className="text-xs text-secondary">{attachments.length} file(s) selected</span>
                    </div>
                    {attachments.length > 0 && (
                        <div className="flex flex-col gap-xs mt-1">
                            {attachments.map(att => (
                                <div key={att.id} className="text-xs text-[var(--primary)] flex items-center gap-xs">
                                    <a
                                        href={att.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="truncate max-w-[200px] hover:underline cursor-pointer"
                                    >
                                        {att.name}
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-md" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <Input
                        type="date"
                        label="Due Date"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                        required
                    />

                    <div className="flex flex-col gap-sm">
                        <label className="label">Priority</label>
                        <select
                            className="input"
                            value={priority}
                            onChange={e => setPriority(e.target.value as Priority)}
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-sm">
                    <label className="label">Department</label>
                    <select
                        className="input"
                        value={departmentId}
                        onChange={e => {
                            setDepartmentId(e.target.value);
                            setAssignedStaffId(''); // Reset staff when dept changes
                        }}
                        required
                    >
                        <option value="">Select Department</option>
                        {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-sm">
                    <label className="label">Assign User</label>
                    <select
                        className="input"
                        value={assignedStaffId}
                        onChange={e => setAssignedStaffId(e.target.value)}
                        disabled={!departmentId}
                        required
                    >
                        <option value="" disabled>Select User</option>
                        {staff
                            .filter(s => s.departmentId === departmentId)
                            .map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                            ))
                        }
                    </select>
                </div>



                <div className="pt-4">
                    <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Task'}
                    </Button>
                </div>
            </form>
        </div>
    );
};
