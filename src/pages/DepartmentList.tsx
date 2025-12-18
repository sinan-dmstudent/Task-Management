import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Building2, Users, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DepartmentList: React.FC = () => {
    const { departments, staff, currentUser } = useAppContext();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-md fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold">Departments</h1>
                {currentUser.role === 'Admin' && (
                    <button onClick={() => navigate('/create-department')} className="p-2 bg-[var(--primary)] text-white rounded-full shadow-lg hover:bg-[var(--primary-hover)]">
                        <Plus size={20} />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-sm" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                {departments.map(dept => {
                    const memberCount = staff.filter(s => s.departmentId === dept.id).length;
                    return (
                        <Card
                            key={dept.id}
                            hoverable
                            className="flex flex-col items-center justify-center py-6 gap-sm text-center cursor-pointer"
                            onClick={() => navigate(`/departments/${dept.id}`)}
                        >
                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center" style={{ backgroundColor: '#e0e7ff', color: 'var(--primary)' }}>
                                <Building2 size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">{dept.name}</h3>
                                <div className="text-xs text-secondary flex items-center justify-center gap-xs mt-1">
                                    <Users size={12} />
                                    {memberCount} Users
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
