export type Status = 'Not Started' | 'In Progress' | 'Completed';
export type Priority = 'Low' | 'Medium' | 'High';
export type Role = 'Admin' | 'Staff';

export interface Department {
  id: string;
  name: string;
}

export interface Staff {
  id: string;
  name: string;
  departmentId: string;
  role: Role;
  avatarUrl?: string;
  email: string;
  designation?: string;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: string; // ISO string
}

export interface Attachment {
  id: string;
  taskId: string;
  name: string;
  url: string;
  type: 'image' | 'document';
  file?: File;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO string
  priority: Priority;
  status: Status;
  departmentId: string;
  assignedStaffId?: string;
  createdBy?: string;
  attachments: Attachment[];
  comments: Comment[];
  createdAt: string;
}
