import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ArrowLeft, Mail, Trash2 } from 'lucide-react';

export const UserDetails: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { staff, departments, deleteStaff, currentUser, tasks } = useAppContext();

    const member = staff.find(s => s.id === userId);
    const dept = departments.find(d => d.id === member?.departmentId);

    // Filter tasks assigned to this user
    const userTasks = tasks.filter(task => task.assignedStaffId === userId);

    if (!member) return <div>User not found</div>;

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            deleteStaff(member.id);
            navigate('/users');
        }
    };

    return (
        <div className="flex flex-col gap-6 fade-in max-w-5xl mx-auto p-4">
            <div className="flex items-center gap-2 mb-4">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-500 hover:text-gray-900">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: User Info */}
                <Card className="flex flex-col gap-6 items-center py-8 h-fit">
                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center font-bold text-3xl text-secondary">
                        {member.name.charAt(0)}
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">{member.name}</h2>
                        <p className="text-secondary">{member.role} • {dept?.name}</p>
                    </div>

                    <div className="flex items-center gap-2 text-primary bg-indigo-50 px-4 py-2 rounded-full">
                        <Mail size={16} />
                        <span className="text-sm font-medium">{member.email}</span>
                    </div>

                    {currentUser.role === 'Admin' && (
                        <div className="mt-4 w-full px-4 flex flex-col gap-3">
                            {member.role === 'Staff' && (
                                <Button variant="secondary" fullWidth onClick={() => alert('Password reset placeholder (Backend Required)')}>
                                    Reset Password
                                </Button>
                            )}
                            <Button variant="danger" fullWidth onClick={handleDelete} className="gap-2 justify-center">
                                <Trash2 size={18} />
                                Remove User
                            </Button>
                        </div>
                    )}
                </Card>

                {/* Right Column: Assigned Tasks */}
                <div className="md:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-gray-800">Assigned Tasks ({userTasks.length})</h2>
                    {userTasks.length > 0 ? (
                        <div className="space-y-3">
                            {userTasks.map(task => (
                                <Card key={task.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/tasks/${task.id}`)}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-gray-900">{task.title}</h3>
                                        <span className={`px-2 py-0.5 text-xs rounded-full ${task.priority === 'High' ? 'bg-red-100 text-red-700' :
                                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{task.description}</p>
                                    <div className="flex justify-between items-center text-xs text-gray-400">
                                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                        <span className={`capitalize ${task.status === 'Completed' ? 'text-green-600 font-medium' :
                                            task.status === 'In Progress' ? 'text-blue-600 font-medium' : ''
                                            }`}>
                                            {task.status}
                                        </span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                            <p className="text-gray-500">No tasks assigned to this user.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
