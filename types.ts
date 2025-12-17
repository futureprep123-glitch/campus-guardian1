
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type UserRole = 'Student' | 'Staff' | 'Security' | 'Admin' | 'Parent';

export type UserStatus = 'Active' | 'Pending' | 'Rejected';

export type IncidentStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Dismissed';

export type IncidentCategory = 'Bunking' | 'Disrespect' | 'Property Damage' | 'Physical Altercation' | 'Other';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  status: UserStatus;
  password?: string;
  linkedStudentId?: string; // For Parents
  lastLogin?: string;
  createdAt?: string;
}

export interface Incident {
  id: string;
  type: IncidentCategory;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: IncidentStatus;
  timestamp: string;
  location: string;
  description: string;
  reporterId: string;
  studentId: string;
}

export interface DashboardStats {
  totalComplaints: number;
  highSeverityCount: number;
  resolvedCount: number;
  statusDistribution: { status: IncidentStatus; count: number }[];
  categoryBreakdown: { category: IncidentCategory; count: number }[];
}
