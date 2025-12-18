import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ArrowLeft } from 'lucide-react';

export const DepartmentForm: React.FC = () => {
    const navigate = useNavigate();
    const { addDepartment } = useAppContext();

    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;

        addDepartment(name);
        navigate('/departments');
    };

    return (
        <div className="flex flex-col gap-md fade-in">
            <div className="flex items-center gap-sm mb-4">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-secondary hover:text-primary">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Add Department</h1>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                <Input
                    label="Department Name"
                    placeholder="e.g. Science Department"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                />

                <div className="pt-4">
                    <Button type="submit" fullWidth size="lg">Create Department</Button>
                </div>
            </form>
        </div>
    );
};
