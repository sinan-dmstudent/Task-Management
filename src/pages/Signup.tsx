import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [workspaceName, setWorkspaceName] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [verificationSent, setVerificationSent] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Sign up user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        workspace_name: workspaceName,
                    },
                },
            });

            if (authError) throw authError;

            if (!authData.user) {
                throw new Error("User registration failed");
            }

            // Check if email confirmation is required (session will be null)
            if (!authData.session) {
                // Determine if we should stop here and ask for verification
                setVerificationSent(true);
                return;
            }

            const userId = authData.user.id;

            // 2. Create Workspace
            const { data: workspaceData, error: workspaceError } = await supabase
                .from('workspaces')
                .insert([
                    {
                        name: workspaceName,
                        owner_id: userId,
                    },
                ])
                .select()
                .single();

            if (workspaceError) throw workspaceError;

            const workspaceId = workspaceData.id;

            // 3. Create Department
            const { data: deptData, error: deptError } = await supabase
                .from('departments')
                .insert([
                    {
                        name: 'Administration',
                        workspace_id: workspaceId,
                    },
                ])
                .select()
                .single();

            if (deptError) throw deptError;

            // 4. Create User Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: userId,
                        email: email,
                        full_name: fullName,
                        role: 'Admin', // First user is Admin
                        department_id: deptData.id,
                        workspace_id: workspaceId,
                    },
                ]);

            if (profileError) {
                // If profile creation fails, we technically have an orphaned auth user and workspace.
                // For now, just throw. 
                throw profileError;
            }

            // Success! Redirect.
            navigate('/');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Signup error:", err);
            setError(err.message || 'Failed to create account and workspace');
        } finally {
            setLoading(false);
        }
    };

    if (verificationSent) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8 text-center bg-white p-8 rounded-lg shadow">
                    <h2 className="text-2xl font-bold text-green-600">Verification Email Sent</h2>
                    <p className="mt-4 text-gray-600">
                        Please check your email <strong>{email}</strong> to verify your account.
                    </p>
                    <p className="mt-2 text-gray-500 text-sm">
                        After verifying your email, you can sign in to your new workspace.
                    </p>
                    <div className="mt-6">
                        <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                        Create a new Workspace
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        For the initial administrator
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSignup}>
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <label htmlFor="fullName" className="sr-only">
                                Full Name
                            </label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                required
                                className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="relative block w-full border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="workspaceName" className="sr-only">
                                College/Workspace Name
                            </label>
                            <input
                                id="workspaceName"
                                name="workspaceName"
                                type="text"
                                required
                                className="relative block w-full border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                                placeholder="Workspace Name (e.g. My College)"
                                value={workspaceName}
                                onChange={(e) => setWorkspaceName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                className="relative block w-full border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="showPassword"
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <label htmlFor="showPassword" className="text-sm text-gray-600 cursor-pointer select-none">
                            Show Password
                        </label>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                        >
                            {loading ? 'Creating Workspace...' : 'Create Workspace'}
                        </button>
                    </div>
                    <div className="text-center">
                        <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
                            Already have an account? Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
