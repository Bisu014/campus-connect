// User roles in the system
export type UserRole = 'student' | 'hod' | 'admin' | 'principal';

// User document structure in Firestore
export interface User {
  email: string;
  role: UserRole;
  branch: string;
  name: string;
}

// Complaint status options
export type ComplaintStatus = 'Pending' | 'Resolved' | 'Escalated';

// Complaint categories
export type ComplaintCategory = 
  | 'Academic'
  | 'Infrastructure'
  | 'Faculty'
  | 'Hostel'
  | 'Library'
  | 'Canteen'
  | 'Sports'
  | 'Administration'
  | 'Other';

// Complaint document structure in Firestore
export interface Complaint {
  id: string;
  studentEmail: string;
  studentName: string;
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  timestamp: Date;
  branch: string;
  attachmentUrl?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
}

// Form data for creating a new complaint
export interface NewComplaintData {
  category: ComplaintCategory;
  description: string;
  attachmentUrl?: string;
}
