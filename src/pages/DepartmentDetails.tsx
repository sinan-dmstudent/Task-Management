import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ArrowLeft, Trash2, Users } from 'lucide-react';

export const DepartmentDetails: React.FC = () => {
    const { departmentId } = useParams<{ departmentId: string }>();
    const navigate = useNavigate();
    const { departments, staff, deleteDepartment, currentUser } = useAppContext();

    const department = departments.find(d => d.id === departmentId);
    const departmentStaff = staff.filter(s => s.departmentId === departmentId); // Note: verify 'departmentId' case in Staff type. Previously seen as 'departmentId' in AppUser but verify Staff.

    if (!department) return <div>Department not found</div>;

    const handleDelete = async () => {
        if (department.name === 'Administration') {
            alert('The "Administration" department cannot be deleted.');
            return;
        }

        if (window.confirm(`WARNING: Deleting this department will PERMANENTLY DELETE all ${departmentStaff.length} staff members associated with it.\n\nAre you sure you want to proceed?`)) {
            try {
                await deleteDepartment(department.id);
                navigate('/departments');
            } catch (error) {
                console.error("Failed to delete department:", error);
                alert("Failed to delete department. See console for details.");
            }
        }
    };

    return (
        <div className="flex flex-col gap-6 fade-in max-w-5xl mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-500 hover:text-gray-900">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">{department.name}</h1>
                </div>
                {currentUser.role === 'Admin' && department.name !== 'Administration' && (
                    <Button variant="danger" onClick={handleDelete} className="gap-2">
                        <Trash2 size={18} />
                        Delete Department
                    </Button>
                )}
            </div>

            <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Users size={20} />
                    Staff Members ({departmentStaff.length})
                </h2>

                {departmentStaff.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {departmentStaff.map(member => (
                            <Card
                                key={member.id}
                                hoverable
                                className="flex items-center gap-4 p-4 cursor-pointer"
                                onClick={() => navigate(`/users/${member.id}`)}
                            >
                                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                                    {member.name.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-gray-900">{member.name}</span>
                                    <span className="text-xs text-gray-500">{member.role}</span>
                                    <span className="text-xs text-gray-400">{member.email}</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                        <p className="text-gray-500">No staff members in this department.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
