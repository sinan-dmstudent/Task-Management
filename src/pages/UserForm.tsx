import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ArrowLeft } from 'lucide-react';
import type { Role } from '../types';

export const UserForm: React.FC = () => {
    const navigate = useNavigate();
    const { addStaff, departments } = useAppContext();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<Role>('Staff');
    const [departmentId, setDepartmentId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !departmentId || !password) return;

        addStaff(email, name, departmentId, role, password);
        navigate('/users');
    };

    return (
        <div className="flex flex-col gap-md fade-in">
            <div className="flex items-center gap-sm mb-4">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-secondary hover:text-primary">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Add New User</h1>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                <Input
                    label="Full Name"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                />

                <div className="flex flex-col gap-1">
                    <Input
                        type={showPassword ? "text" : "password"}
                        label="Password"
                        placeholder="Min. 6 characters"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <div className="flex items-center gap-2 mt-1">
                        <input
                            type="checkbox"
                            id="showPassword"
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <label htmlFor="showPassword" className="text-xs text-secondary cursor-pointer select-none">
                            Show Password
                        </label>
                    </div>
                </div>

                <Input
                    type="email"
                    label="Email Address"
                    placeholder="e.g. john@college.edu"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />

                <div className="flex flex-col gap-sm">
                    <label className="label">Department</label>
                    <select
                        className="input"
                        value={departmentId}
                        onChange={e => {
                            setDepartmentId(e.target.value);
                            const selectedDept = departments.find(d => d.id === e.target.value);
                            if (selectedDept?.name === 'Administration') {
                                setRole('Admin');
                            } else {
                                setRole('Staff');
                            }
                        }}
                        required
                    >
                        <option value="">Select Department</option>
                        {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>



                <div className="pt-4">
                    <Button type="submit" fullWidth size="lg">Add User</Button>
                </div>
            </form >
        </div >
    );
};
