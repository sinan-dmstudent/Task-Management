import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Mail, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const UserList: React.FC = () => {
    const { staff, departments, currentUser } = useAppContext();
    const navigate = useNavigate();
    const [filterDept, setFilterDept] = React.useState<string>('All');
    const [search, setSearch] = React.useState('');

    const filteredUsers = staff.filter(s => {
        const matchesDept = filterDept === 'All' ? true : s.departmentId === filterDept;
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.email.toLowerCase().includes(search.toLowerCase());
        return matchesDept && matchesSearch;
    });

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        // 1. Admins first
        if (a.role === 'Admin' && b.role !== 'Admin') return -1;
        if (a.role !== 'Admin' && b.role === 'Admin') return 1;

        // 2. For Staff: Group by department
        if (a.role === 'Staff' && b.role === 'Staff') {
            const deptA = departments.find(d => d.id === a.departmentId)?.name || '';
            const deptB = departments.find(d => d.id === b.departmentId)?.name || '';
            if (deptA !== deptB) {
                return deptA.localeCompare(deptB);
            }
        }

        // 3. Alphabetical by name (for Admins among themselves, and Staff within same dept)
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="flex flex-col gap-md fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold">User Directory</h1>
                {currentUser?.role === 'Admin' && (
                    <button onClick={() => navigate('/create-user')} className="p-2 bg-[var(--primary)] text-white rounded-full shadow-lg hover:bg-[var(--primary-hover)]">
                        <Plus size={20} />
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-sm mb-2">
                <div className="relative">
                    <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="input py-2"
                    value={filterDept}
                    onChange={e => setFilterDept(e.target.value)}
                >
                    <option value="All">All Departments</option>
                    {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-sm">
                {sortedUsers.map(member => {
                    const dept = departments.find(d => d.id === member.departmentId);
                    return (
                        <Link to={`/users/${member.id}`} key={member.id} className="no-underline text-inherit">
                            <Card className="flex items-center gap-md hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-lg text-secondary">
                                    {member.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold">{member.name}</h3>
                                    <div className="text-xs text-secondary">{dept?.name} • {member.role}</div>
                                    <div className="flex items-center gap-md mt-1">
                                        <div className="text-primary flex items-center gap-xs text-xs">
                                            <Mail size={12} />
                                            Email
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
