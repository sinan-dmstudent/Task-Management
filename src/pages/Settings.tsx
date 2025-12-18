import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { User, Lock, Settings as SettingsIcon, Shield, Info, LogOut, ChevronRight, Building2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Settings: React.FC = () => {
    const { currentUser, departments, signOut, updateProfile, updateWorkspace, workspace, isAdmin } = useAppContext();
    const [name, setName] = useState(currentUser?.name || '');
    const [workspaceName, setWorkspaceName] = useState(workspace?.name || '');

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateProfile({ name });
        alert('Profile updated successfully');
    };

    const handleUpdateWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateWorkspace(workspaceName);
        alert('Workspace updated successfully');
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        // Placeholder: Needs Supabase updateUser logic
        alert('Password update requires backend implementation (Supabase Auth).');
    };

    const departmentName = departments.find(d => d.id === currentUser?.departmentId)?.name || 'Unassigned';

    return (
        <div className="flex flex-col gap-md fade-in pb-20">
            <h1 className="text-xl font-bold flex items-center gap-2">
                <SettingsIcon size={24} />
                Settings
            </h1>

            {/* 1. User Information */}
            <section className="flex flex-col gap-sm">
                <h2 className="text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                    <User size={16} /> User Information
                </h2>
                <Card>
                    <form onSubmit={handleUpdateProfile} className="flex flex-col gap-md">
                        <Input
                            label="Full Name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            disabled={!isAdmin} // "Staff... cannot edit anything"
                        />
                        <Input
                            label="Email"
                            value={currentUser?.email || ''}
                            disabled={true}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Role"
                                value={currentUser?.role || ''}
                                disabled={true}
                            />
                            <Input
                                label="Department"
                                value={departmentName}
                                disabled={true}
                            />
                        </div>
                        {isAdmin && (
                            <div className="flex justify-end">
                                <Button type="submit" size="sm">Save Changes</Button>
                            </div>
                        )}
                    </form>
                </Card>
            </section>

            {/* 2. Password Management - Admin Only */}
            {isAdmin && (
                <section className="flex flex-col gap-sm">
                    <h2 className="text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                        <Lock size={16} /> Password Management
                    </h2>
                    <Card>
                        <form onSubmit={handlePasswordChange} className="flex flex-col gap-md">
                            <Input
                                type="password"
                                label="Current Password"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                            />
                            <Input
                                type="password"
                                label="New Password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                            />
                            <Input
                                type="password"
                                label="Confirm New Password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <Button type="submit" size="sm">Change Password</Button>
                            </div>
                            <p className="text-xs text-secondary mt-2">
                                * As an admin, you can reset staff passwords in the User Management section.
                            </p>
                        </form>
                    </Card>
                </section>
            )}

            {/* 3. Admin Tools (Conditional) */}
            {isAdmin && (
                <section className="flex flex-col gap-sm">
                    <h2 className="text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                        <Shield size={16} /> Admin Tools
                    </h2>

                    {/* User Management */}
                    <Card className="p-0 overflow-hidden">
                        <Link to="/users" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-[var(--border)]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Users size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm">User Management</span>
                                    <span className="text-xs text-secondary">Add, edit, and remove staff & admins</span>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-gray-400" />
                        </Link>

                        {/* Department Management */}
                        <Link to="/departments" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-[var(--border)]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <Building2 size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm">Department Management</span>
                                    <span className="text-xs text-secondary">Add, edit, and remove departments</span>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-gray-400" />
                        </Link>
                    </Card>

                    {/* Administrative Configuration */}
                    <Card>
                        <h3 className="text-sm font-medium mb-4">Administrative Configuration</h3>
                        <form onSubmit={handleUpdateWorkspace} className="flex flex-col gap-md">
                            <Input
                                label="College / Workspace Name"
                                value={workspaceName}
                                onChange={e => setWorkspaceName(e.target.value)}
                            />
                            {/* Logo Upload Mock */}
                            <div>
                                <label className="block text-xs font-medium text-secondary mb-1">Brand Logo</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500 border border-dashed border-gray-300">
                                        Logo
                                    </div>
                                    <Button variant="secondary" size="sm" type="button" onClick={() => alert('Logo upload requires storage bucket setup.')}>
                                        Upload / Update
                                    </Button>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[var(--border)] mt-2">
                                <Button variant="secondary" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => alert('Restricted: System reset is not available in this version.')}>
                                    System Reset / Re-initialization
                                </Button>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" size="sm">Save Config</Button>
                            </div>
                        </form>
                    </Card>
                </section>
            )}

            {/* 4. App Information */}
            <section className="flex flex-col gap-sm">
                <h2 className="text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                    <Info size={16} /> App Information
                </h2>
                <Card className="flex flex-col gap-4 text-sm">
                    <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
                        <span className="text-secondary">About</span>
                        <span className="font-medium">Task Manager App</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
                        <span className="text-secondary">Version</span>
                        <span className="font-medium">v1.2.0</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
                        <span className="text-secondary">Privacy Policy</span>
                        <span className="text-primary cursor-pointer hover:underline">View</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-secondary">Terms & Conditions</span>
                        <span className="text-primary cursor-pointer hover:underline">View</span>
                    </div>
                </Card>
            </section>

            {/* 5. Sign Out */}
            <div className="mt-4">
                <button
                    onClick={signOut}
                    className="w-full flex items-center justify-center gap-2 p-3 text-red-600 bg-red-50 rounded-lg font-medium hover:bg-red-100 transition-colors"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </div>
    );
};
