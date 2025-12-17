
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  LayoutDashboard, 
  FilePlus, 
  LogOut, 
  Menu, 
  X, 
  Search,
  MoreVertical,
  Bell,
  Settings,
  MapPin,
  Clock,
  ChevronRight,
  Edit2,
  Trash2,
  Activity,
  Lock,
  Mail,
  UserPlus,
  ArrowLeft,
  UserCheck,
  UserX,
  Filter,
  Calendar,
  RefreshCcw,
  Save,
  Info,
  Send,
  Eye,
  History,
  Sparkles,
  Zap,
  BrainCircuit,
  ExternalLink,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { User, UserRole, Incident, IncidentCategory, IncidentStatus, UserStatus } from './types';
import { GradientLogo, RoleIcon, Card, Badge } from './components/BrandingComponents';
import { PieChart, BarGraph } from './components/DashboardStats';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'Landing' | 'Login' | 'SignUp' | 'Forgot' | 'Dashboard' | 'Reports' | 'Users' | 'ApprovalPending' | 'SubmitReport'>('Landing');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [authError, setAuthError] = useState('');

  const PRODUCTION_URL = "https://campus-guardian12-wxcd.vercel.app/";

  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Modals State
  const [editUser, setEditUser] = useState<User | null>(null);
  const [viewIncident, setViewIncident] = useState<Incident | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    type: 'danger' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
    type: 'info'
  });

  // Mock Database
  const [incidents, setIncidents] = useState<Incident[]>([
    { id: '1', type: 'Bunking', severity: 'Medium', status: 'Pending', timestamp: '2024-05-20T10:30:00Z', location: 'Canteen Area', description: 'Student seen leaving premises during class hours.', reporterId: 'G1', studentId: 'S101' },
    { id: '2', type: 'Property Damage', severity: 'High', status: 'In Progress', timestamp: '2024-05-19T14:15:00Z', location: 'Science Lab', description: 'Window broken in Lab B.', reporterId: 'G2', studentId: 'S202' },
    { id: '3', type: 'Physical Altercation', severity: 'Critical', status: 'Pending', timestamp: '2024-05-21T09:45:00Z', location: 'Playground', description: 'Two students involved in a physical fight.', reporterId: 'G1', studentId: 'S305' },
    { id: '4', type: 'Disrespect', severity: 'Low', status: 'Resolved', timestamp: '2024-04-15T11:00:00Z', location: 'Main Gate', description: 'Student used foul language with staff.', reporterId: 'G2', studentId: 'S410' },
    { id: '5', type: 'Other', severity: 'Low', status: 'Dismissed', timestamp: '2024-05-22T08:30:00Z', location: 'Reception', description: 'Report filed in error by staff member.', reporterId: 'G1', studentId: 'S555' },
  ]);

  const [users, setUsers] = useState<User[]>([
    { 
      id: 'A1', 
      name: 'System Admin', 
      email: 'shaikdilse58@gmail.com', 
      password: 'hitam123', 
      role: 'Admin', 
      isActive: true, 
      status: 'Active',
      createdAt: '2023-01-15T08:00:00Z',
      lastLogin: '2024-05-24T10:30:00Z'
    },
    { 
      id: 'G1', 
      name: 'Rajesh Kumar', 
      email: 'rajesh.k@security.edu', 
      password: '123', 
      role: 'Security', 
      isActive: true, 
      status: 'Active',
      createdAt: '2023-03-20T09:15:00Z',
      lastLogin: '2024-05-23T14:45:00Z'
    },
    { 
      id: 'S101', 
      name: 'Arjun Verma', 
      email: 'arjun.v@student.edu', 
      password: '123', 
      role: 'Student', 
      isActive: true, 
      status: 'Active',
      createdAt: '2023-08-10T12:00:00Z',
      lastLogin: '2024-05-20T11:20:00Z'
    },
  ]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const userIndex = users.findIndex(u => u.email === email && u.password === password);
    const user = users[userIndex];
    
    if (user) {
      if (user.status === 'Pending') {
        setView('ApprovalPending');
      } else if (user.status === 'Rejected') {
        setAuthError('Your access request was rejected by the admin.');
      } else {
        const updatedUser = { ...user, lastLogin: new Date().toISOString() };
        const updatedUsers = [...users];
        updatedUsers[userIndex] = updatedUser;
        setUsers(updatedUsers);
        setCurrentUser(updatedUser);
        setView('Dashboard');
        setAuthError('');
      }
    } else {
      setAuthError('Invalid credentials. Please try again.');
    }
  };

  const handleSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      role: 'Student',
      isActive: false,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      lastLogin: undefined
    };

    setUsers([...users, newUser]);
    setView('ApprovalPending');
  };

  const generateAIAnalysis = async (incident: Incident) => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this campus incident and provide empathy-driven insights for staff:
        Type: ${incident.type}
        Severity: ${incident.severity}
        Location: ${incident.location}
        Description: ${incident.description}
        
        Provide:
        1. Empathy-focused resolution suggestion.
        2. Disciplinary alignment (educational vs punitive).
        3. Prevention tip for campus staff.
        Keep it concise and professional.`,
      });
      setAiAnalysis(response.text || "Analysis could not be generated.");
    } catch (error) {
      console.error("AI Analysis failed:", error);
      setAiAnalysis("Failed to connect to AI engine. Please ensure security parameters are correctly configured.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const approveUser = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: 'Active', isActive: true } : u));
    setNotifications([`User ${id} has been approved.`, ...notifications]);
  };

  const rejectUser = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reject Access Request',
      message: 'Are you sure you want to reject this access request? This user will not be able to log in to the portal.',
      type: 'danger',
      action: () => {
        setUsers(users.map(u => u.id === id ? { ...u, status: 'Rejected', isActive: false } : u));
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const deleteUser = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user?.email === 'shaikdilse58@gmail.com') {
      alert("Master admin cannot be deleted.");
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Permanently Delete User',
      message: `Are you sure you want to delete ${user?.name}? This action cannot be undone and all associated records will be orphaned.`,
      type: 'danger',
      action: () => {
        setUsers(users.filter(u => u.id !== id));
        setNotifications([`User ${user?.name} deleted.`, ...notifications]);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleUpdateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editUser) return;
    
    const formData = new FormData(e.currentTarget);
    const updatedUsers = users.map(u => u.id === editUser.id ? {
      ...u,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as UserRole,
      status: formData.get('status') as UserStatus,
    } : u);

    setUsers(updatedUsers);
    setEditUser(null);
    setNotifications([`Updated profile for ${editUser.name}`, ...notifications]);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('Landing');
    setMenuOpen(false);
  };

  const addIncident = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const timestamp = new Date().toISOString();
    
    const newIncident: Incident = {
      id: Math.random().toString(36).substr(2, 9),
      type: formData.get('type') as IncidentCategory,
      severity: formData.get('severity') as 'Low' | 'Medium' | 'High' | 'Critical',
      location: formData.get('location') as string,
      studentId: formData.get('studentId') as string,
      description: formData.get('description') as string,
      status: 'Pending',
      timestamp: timestamp,
      reporterId: currentUser?.id || 'Unknown',
    };
    
    setIncidents([newIncident, ...incidents]);
    setNotifications([`New ${newIncident.type} report submitted.`, ...notifications]);
    setView('Dashboard');
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Never';
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFullTimestamp = (isoString?: string) => {
    if (!isoString) return 'N/A';
    return `${formatDate(isoString)} at ${formatTime(isoString)}`;
  };

  // Components
  const ConfirmationModal = () => (
    <AnimatePresence>
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 overflow-hidden"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${confirmDialog.type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-heading font-bold text-slate-900 mb-2">{confirmDialog.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">{confirmDialog.message}</p>
              
              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={confirmDialog.action}
                  className={`w-full py-4 rounded-xl font-bold text-white transition-all active:scale-95 ${confirmDialog.type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-guardian-blue hover:bg-blue-700 shadow-blue-200'} shadow-lg`}
                >
                  Confirm Action
                </button>
                <button 
                  onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                  className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const EditProfileModal = () => (
    <AnimatePresence>
      {editUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditUser(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-heading font-bold text-slate-900">Edit User Profile</h3>
                <p className="text-sm text-slate-500">System ID: {editUser.id}</p>
              </div>
              <button onClick={() => setEditUser(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all">
                <X size={20} />
              </button>
            </div>

            <form className="p-8 space-y-6 overflow-y-auto" onSubmit={handleUpdateUser}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      name="name" 
                      defaultValue={editUser.name}
                      className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-guardian-blue outline-none font-medium" 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      name="email" 
                      type="email" 
                      defaultValue={editUser.email}
                      className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-guardian-blue outline-none font-medium" 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Role</label>
                  <select 
                    name="role" 
                    defaultValue={editUser.role}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-guardian-blue outline-none font-medium appearance-none"
                  >
                    <option value="Student">Student</option>
                    <option value="Security">Security</option>
                    <option value="Staff">Staff</option>
                    <option value="Admin">Admin</option>
                    <option value="Parent">Parent</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Status</label>
                  <select 
                    name="status" 
                    defaultValue={editUser.status}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-guardian-blue outline-none font-medium appearance-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Creation Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      disabled 
                      value={formatDate(editUser.createdAt)}
                      className="w-full pl-10 p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last Activity</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      disabled 
                      value={editUser.lastLogin ? getFullTimestamp(editUser.lastLogin) : 'Never'}
                      className="w-full pl-10 p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium" 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 bg-blue-50/30 -mx-8 px-8 pb-8">
                <div className="flex gap-3 pt-6">
                  <button type="button" onClick={() => setEditUser(null)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all">
                    Discard Changes
                  </button>
                  <button type="submit" className="flex-1 py-4 bg-guardian-blue text-white font-bold rounded-xl shadow-lg shadow-blue-500/10 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                    <Save size={20} /> Save Changes
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const IncidentDetailModal = () => (
    <AnimatePresence>
      {viewIncident && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setViewIncident(null); setAiAnalysis(null); }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-8 bg-guardian-dark text-white relative">
              <button 
                onClick={() => { setViewIncident(null); setAiAnalysis(null); }}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-start gap-4 mb-4">
                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                  <Clock size={32} className="text-guardian-green" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-guardian-green mb-1">Incident Timestamp</div>
                  <div className="text-3xl font-heading font-bold">{formatTime(viewIncident.timestamp)}</div>
                  <div className="text-slate-400 font-medium">{formatDate(viewIncident.timestamp)}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Badge type={viewIncident.severity}>{viewIncident.severity} Severity</Badge>
                <Badge type={viewIncident.status}>{viewIncident.status}</Badge>
              </div>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">Category</label>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <Activity size={16} className="text-guardian-blue" />
                    {viewIncident.type}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">Location</label>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <MapPin size={16} className="text-guardian-blue" />
                    {viewIncident.location}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">Involved Student</label>
                  <div className="font-bold text-slate-900">{viewIncident.studentId}</div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">Reported By</label>
                  <div className="font-bold text-slate-900">{viewIncident.reporterId}</div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">Detailed Narrative</label>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                  "{viewIncident.description}"
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BrainCircuit size={18} className="text-guardian-purple" />
                    Guardian AI Insights
                  </h4>
                  {!aiAnalysis && !isAnalyzing && (
                    <button 
                      onClick={() => generateAIAnalysis(viewIncident)}
                      className="text-xs font-bold text-guardian-purple hover:bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200 transition-all flex items-center gap-1.5"
                    >
                      <Sparkles size={14} /> Analyze Incident
                    </button>
                  )}
                </div>

                {isAnalyzing && (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-3">
                    <div className="relative">
                      <Zap size={24} className="text-guardian-purple animate-pulse" />
                      <div className="absolute inset-0 bg-guardian-purple/20 blur-xl animate-pulse"></div>
                    </div>
                    <p className="text-xs font-medium text-slate-500 animate-pulse">Consulting Gemini AI Security Engine...</p>
                  </div>
                )}

                {aiAnalysis && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-gradient-to-br from-purple-50 to-white ai-glow rounded-2xl border border-purple-100 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                      <Shield size={64} className="text-guardian-purple" />
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap relative z-10">
                      {aiAnalysis}
                    </p>
                    <div className="mt-4 pt-3 border-t border-purple-100 flex items-center gap-2 text-[10px] font-bold text-guardian-purple uppercase tracking-widest">
                      <CheckCircle size={12} /> AI-Generated Resolution Proposal
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100">
                 <button 
                  onClick={() => { setViewIncident(null); setAiAnalysis(null); }}
                  className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg"
                 >
                   Return to Log
                 </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-mesh flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-medium">
          <Shield size={16} className="text-guardian-green" /> 
          Advanced Campus Security Platform
        </div>
        <h1 className="text-6xl md:text-8xl font-heading font-bold text-white tracking-tighter leading-none mb-4">
          CAMPUS <br/> <span className="text-guardian-green">GUARDIAN</span>
        </h1>
        <p className="text-xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed">
          The ultimate digital layer for student conduct management, access control, and campus safety. 
          Secured by administrative oversight.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <button 
            onClick={() => setView('Login')}
            className="px-10 py-5 bg-white text-guardian-dark font-bold rounded-2xl hover:bg-slate-100 transition-all shadow-2xl shadow-blue-500/20 active:scale-95 text-lg"
          >
            Login to Portal
          </button>
          <button 
            onClick={() => setView('SignUp')}
            className="px-10 py-5 bg-white/5 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/10 transition-all backdrop-blur-sm text-lg"
          >
            Request Access
          </button>
        </div>
      </div>
      
      {/* Deployment Attribution */}
      <div className="absolute bottom-8 left-0 right-0 z-10 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
        <a 
          href={PRODUCTION_URL} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-[0.2em] hover:text-white transition-colors"
        >
          <Globe size={14} className="text-guardian-green" />
          Live Deployment Verified
        </a>
        <div className="h-[1px] w-24 bg-white/10"></div>
        <p className="text-[10px] text-white/40 tracking-widest">{PRODUCTION_URL}</p>
      </div>
    </div>
  );

  const LoginPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-md p-10">
        <div className="text-center mb-10">
          <button onClick={() => setView('Landing')} className="mb-6 text-slate-400 hover:text-guardian-blue flex items-center gap-2 text-sm mx-auto">
            <ArrowLeft size={16} /> Back to Home
          </button>
          <GradientLogo size="text-4xl" />
          <p className="text-slate-500 text-sm mt-3">Enter your credentials to continue</p>
        </div>
        
        {authError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
            <AlertTriangle size={18} /> {authError}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                name="email"
                type="email" 
                placeholder="email@campus.edu"
                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-guardian-blue outline-none"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
              <button type="button" onClick={() => setView('Forgot')} className="text-xs font-bold text-guardian-blue hover:underline">Forgot?</button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                name="password"
                type="password" 
                placeholder="••••••••"
                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-guardian-blue outline-none"
                required
              />
            </div>
          </div>
          <button className="w-full py-4 bg-guardian-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 active:scale-95">
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <p className="text-slate-500 text-sm">
            Don't have an account? <button onClick={() => setView('SignUp')} className="text-guardian-blue font-bold">Request Access</button>
          </p>
        </div>
      </Card>
    </div>
  );

  const SignUpPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-md p-10">
        <div className="text-center mb-10">
          <button onClick={() => setView('Landing')} className="mb-6 text-slate-400 hover:text-guardian-blue flex items-center gap-2 text-sm mx-auto">
            <ArrowLeft size={16} /> Back
          </button>
          <h2 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Student Signup</h2>
          <p className="text-slate-500 text-sm mt-2">Create an account for manual approval</p>
        </div>

        <form className="space-y-6" onSubmit={handleSignUp}>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                name="name"
                type="text" 
                placeholder="Arjun Verma"
                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-guardian-blue outline-none"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                name="email"
                type="email" 
                placeholder="your.id@hitam.edu"
                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-guardian-blue outline-none"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Set Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                name="password"
                type="password" 
                placeholder="••••••••"
                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-guardian-blue outline-none"
                required
              />
            </div>
          </div>
          <button className="w-full py-4 bg-guardian-dark text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95">
            Submit Request
          </button>
        </form>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
          <Activity size={20} className="text-guardian-blue shrink-0" />
          <p className="text-xs text-blue-800 leading-relaxed">
            Note: Accounts are <strong>manually reviewed</strong> by the campus admin. You will be able to log in once your status is set to "Active".
          </p>
        </div>
      </Card>
    </div>
  );

  const UserManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredUsers = users.filter(u => 
      (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.role.toLowerCase().includes(searchTerm.toLowerCase())) &&
      u.status !== 'Pending'
    );

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-heading font-bold">User Directory</h2>
            <p className="text-slate-500">Overview of all active campus members</p>
          </div>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-guardian-blue w-full sm:w-64"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card className="overflow-hidden p-0 border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">User</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Role</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-slate-400" />
                      Created On
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <History size={12} className="text-slate-400" />
                      Last Activity
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 group transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400 group-hover:bg-blue-50 group-hover:text-guardian-blue transition-colors">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{user.name}</div>
                          <div className="text-xs text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <RoleIcon role={user.role} size={14} />
                        <span className="text-sm font-medium">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-700 font-bold">{formatDate(user.lastLogin)}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{formatTime(user.lastLogin)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setEditUser(user)}
                          className="p-2 text-slate-400 hover:text-guardian-blue hover:bg-blue-50 rounded-xl transition-all"
                          title="Edit User"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteUser(user.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const SidebarItem = ({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-guardian-blue text-white font-bold shadow-lg shadow-blue-500/20' : 'hover:bg-white/5 hover:text-white'}`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );

  // Fix: Added missing component ForgotPasswordPage
  const ForgotPasswordPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-md p-10">
        <div className="text-center mb-10">
          <button onClick={() => setView('Login')} className="mb-6 text-slate-400 hover:text-guardian-blue flex items-center gap-2 text-sm mx-auto">
            <ArrowLeft size={16} /> Back to Login
          </button>
          <h2 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Reset Password</h2>
          <p className="text-slate-500 text-sm mt-2">Enter your email to receive a reset link</p>
        </div>
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Reset link sent!'); setView('Login'); }}>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="email" placeholder="your.id@hitam.edu" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-guardian-blue outline-none" required />
            </div>
          </div>
          <button className="w-full py-4 bg-guardian-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95">
            Send Reset Instructions
          </button>
        </form>
      </Card>
    </div>
  );

  // Fix: Added missing component ApprovalPendingPage
  const ApprovalPendingPage = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8">
        <Clock size={48} className="text-guardian-blue animate-pulse" />
      </div>
      <h2 className="text-4xl font-heading font-bold text-slate-900 mb-4">Request Under Review</h2>
      <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
        Your access request has been submitted to the Campus Administration. 
        You will be granted access once a system administrator verifies your credentials.
      </p>
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => setView('Login')}
          className="px-10 py-4 bg-guardian-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95"
        >
          Return to Login
        </button>
        <button 
          onClick={() => setView('Landing')}
          className="text-slate-400 font-bold hover:text-slate-600 transition-all"
        >
          Back to Homepage
        </button>
      </div>
    </div>
  );

  // Fix: Added missing component ReportIncidentPage
  const ReportIncidentPage = () => (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-heading font-bold">File Incident Report</h2>
        <p className="text-slate-500">Document conduct violations or property damage</p>
      </div>

      <Card className="max-w-2xl">
        <form className="space-y-6" onSubmit={addIncident}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Incident Category</label>
              <select name="type" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-guardian-blue" required>
                <option value="Bunking">Bunking</option>
                <option value="Disrespect">Disrespect</option>
                <option value="Property Damage">Property Damage</option>
                <option value="Physical Altercation">Physical Altercation</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Severity Level</label>
              <select name="severity" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-guardian-blue" required>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input name="location" placeholder="e.g. Block A, 2nd Floor" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-guardian-blue" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Student ID</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input name="studentId" placeholder="e.g. S105" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-guardian-blue" required />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
            <textarea name="description" rows={4} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-guardian-blue resize-none" placeholder="Provide a detailed account of the incident..." required />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setView('Dashboard')} className="px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
            <button type="submit" className="px-10 py-3 bg-guardian-blue text-white font-bold rounded-xl shadow-lg shadow-blue-500/10 hover:bg-blue-700 transition-all flex items-center gap-2">
              <Send size={18} /> Submit Report
            </button>
          </div>
        </form>
      </Card>
    </div>
  );

  // Fix: Added missing component AdminDashboard
  const AdminDashboard = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
        <Shield size={40} />
      </div>
      <h3 className="text-2xl font-heading font-bold text-slate-900 mb-2">Restricted Access</h3>
      <p className="text-slate-500 max-w-sm">This module is strictly reserved for administrative personnel only. Please return to the overview.</p>
      <button 
        onClick={() => setView('Dashboard')}
        className="mt-8 px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
      >
        Return to Overview
      </button>
    </div>
  );

  if (view === 'Landing') return <LandingPage />;
  if (view === 'Login') return <LoginPage />;
  if (view === 'SignUp') return <SignUpPage />;
  if (view === 'Forgot') return <ForgotPasswordPage />;
  if (view === 'ApprovalPending') return <ApprovalPendingPage />;

  return (
    <div className="min-h-screen bg-slate-50">
      <ConfirmationModal />
      <EditProfileModal />
      <IncidentDetailModal />
      
      <nav className="lg:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <GradientLogo size="text-xl" />
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-slate-600"><Menu /></button>
        </div>
      </nav>

      <div className="flex h-screen overflow-hidden">
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-guardian-dark text-slate-400 transition-transform lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'} lg:static shrink-0`}>
          <div className="flex flex-col h-full p-6">
            <div className="mb-10 px-2 flex items-center justify-between">
              <GradientLogo size="text-xl" />
              <button onClick={() => setMenuOpen(false)} className="lg:hidden text-white"><X size={20}/></button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 px-2">Main Menu</div>
              <SidebarItem active={view === 'Dashboard'} icon={<LayoutDashboard size={20}/>} label="Overview" onClick={() => {setView('Dashboard'); setMenuOpen(false);}} />
              
              {(currentUser?.role === 'Admin' || currentUser?.role === 'Security' || currentUser?.role === 'Staff') && (
                <SidebarItem active={view === 'SubmitReport'} icon={<FilePlus size={20}/>} label="Report Incident" onClick={() => {setView('SubmitReport'); setMenuOpen(false);}} />
              )}
              
              {currentUser?.role === 'Admin' && (
                <>
                  <SidebarItem active={view === 'Reports'} icon={<UserCheck size={20}/>} label="The Gatekeeper" onClick={() => {setView('Reports'); setMenuOpen(false);}} />
                  <SidebarItem active={view === 'Users'} icon={<Users size={20}/>} label="User Directory" onClick={() => {setView('Users'); setMenuOpen(false);}} />
                </>
              )}
              
              <SidebarItem active={false} icon={<Settings size={20}/>} label="Preferences" onClick={() => {}} />
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-800">
              {/* Production URL Attribution in Sidebar */}
              <div className="px-2 mb-6">
                 <a 
                   href={PRODUCTION_URL} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors group"
                 >
                   <Globe size={14} className="text-guardian-green group-hover:animate-pulse" />
                   <div className="flex flex-col">
                     <span className="text-[10px] font-bold text-white uppercase tracking-tight">Vercel Deployment</span>
                     <span className="text-[8px] text-slate-500 truncate max-w-[120px]">Live Environment</span>
                   </div>
                   <ExternalLink size={10} className="ml-auto text-slate-600" />
                 </a>
              </div>

              <div className="flex items-center gap-3 px-2 mb-6 overflow-hidden">
                <div className="w-10 h-10 bg-gradient-to-br from-guardian-blue to-guardian-purple rounded-xl flex items-center justify-center text-white font-bold shrink-0">
                  {currentUser?.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{currentUser?.name}</div>
                  <div className="text-[10px] text-slate-500 truncate uppercase tracking-tight">{currentUser?.role} Member</div>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-2 py-2 text-red-400 hover:text-red-300 transition-colors"
              >
                <LogOut size={20} />
                <span className="text-sm font-bold">Log Out</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            {view === 'Dashboard' && (
              <div className="space-y-8 animate-fade-in pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-heading font-bold">Guardian Overview</h2>
                    <p className="text-slate-500">Real-time safety metrics and trend analysis</p>
                  </div>
                  <div className="flex items-center gap-3">
                     <button 
                      onClick={() => setView('SubmitReport')}
                      className="flex items-center gap-2 px-6 py-2 bg-guardian-dark text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md"
                     >
                       <FilePlus size={18} /> Report Incident
                     </button>
                    <button className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 relative">
                      <Bell size={20} />
                      <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="flex items-center gap-4 border-l-4 border-l-guardian-blue">
                    <div className="p-3 bg-blue-50 rounded-xl"><AlertTriangle className="text-guardian-blue" /></div>
                    <div>
                      <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Complaints</div>
                      <div className="text-3xl font-bold">{incidents.length}</div>
                    </div>
                  </Card>
                  <Card className="flex items-center gap-4 border-l-4 border-l-red-500">
                    <div className="p-3 bg-red-50 rounded-xl"><AlertTriangle className="text-red-500" /></div>
                    <div>
                      <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Awaiting Approval</div>
                      <div className="text-3xl font-bold">{users.filter(u => u.status === 'Pending').length}</div>
                    </div>
                  </Card>
                  <Card className="flex items-center gap-4 border-l-4 border-l-guardian-green">
                    <div className="p-3 bg-emerald-50 rounded-xl"><CheckCircle className="text-guardian-green" /></div>
                    <div>
                      <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Staff</div>
                      <div className="text-3xl font-bold">{users.filter(u => u.status === 'Active' && u.role !== 'Student').length}</div>
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card>
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <CheckCircle size={20} className="text-guardian-blue" /> Status Distribution
                    </h3>
                    <PieChart 
                      data={[
                        { label: 'Pending', value: incidents.filter(i => i.status === 'Pending').length, color: '#94A3B8' },
                        { label: 'In Progress', value: incidents.filter(i => i.status === 'In Progress').length, color: '#3B82F6' },
                        { label: 'Resolved', value: incidents.filter(i => i.status === 'Resolved').length, color: '#10B981' },
                        { label: 'Dismissed', value: incidents.filter(i => i.status === 'Dismissed').length, color: '#64748B' },
                      ]} 
                    />
                  </Card>
                  <Card>
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <LayoutDashboard size={20} className="text-guardian-purple" /> Category Breakdown
                    </h3>
                    <BarGraph 
                      data={[
                        { label: 'Bunking', value: incidents.filter(i => i.type === 'Bunking').length, color: '#7C3AED' },
                        { label: 'Property Damage', value: incidents.filter(i => i.type === 'Property Damage').length, color: '#2563EB' },
                        { label: 'Disrespect', value: incidents.filter(i => i.type === 'Disrespect').length, color: '#10B981' },
                        { label: 'Physical', value: incidents.filter(i => i.type === 'Physical Altercation').length, color: '#EF4444' },
                        { label: 'Other', value: incidents.filter(i => i.type === 'Other').length, color: '#94A3B8' },
                      ]} 
                    />
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2"><Filter size={20} className="text-guardian-blue" /> Incidents Log</h3>
                  <Card className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Incident</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Student ID</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Severity</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Status</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Timestamp</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {incidents.map(incident => (
                            <tr key={incident.id} className="hover:bg-slate-50/50 group transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-bold text-slate-900">{incident.type}</div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1 uppercase font-bold tracking-tight">
                                  <MapPin size={10} /> {incident.location}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-slate-600 font-bold">{incident.studentId}</td>
                              <td className="px-6 py-4"><Badge type={incident.severity}>{incident.severity}</Badge></td>
                              <td className="px-6 py-4"><Badge type={incident.status}>{incident.status}</Badge></td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-slate-800">{formatTime(incident.timestamp)}</span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{formatDate(incident.timestamp)}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => setViewIncident(incident)}
                                  className="p-2 text-slate-400 hover:text-guardian-blue hover:bg-blue-50 rounded-xl transition-all"
                                  title="View Full Details"
                                >
                                  <Eye size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              </div>
            )}
            {view === 'Reports' && (currentUser?.role === 'Admin' ? (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-heading font-bold">Access Gatekeeper</h2>
                    <p className="text-slate-500">Verify and approve new campus members</p>
                  </div>
                  <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 text-guardian-blue font-bold text-sm">
                    {users.filter(u => u.status === 'Pending').length} Requests Awaiting
                  </div>
                </div>

                {users.filter(u => u.status === 'Pending').length === 0 ? (
                  <Card className="p-12 text-center text-slate-400">
                    <UserCheck size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No new access requests at the moment.</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {users.filter(u => u.status === 'Pending').map(user => (
                      <Card key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 hover:border-blue-200 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{user.name}</h4>
                            <p className="text-sm text-slate-500">{user.email} • Requested {user.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => rejectUser(user.id)}
                            className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                          >
                            <UserX size={20} />
                          </button>
                          <button 
                            onClick={() => approveUser(user.id)}
                            className="flex items-center gap-2 px-6 py-3 bg-guardian-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md"
                          >
                            <UserCheck size={20} /> Approve Access
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : <AdminDashboard />)}
            {view === 'Users' && <UserManagement />}
            {view === 'SubmitReport' && <ReportIncidentPage />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
