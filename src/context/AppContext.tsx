/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { Task, Department, Staff, Role, Status, Attachment } from '../types';

// Extend the AppUser to match the Staff type more closely if needed, 
// or just use Staff for the list and AppUser for the session user.
export interface AppUser {
    id: string;
    email: string;
    name: string; // Changed from full_name to match Staff.name
    role: Role;
    departmentId?: string; // Changed from department for consistency
    workspace_id: string;
    created_at?: string;
}

export interface Workspace {
    id: string;
    name: string;
    owner_id: string;
}

interface AppContextType {
    session: Session | null;
    user: AppUser | null; // The authenticated user
    currentUser: Staff; // The app-compatible user object (for legacy support)
    workspace: Workspace | null;
    tasks: Task[];
    departments: Department[];
    staff: Staff[];
    loading: boolean;
    isAdmin: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    addTask: (task: Omit<Task, 'id' | 'comments' | 'createdAt'>) => Promise<void>;
    updateTaskStatus: (taskId: string, status: Status) => Promise<void>;
    addComment: (taskId: string, content: string) => Promise<void>;
    addDepartment: (name: string) => Promise<void>;
    addStaff: (email: string, name: string, departmentId: string, role: Role, password?: string) => Promise<void>;
    deleteStaff: (userId: string) => Promise<void>;
    updateWorkspace: (name: string) => Promise<void>;
    updateProfile: (data: Partial<Staff>) => Promise<void>;
    deleteDepartment: (departmentId: string) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    markTaskAsRead: (taskId: string) => void;
    getUnreadCount: (taskId: string) => number;
    isTaskNew: (taskId: string) => boolean;
    setTaskListOpenState: (isOpen: boolean) => void;
    updateComment: (taskId: string, commentId: string, content: string) => Promise<void>;
    deleteComment: (taskId: string, commentId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<AppUser | null>(null);
    const [workspace, setWorkspace] = useState<Workspace | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [taskReadStatus, setTaskReadStatus] = useState<Record<string, string>>({});



    useEffect(() => {
        if (!isSupabaseConfigured) return;
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchUserProfile(session.user.id, session.user);
            else setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) fetchUserProfile(session.user.id, session.user);
            else {
                setUser(null);
                setWorkspace(null);
                setTasks([]);
                setDepartments([]);
                setStaff([]);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Realtime Subscription
    useEffect(() => {
        if (!user?.workspace_id) return;

        console.log('Setting up Realtime subscription for workspace:', user.workspace_id);

        const channel = supabase.channel('realtime_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'comments' },
                (payload) => {
                    console.log('Realtime: Comment event received:', payload);

                    if (payload.eventType === 'INSERT') {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const newComment = payload.new as any;

                        setTasks(prevTasks => prevTasks.map(task => {
                            if (task.id === newComment.task_id) {
                                // Deduplicate
                                if (task.comments.some(c => c.id === newComment.id)) {
                                    return task;
                                }

                                return {
                                    ...task,
                                    comments: [...task.comments, {
                                        id: newComment.id,
                                        taskId: newComment.task_id,
                                        authorId: newComment.author_id,
                                        content: newComment.content,
                                        createdAt: newComment.created_at
                                    }]
                                };
                            }
                            return task;
                        }));
                    } else if (payload.eventType === 'UPDATE') {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const updatedComment = payload.new as any;
                        setTasks(prevTasks => prevTasks.map(task => {
                            // Optimisation: check if this task contains the comment (or if we know task_id)
                            const hasComment = task.comments.some(c => c.id === updatedComment.id);
                            if (hasComment || task.id === updatedComment.task_id) {
                                return {
                                    ...task,
                                    comments: task.comments.map(c =>
                                        c.id === updatedComment.id
                                            ? { ...c, content: updatedComment.content }
                                            : c
                                    )
                                };
                            }
                            return task;
                        }));
                    } else if (payload.eventType === 'DELETE') {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const deletedComment = payload.old as any;
                        if (!deletedComment.id) return;

                        setTasks(prevTasks => prevTasks.map(task => ({
                            ...task,
                            comments: task.comments.filter(c => c.id !== deletedComment.id)
                        })));
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'tasks' },
                (payload) => {
                    console.log('Realtime: Task change detected:', payload);
                    if (payload.eventType === 'INSERT') {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const newTaskPayload = payload.new as any;

                        if (newTaskPayload.workspace_id === user.workspace_id) {
                            console.log('Realtime: New task created, adding individually...');

                            // Optimistic add - no refetch
                            const newTask: Task = {
                                id: newTaskPayload.id,
                                title: newTaskPayload.title,
                                description: newTaskPayload.description,
                                dueDate: newTaskPayload.due_date,
                                priority: newTaskPayload.priority,
                                status: newTaskPayload.status,
                                departmentId: newTaskPayload.department_id,
                                assignedStaffId: newTaskPayload.assigned_staff_id,
                                createdBy: newTaskPayload.created_by,
                                createdAt: newTaskPayload.created_at,
                                comments: [],
                                attachments: []
                            };

                            setTasks(prev => [newTask, ...prev]);
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const updatedTask = payload.new as any;
                        setTasks(prev => prev.map(t => {
                            if (t.id === updatedTask.id) {
                                console.log('Realtime: Updating task', t.title);
                                return {
                                    ...t,
                                    title: updatedTask.title || t.title,
                                    description: updatedTask.description || t.description,
                                    dueDate: updatedTask.due_date || t.dueDate,
                                    priority: updatedTask.priority || t.priority,
                                    status: updatedTask.status || t.status,
                                    assignedStaffId: updatedTask.assigned_staff_id || t.assignedStaffId,
                                    departmentId: updatedTask.department_id || t.departmentId,
                                    // Preserve existing arrays
                                    comments: t.comments,
                                    attachments: t.attachments,
                                    // Update metadata if needed
                                    // createdAt: updatedTask.created_at || t.createdAt
                                };
                            }
                            return t;
                        }));
                    } else if (payload.eventType === 'DELETE') {
                        setTasks(prev => prev.filter(t => t.id !== payload.old.id));
                    }
                }
            )
            .subscribe((status) => {
                console.log('Realtime subscription status:', status);
            });

        return () => {
            console.log('Unsubscribing from realtime');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            supabase.removeChannel(channel as any);
        };

    }, [user?.workspace_id]);

    useEffect(() => {
        if (!isSupabaseConfigured) return;
        if (user?.workspace_id) {
            fetchWorkspaceData(user.workspace_id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.workspace_id]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fetchUserProfile = async (userId: string, authUser?: any) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;

            const appUser: AppUser = {
                id: data.id,
                email: data.email,
                name: data.full_name, // Map full_name to name
                role: data.role,
                departmentId: data.department_id, // Assume db column is department_id
                workspace_id: data.workspace_id,
                created_at: data.created_at,
            };

            setUser(appUser);
            fetchWorkspace(appUser.workspace_id);

            // Load read status from local storage
            const storedStatus = localStorage.getItem(`task_read_status_${userId}`);
            if (storedStatus) {
                setTaskReadStatus(JSON.parse(storedStatus));
            }

        } catch (error) {
            console.error('Error fetching profile:', error);
            setLoading(false);

            // POST-SIGNUP CONFIGURATION HANDLER
            // If the user is authenticated (session exists) but has NO profile, 
            // it means they verified their email but the workspace setup didn't happen yet.
            // We check the user metadata for 'workspace_name' to retry the setup.
            const userToCheck = authUser || session?.user;
            if (userToCheck?.user_metadata?.workspace_name) {
                console.log("Verified user with missing profile detected. Attempting to complete setup...");
                await completeSetup(userToCheck);
            } else {
                // Genuine error or missing permissions -> Sign out
                // strict check? maybe wait
                signOut();
            }
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completeSetup = async (authUser: any) => {
        try {
            const userId = authUser.id;
            const workspaceName = authUser.user_metadata.workspace_name;
            const fullName = authUser.user_metadata.full_name;
            const email = authUser.email;

            setLoading(true);

            // 1. Create Workspace
            const { data: workspaceData, error: workspaceError } = await supabase
                .from('workspaces')
                .insert([{ name: workspaceName, owner_id: userId }])
                .select().single();

            if (workspaceError) throw workspaceError;

            // 2. Create Department
            const { data: deptData, error: deptError } = await supabase
                .from('departments')
                .insert([{ name: 'Administration', workspace_id: workspaceData.id }])
                .select().single();

            if (deptError) throw deptError;

            // 3. Create Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([{
                    id: userId,
                    email: email,
                    full_name: fullName,
                    role: 'Admin',
                    department_id: deptData.id,
                    workspace_id: workspaceData.id
                }]);

            if (profileError) throw profileError;

            // 4. Retry fetching profile
            await fetchUserProfile(userId);

        } catch (err) {
            console.error("Setup completion failed:", err);
            setLoading(false);
            signOut();
        }
    };

    const fetchWorkspace = async (workspaceId: string) => {
        const { data, error } = await supabase
            .from('workspaces')
            .select('*')
            .eq('id', workspaceId)
            .single();
        if (!error) setWorkspace(data);
    };

    const fetchWorkspaceData = async (workspaceId: string) => {
        setLoading(true);
        try {
            const [deptResult, staffResult, taskResult] = await Promise.all([
                supabase.from('departments').select('*').eq('workspace_id', workspaceId),
                supabase.from('profiles').select('*').eq('workspace_id', workspaceId),
                supabase.from('tasks').select('*, comments(*), attachments(*)').eq('workspace_id', workspaceId).order('created_at', { ascending: false })
            ]);

            // 1. Departments
            if (deptResult.data) setDepartments(deptResult.data);
            if (deptResult.error) console.error('Error fetching departments:', deptResult.error);

            // 2. Staff
            if (staffResult.data) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mappedStaff: Staff[] = staffResult.data.map((p: any) => ({
                    id: p.id,
                    name: p.full_name,
                    email: p.email,
                    role: p.role,
                    departmentId: p.department_id || '',
                    avatarUrl: undefined
                }));
                setStaff(mappedStaff);
            }
            if (staffResult.error) console.error('Error fetching staff:', staffResult.error);

            // 3. Tasks
            if (taskResult.data) {
                // Transform data to match Task interface
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let mappedTasks: Task[] = taskResult.data.map((t: any) => ({
                    id: t.id,
                    title: t.title,
                    description: t.description,
                    dueDate: t.due_date,
                    priority: t.priority,
                    status: t.status,
                    departmentId: t.department_id,
                    assignedStaffId: t.assigned_staff_id,
                    attachments: t.attachments || [],
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    comments: (t.comments || []).map((c: any) => ({
                        id: c.id,
                        taskId: c.task_id,
                        authorId: c.author_id,
                        content: c.content,
                        createdAt: c.created_at
                    })),
                    createdAt: t.created_at,
                    createdBy: t.created_by
                }));

                // Strict Filtering: If user is Staff, only show their own tasks. Admins see all.
                if (user?.role === 'Staff') {
                    mappedTasks = mappedTasks.filter(t => t.assignedStaffId === user.id);
                }

                setTasks(mappedTasks);
            }
            if (taskResult.error) console.error('Error fetching tasks:', taskResult.error);

        } catch (error) {
            console.error('Error fetching workspace data:', error);
        } finally {
            setLoading(false);
        }
    };

    const addTask = async (task: Omit<Task, 'id' | 'comments' | 'createdAt'>) => {
        if (!user?.workspace_id || user.role !== 'Admin') {
            console.error('Permission denied: Only admins can create tasks');
            throw new Error('Permission denied: Only admins can create tasks');
        }
        const { data, error } = await supabase
            .from('tasks')
            .insert([{
                title: task.title,
                description: task.description,
                due_date: task.dueDate,
                priority: task.priority,
                status: task.status,
                department_id: task.departmentId,
                assigned_staff_id: task.assignedStaffId,
                workspace_id: user.workspace_id,
                created_by: user.id
                // attachments: task.attachments -- REMOVED: Not a column in tasks
            }])
            .select()
            .single();

        if (error) {
            console.error('Supabase Error creating task:', error);
            throw error;
        }

        if (data) {
            // 2. Insert Attachments if any
            let uploadedAttachments: Attachment[] = [];

            if (task.attachments && task.attachments.length > 0) {
                const results = await Promise.all(task.attachments.map(async (att) => {
                    let finalUrl = '';
                    let storagePath = '';

                    // 1. If there is a file object, upload it
                    if (att.file) {
                        // Sanitize filename
                        const sanitizedName = att.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                        const path = `${user.workspace_id}/${data.id}/${Math.random().toString(36).substr(2, 5)}_${sanitizedName}`;

                        const { data: uploadData, error: uploadError } = await supabase.storage
                            .from('attachments')
                            .upload(path, att.file);

                        if (uploadError) {
                            console.error('Upload error for file:', att.name, uploadError);
                            // If upload fails, we return null to skip this attachment
                            return null;
                        }

                        if (uploadData) {
                            storagePath = uploadData.path;
                            const { data: urlData } = supabase.storage.from('attachments').getPublicUrl(uploadData.path);
                            finalUrl = urlData.publicUrl;
                        }
                    } else if (att.url && !att.url.startsWith('blob:')) {
                        // 2. If it's already a valid remote URL (not a blob), keep it
                        finalUrl = att.url;
                    }

                    // If we couldn't get a valid URL, skip
                    if (!finalUrl) {
                        console.warn(`Skipping attachment ${att.name} because no valid URL could be generated.`);
                        return null;
                    }

                    // 3. Save to DB
                    const { data: attData, error: attError } = await supabase
                        .from('attachments')
                        .insert({
                            task_id: data.id,
                            name: att.name,
                            type: att.type,
                            url: finalUrl, // Must be the remote public URL
                            storage_path: storagePath
                        })
                        .select()
                        .single();

                    if (attError) {
                        console.error('Error saving attachment metadata:', attError);
                        return null;
                    }

                    // Return the complete object
                    return {
                        id: attData ? attData.id : att.id,
                        taskId: data.id,
                        name: att.name,
                        type: att.type,
                        url: finalUrl,
                        file: att.file
                    };
                }));

                // Filter out any nulls (failed uploads)
                uploadedAttachments = results.filter(a => a !== null) as Attachment[];
            }

            const newTask: Task = {
                ...task,
                id: data.id,
                createdAt: data.created_at,
                comments: [],
                createdBy: user.id,
                attachments: uploadedAttachments
            };
            setTasks(prev => [newTask, ...prev]); // Prepend to show at top
        }
    };

    const updateTaskStatus = async (taskId: string, status: Status) => {
        const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId);
        if (!error) {
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
        }
    };

    const addComment = async (taskId: string, content: string) => {
        if (!user) return;
        // Assuming 'comments' table
        const { data, error } = await supabase.from('comments').insert({
            task_id: taskId,
            author_id: user.id,
            content
        }).select().single();

        if (!error && data) {
            setTasks(prev => prev.map(t => {
                if (t.id === taskId) {
                    return {
                        ...t,
                        comments: [...t.comments, {
                            id: data.id,
                            taskId,
                            authorId: user.id,
                            content,
                            createdAt: data.created_at
                        }]
                    };
                }
                return t;
            }));
        }
    };

    const updateComment = async (taskId: string, commentId: string, content: string) => {
        if (!user) return;

        const { data, error } = await supabase
            .from('comments')
            .update({ content })
            .eq('id', commentId)
            // Safety check: ensure only author can update (enforced by RLS too hopefully)
            .eq('author_id', user.id)
            .select()
            .single();

        if (error) {
            console.error("Error updating comment:", error);
            throw error;
        }

        if (data) {
            setTasks(prev => prev.map(t => {
                if (t.id === taskId) {
                    return {
                        ...t,
                        comments: t.comments.map(c => c.id === commentId ? { ...c, content } : c)
                    };
                }
                return t;
            }));
        }
    };

    const deleteComment = async (taskId: string, commentId: string) => {
        if (!user) return;

        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId)
            .eq('author_id', user.id);

        if (error) {
            console.error("Error deleting comment:", error);
            throw error;
        }

        setTasks(prev => prev.map(t => {
            if (t.id === taskId) {
                return {
                    ...t,
                    comments: t.comments.filter(c => c.id !== commentId)
                };
            }
            return t;
        }));
    };

    const addDepartment = async (name: string) => {
        if (!user?.workspace_id) return;
        const { data, error } = await supabase.from('departments').insert({
            name,
            workspace_id: user.workspace_id
        }).select().single();

        if (!error && data) {
            setDepartments(prev => [...prev, { id: data.id, name: data.name }]);
        }
    };

    const addStaff = async (email: string, name: string, departmentId: string, role: Role, password?: string) => {
        // Create a temporary client to sign up the user without logging out the admin
        // This requires the Anon Key and URL.
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase configuration missing');
        }

        const { createClient } = await import('@supabase/supabase-js');
        const tempSupabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: false, // Critical: verify this doesn't overwrite local storage
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        });

