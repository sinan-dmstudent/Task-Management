import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { TaskList } from './pages/TaskList';
import { TaskDetails } from './pages/TaskDetails';
import { TaskForm } from './pages/TaskForm';
import { UserList } from './pages/UserList';
import { UserDetails } from './pages/UserDetails';
import { UserForm } from './pages/UserForm';
import { DepartmentList } from './pages/DepartmentList';
import { DepartmentDetails } from './pages/DepartmentDetails';
import { DepartmentForm } from './pages/DepartmentForm';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { Settings } from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { session, loading } = useAppContext();
    const location = useLocation();

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!session) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}

function App() {
    console.log("App component rendering");
    return (
        <AppProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="tasks" element={<TaskList />} />
                        <Route path="tasks/:taskId" element={<TaskDetails />} />
                        <Route path="create-task" element={<TaskForm />} />
                        <Route path="users" element={<UserList />} />
                        <Route path="create-user" element={<UserForm />} />
                        <Route path="users/:userId" element={<UserDetails />} />
                        <Route path="departments" element={<DepartmentList />} />
                        <Route path="departments/:departmentId" element={<DepartmentDetails />} />
                        <Route path="create-department" element={<DepartmentForm />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AppProvider>
    );
}

export default App;
