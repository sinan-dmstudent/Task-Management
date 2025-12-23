import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
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

function App() {
    console.log("App component rendering");
    return (
        <AppProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    <Route element={<Layout />}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/tasks" element={<TaskList />} />
                        <Route path="/tasks/:taskId" element={<TaskDetails />} />
                        <Route path="/create-task" element={<TaskForm />} />
                        <Route path="/users" element={<UserList />} />
                        <Route path="/create-user" element={<UserForm />} />
                        <Route path="/users/:userId" element={<UserDetails />} />
                        <Route path="/departments" element={<DepartmentList />} />
                        <Route path="/departments/:departmentId" element={<DepartmentDetails />} />
                        <Route path="/create-department" element={<DepartmentForm />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AppProvider>
    );
}

export default App;