        // 1. Create Auth User
        // Default password for new staff - they should reset it later
        const tempPassword = password || 'password123';
        const { data: authData, error: authError } = await tempSupabase.auth.signUp({
            email,
            password: tempPassword,
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Failed to create user');

        const newUserId = authData.user.id;

        // 2. Insert Profile
        // We do this as the ADMIN using the main 'supabase' client which has the RLS permissions
        // thanks to our "Admins can insert profiles" policy.
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
                id: newUserId,
                email,
                full_name: name,
                role,
                department_id: departmentId,
                workspace_id: user?.workspace_id
            }]);

        if (profileError) {
            // Clean up auth user if profile creation fails? 
            // Hard to do from client side without Service Role. Be careful.
            console.error('Profile creation failed', profileError);
            throw profileError;
        }

        // 3. Update local state
        const newMember: Staff = {
            id: newUserId,
            name,
            email,
            role,
            departmentId,
            avatarUrl: undefined
        };
        setStaff(prev => [...prev, newMember]);
    };

    const deleteStaff = async (userId: string) => {
        console.warn("deleteStaff requires Server-Side logic. Optimistically removing for UI.");
        setStaff(prev => prev.filter(s => s.id !== userId));
    };

    const updateWorkspace = async (name: string) => {
        if (!user?.workspace_id) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updates: any = { name };
        // if (logoUrl) updates.logo_url = logoUrl; // Assume column exists or just ignore

        const { error } = await supabase
            .from('workspaces')
            .update(updates)
            .eq('id', user.workspace_id);

        if (!error) {
            setWorkspace(prev => prev ? { ...prev, ...updates } : null);
        }
    };

    const updateProfile = async (data: Partial<Staff>) => {
        if (!user) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updates: any = {};
        if (data.name) updates.full_name = data.name;
        if (data.designation) updates.designation = data.designation;
        // if (data.departmentId) updates.department_id = data.departmentId; // Usually read-only or admin only

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

        if (!error) {
            setUser(prev => prev ? { ...prev, name: data.name || prev.name } : null); // Update local user
            // Also update staff list item if it's me
            setStaff(prev => prev.map(s => s.id === user.id ? { ...s, ...data } : s));
        }
    }


    const deleteDepartment = async (departmentId: string) => {
        // 1. Check if Administration
        const dept = departments.find(d => d.id === departmentId);
        if (dept?.name === 'Administration') {
            throw new Error('Cannot delete Administration department');
        }

        // 2. Delete Department (Cascade is handled by DB ideally, but we will rely on constraint or direct delete)
        // Note: If user wants to delete staff, we could do it here, but deleting department should trigger cascade if configured.
        // User requested: "remove all staff members associated with it".
        // If DB has FK cascade, this is done. If not, we attempt to delete them (but might lack permissions for auth.users).
        // Best approach for now: Delete department from DB. If constraint fails, we know we need cascade.
        // Assuming the previous SQL session set up cascades or we just rely on profile deletion.

        const { error } = await supabase.from('departments').delete().eq('id', departmentId);

        if (error) throw error;

        // 3. Update local state
        setDepartments(prev => prev.filter(d => d.id !== departmentId));
        setStaff(prev => prev.filter(s => s.departmentId !== departmentId));
    };

    const deleteTask = async (taskId: string) => {
        if (user?.role !== 'Admin') {
            throw new Error('Permission denied: Only admins can delete tasks');
        }

        const { error } = await supabase.from('tasks').delete().eq('id', taskId);
        if (error) throw error;

        setTasks(prev => prev.filter(t => t.id !== taskId));
    };



    const markTaskAsRead = (taskId: string) => {
        if (!user) return;
        const now = new Date().toISOString();
        const newStatus = { ...taskReadStatus, [taskId]: now };
        setTaskReadStatus(newStatus);
        localStorage.setItem(`task_read_status_${user.id}`, JSON.stringify(newStatus));
    };

    // Track Task List visibility for badge logic
    const [isTaskListOpen, setIsTaskListOpen] = useState(false);
    const [lastTaskListClosedAt, setLastTaskListClosedAt] = useState<string>(new Date().toISOString());

    // Effect: Load last closed time for specific user when user loads
    useEffect(() => {
        if (user) {
            const key = `lastTaskListClosedAt_${user.id}`;
            const stored = localStorage.getItem(key);
            if (stored) {
                setLastTaskListClosedAt(stored);
            } else {
                // If never loaded before, default to now (assume all read)
                // OR default to 0 to show all as unread?
                // Defaulting to NOW is safer to avoid overwhelming badge on first login.
                const now = new Date().toISOString();
                setLastTaskListClosedAt(now);
                localStorage.setItem(key, now);
            }
        }
    }, [user]);

    const setTaskListOpenState = React.useCallback((isOpen: boolean) => {
        setIsTaskListOpen(isOpen);
        // Update timestamp whenever state changes (open or close)
        // This ensures badges clear on open, and we track "new since close" on close.
        const now = new Date().toISOString();
        setLastTaskListClosedAt(now);
        if (user) {
            localStorage.setItem(`lastTaskListClosedAt_${user.id}`, now);
        }
    }, [user]);

    const getUnreadCount = (taskId: string) => {
        // If currently viewing the list, badges are cleared/suppressed
        if (isTaskListOpen) return 0;

        const task = tasks.find(t => t.id === taskId);
        if (!task || !task.comments) return 0;

        return task.comments.filter(c => {
            // 1. Sender doesn't see badge for their own comment
            if (c.authorId === user?.id) return false;

            // 2. Only show if created AFTER the list was last viewed/closed
            return new Date(c.createdAt) > new Date(lastTaskListClosedAt);
        }).length;
    };

    const isTaskNew = (taskId: string) => {
        if (!user) return false;
        const task = tasks.find(t => t.id === taskId);
        if (!task) return false;
        if (task.assignedStaffId !== user.id) return false;

        if (isTaskListOpen) return false;
        return new Date(task.createdAt) > new Date(lastTaskListClosedAt);
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        // Clear local state immediately
        setUser(null);
        setWorkspace(null);
        setTasks([]);
        setDepartments([]);
        setStaff([]);
        // Optional: Force reload to clear any lingering in-memory state
        // window.location.reload(); 
    };

    const refreshProfile = async () => {
        if (session?.user.id) {
            await fetchUserProfile(session.user.id);
        }
    };

    // Convert AppUser to Staff to satisfy `currentUser` type
    const currentUser: Staff = user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId || '',
        avatarUrl: undefined // Add avatar if available
    } : {
        id: '',
        name: '',
        email: '',
        role: 'Staff',
        departmentId: ''
    };

    const value = React.useMemo(() => ({
        session,
        user,
        currentUser,
        workspace,
        tasks,
        departments,
        staff,
        loading,
        isAdmin: user?.role === 'Admin',
        signOut,
        refreshProfile,
        addTask,
        updateTaskStatus,
        addComment,
        addDepartment,
        addStaff,
        deleteStaff,
        updateWorkspace,
        updateProfile,

        deleteDepartment,
        deleteTask,
        getUnreadCount,
        isTaskNew,
        setTaskListOpenState,
        markTaskAsRead,
        updateComment,
        deleteComment
    }), [ // eslint-disable-line react-hooks/exhaustive-deps
        session,
        user,
        currentUser,
        workspace,
        tasks,
        departments,
        staff,
        loading,
        taskReadStatus, // Dependency for getUnreadCount/isTaskNew
        isTaskListOpen, // Dependency for getUnreadCount/isTaskNew
        lastTaskListClosedAt // Dependency for getUnreadCount/isTaskNew
    ]);

    if (!isSupabaseConfigured) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg border border-red-200">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Configuration Required</h2>
                    <p className="text-gray-600 mb-4">
                        Please set up your Supabase project credentials in the <code className="bg-gray-100 px-1 rounded">.env</code> file.
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                        Update <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong>.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                    >
                        Reload App
                    </button>
                </div>
            </div>
        );
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}

export const useApp = useAppContext;
