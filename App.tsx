
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
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
  Bell,
  Settings,
  MapPin,
  Clock,
  Edit2,
  Trash2,
  Activity,
  Lock,
  Mail,
  ArrowLeft,
  UserCheck,
  UserX,
  Filter,
  Calendar,
  Save,
  Send,
  Eye,
  History,
  Sparkles,
  Zap,
  BrainCircuit,
  ExternalLink,
  Globe,
  Info,
  ChevronRight,
  MoreVertical,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { User, UserRole, Incident, IncidentCategory, IncidentStatus, UserStatus } from './types';
import { GradientLogo, RoleIcon, Card, Badge } from './components/BrandingComponents';
import { PieChart, BarGraph } from './components/DashboardStats';

interface AppNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'Landing' | 'Login' | 'SignUp' | 'Forgot' | 'Dashboard' | 'Gatekeeper' | 'Users' | 'ApprovalPending' | 'SubmitReport' | 'IncidentLogs'>('Landing');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [authError, setAuthError] = useState('');

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

  const pushNotification = (message: string, type: AppNotification['type'] = 'info') => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

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
        pushNotification(`Welcome back, ${user.name}`, 'success');
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
    pushNotification('Registration request submitted successfully.', 'success');
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
    pushNotification(`User approved successfully.`, 'success');
  };

  const rejectUser = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reject Access Request',
      message: 'Are you sure you want to reject this access request? This user will not be able to log in to the portal.',
      type: 'danger',
      action: () => {
        setUsers(users.map(u => u.id === id ? { ...u, status: 'Rejected', isActive: false } : u));
        pushNotification(`User access request rejected.`, 'warning');
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('Landing');
    setMenuOpen(false);
    pushNotification('Logged out successfully.', 'info');
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
    pushNotification(`New ${newIncident.type} report submitted.`, 'info');
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

  // UI Components
  const NotificationToast = () => (
    <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.filter(n => !n.isRead).slice(0, 3).map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="pointer-events-auto min-w-[280px] bg-white rounded-2xl shadow-2xl p-4 flex items-start gap-3 border-l-4 overflow-hidden relative"
            style={{ 
              borderLeftColor: 
                notif.type === 'success' ? '#10B981' : 
                notif.type === 'error' ? '#EF4444' : 
                notif.type === 'warning' ? '#F59E0B' : '#2563EB' 
            }}
          >
            <div className={`p-2 rounded-xl ${
                notif.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 
                notif.type === 'error' ? 'bg-red-50 text-red-500' : 
                notif.type === 'warning' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'
            }`}>
              {notif.type === 'success' ? <CheckCircle size={18}/> : <Info size={18}/>}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900 leading-tight pr-4">{notif.message}</p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">{formatTime(notif.timestamp)}</p>
            </div>
            <button 
              onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n))}
              className="absolute top-2 right-2 text-slate-300 hover:text-slate-500"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  const NotificationHistoryDropdown = () => (
    <AnimatePresence>
      {showNotifications && (
        <>
          <div className="fixed inset-0 z-[140]" onClick={() => setShowNotifications(false)} />
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-12 right-0 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 z-[150] overflow-hidden"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h4 className="text-sm font-bold text-slate-900">Activity History</h4>
              <button 
                onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
                className="text-[10px] font-bold text-guardian-blue uppercase hover:underline"
              >
                Mark all read
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <Bell className="mx-auto mb-3 opacity-10" size={40} />
                  <p className="text-xs text-slate-400">No activity logged yet</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div key={notif.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors flex gap-3 ${!notif.isRead ? 'bg-blue-50/30' : ''}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      notif.type === 'success' ? 'bg-emerald-500' : 
                      notif.type === 'error' ? 'bg-red-500' : 
                      notif.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">{notif.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{formatTime(notif.timestamp)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
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
            onClick={() => {setViewIncident(null); setAiAnalysis(null);}}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <Badge type={viewIncident.severity}>{viewIncident.severity}</Badge>
                <h3 className="text-xl font-heading font-bold text-slate-900">{viewIncident.type} Report</h3>
              </div>
              <button onClick={() => {setViewIncident(null); setAiAnalysis(null);}} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student ID</p>
                  <p className="font-bold text-slate-900">{viewIncident.studentId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</p>
                  <p className="font-bold text-slate-900 flex items-center gap-1"><MapPin size={14}/> {viewIncident.location}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date & Time</p>
                  <p className="font-bold text-slate-900">{formatDate(viewIncident.timestamp)} at {formatTime(viewIncident.timestamp)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Status</p>
                  <Badge type={viewIncident.status}>{viewIncident.status}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event Description</p>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 leading-relaxed italic">
                  "{viewIncident.description}"
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <BrainCircuit size={16} className="text-guardian-purple"/> AI Case Insight
                  </p>
                  {!aiAnalysis && !isAnalyzing && (
                    <button 
                      onClick={() => generateAIAnalysis(viewIncident)}
                      className="px-4 py-1.5 bg-guardian-purple/10 text-guardian-purple text-xs font-bold rounded-full hover:bg-guardian-purple hover:text-white transition-all flex items-center gap-2"
                    >
                      <Sparkles size={14}/> Analyze with AI
                    </button>
                  )}
                </div>

                {isAnalyzing ? (
                  <div className="p-8 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-4">
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="text-guardian-purple"
                    >
                      <Sparkles size={32} />
                    </motion.div>
                    <p className="text-sm font-medium text-slate-500 animate-pulse">Gemini is synthesizing behavioral patterns...</p>
                  </div>
                ) : aiAnalysis ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-gradient-to-br from-guardian-purple/5 to-blue-50 border border-guardian-purple/10 rounded-3xl"
                  >
                    <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line leading-relaxed">
                      {aiAnalysis}
                    </div>
                  </motion.div>
                ) : null}
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all">
                Add Official Note
              </button>
              <button className="flex-1 py-3 bg-guardian-blue text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all">
                Mark as Resolved
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const ViewTransitions = ({ children }: { children: React.ReactNode }) => (
    <AnimatePresence mode="wait">
      <motion.div
        key={view}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
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
          Secured by administrative oversight and empathy-driven AI.
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
              <input name="email" type="email" placeholder="email@campus.edu" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-guardian-blue outline-none" required />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input name="password" type="password" placeholder="••••••••" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-guardian-blue outline-none" required />
            </div>
          </div>
          <button className="w-full py-4 bg-guardian-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95">
            Sign In
          </button>
        </form>
      </Card>
    </div>
  );

  const SignUpPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-md p-10">
        <div className="text-center mb-10">
          <button onClick={() => setView('Landing')} className="mb-6 text-slate-400 hover:text-guardian-blue flex items-center gap-2 text-sm mx-auto">
            <ArrowLeft size={16} /> Back to Home
          </button>
          <GradientLogo size="text-4xl" />
          <p className="text-slate-500 text-sm mt-3">Request access to the portal</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSignUp}>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input name="name" type="text" placeholder="John Doe" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-guardian-blue outline-none" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input name="email" type="email" placeholder="email@campus.edu" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-guardian-blue outline-none" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input name="password" type="password" placeholder="••••••••" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-guardian-blue outline-none" required />
            </div>
          </div>
          <button className="w-full py-4 bg-guardian-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95">
            Submit Request
          </button>
          <p className="text-center text-xs text-slate-400 mt-4">
            Already have an account? <button type="button" onClick={() => setView('Login')} className="text-guardian-blue font-bold hover:underline">Sign In</button>
          </p>
        </form>
      </Card>
    </div>
  );

  const ApprovalPendingPage = () => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-lg p-12 text-center space-y-8">
        <div className="w-24 h-24 bg-blue-50 text-guardian-blue rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Clock size={48} />
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-heading font-bold text-slate-900 leading-tight">Identity Verification <br/> in Progress</h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            Your request for access has been logged. For campus safety, an administrator must manually verify your credentials before access is granted.
          </p>
        </div>
        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 text-blue-700 text-sm font-medium">
          Check back in 24-48 hours. You will be able to log in once approved.
        </div>
        <button 
          onClick={handleLogout}
          className="px-10 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all flex items-center gap-2 mx-auto"
        >
          <LogOut size={20} /> Logout
        </button>
      </Card>
    </div>
  );

  const SidebarItem = ({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-guardian-blue text-white font-bold shadow-lg shadow-blue-500/20' : 'hover:bg-white/5 hover:text-white'}`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );

  const DashboardOverview = () => (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-slate-900">Guardian Overview</h2>
          <p className="text-slate-500">Real-time safety metrics and trend analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setView('SubmitReport')} className="flex items-center gap-2 px-6 py-2 bg-guardian-dark text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md">
            <FilePlus size={18} /> Report Incident
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 relative"
            >
              <Bell size={20} />
              {notifications.some(n => !n.isRead) && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
              )}
            </button>
            <NotificationHistoryDropdown />
          </div>
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
    </div>
  );

  const IncidentLogsView = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-slate-900">Incident Logs</h2>
          <p className="text-slate-500">Detailed history of all reported campus events</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-medium">
            <Filter size={18}/> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-medium">
            <Calendar size={18}/> Date Range
          </button>
        </div>
      </div>

      <Card className="overflow-hidden border-none p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Incident</th>
                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Severity</th>
                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {incidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-5">
                    <p className="font-bold text-slate-900">{incident.type}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={10}/> {incident.location}</p>
                  </td>
                  <td className="p-5">
                    <p className="font-medium text-slate-700">{incident.studentId}</p>
                  </td>
                  <td className="p-5">
                    <Badge type={incident.severity}>{incident.severity}</Badge>
                  </td>
                  <td className="p-5">
                    <Badge type={incident.status}>{incident.status}</Badge>
                  </td>
                  <td className="p-5 text-sm text-slate-500">
                    {formatDate(incident.timestamp)}
                  </td>
                  <td className="p-5 text-center">
                    <button 
                      onClick={() => setViewIncident(incident)}
                      className="p-2 text-slate-400 hover:text-guardian-blue hover:bg-blue-50 rounded-lg transition-all"
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
  );

  const ReportIncidentForm = () => (
    <div className="space-y-8">
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
            <button type="submit" className="px-10 py-3 bg-guardian-blue text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
              <Send size={18} /> Submit Report
            </button>
          </div>
        </form>
      </Card>
    </div>
  );

  const ApprovalRequests = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-heading font-bold text-slate-900">Access Requests</h2>
        <p className="text-slate-500">Verify and approve new campus members</p>
      </div>
      {users.filter(u => u.status === 'Pending').length === 0 ? (
        <Card className="p-12 text-center text-slate-400">
          <Shield size={48} className="mx-auto mb-4 opacity-10" />
          <p>No new access requests awaiting review.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {users.filter(u => u.status === 'Pending').map(user => (
            <Card key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 hover:border-blue-200 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 group-hover:bg-blue-50 transition-colors rounded-full flex items-center justify-center font-bold text-slate-400 group-hover:text-guardian-blue">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{user.name}</h4>
                  <p className="text-sm text-slate-500">{user.email} • Requested {user.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => rejectUser(user.id)} className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100">
                  <UserX size={20} />
                </button>
                <button onClick={() => approveUser(user.id)} className="flex items-center gap-2 px-6 py-3 bg-guardian-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md">
                  <UserCheck size={20} /> Approve Access
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  if (view === 'Landing') return <LandingPage />;
  if (view === 'Login') return <LoginPage />;
  if (view === 'SignUp') return <SignUpPage />;
  if (view === 'ApprovalPending') return <ApprovalPendingPage />;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <NotificationToast />
      <IncidentDetailModal />
      
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-guardian-dark text-slate-400 transition-transform lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'} lg:static shrink-0`}>
        <div className="flex flex-col h-full p-6">
          <div className="mb-10 px-2 flex items-center justify-between">
            <GradientLogo size="text-xl" />
            <button onClick={() => setMenuOpen(false)} className="lg:hidden text-white"><X size={20}/></button>
          </div>

          <nav className="flex-1 space-y-1">
            <SidebarItem active={view === 'Dashboard'} icon={<LayoutDashboard size={20}/>} label="Overview" onClick={() => {setView('Dashboard'); setMenuOpen(false);}} />
            
            {(currentUser?.role === 'Admin' || currentUser?.role === 'Security') && (
              <>
                <SidebarItem active={view === 'SubmitReport'} icon={<FilePlus size={20}/>} label="Report Incident" onClick={() => {setView('SubmitReport'); setMenuOpen(false);}} />
                <SidebarItem active={view === 'IncidentLogs'} icon={<ClipboardList size={20}/>} label="Incident History" onClick={() => {setView('IncidentLogs'); setMenuOpen(false);}} />
              </>
            )}

            {currentUser?.role === 'Admin' && (
              <>
                <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Gatekeeper</div>
                <SidebarItem active={view === 'Gatekeeper'} icon={<UserCheck size={20}/>} label="Access Requests" onClick={() => {setView('Gatekeeper'); setMenuOpen(false);}} />
                <SidebarItem active={view === 'Users'} icon={<Users size={20}/>} label="User Directory" onClick={() => {setView('Users'); setMenuOpen(false);}} />
              </>
            )}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-800">
            <div className="px-4 py-3 mb-4 rounded-xl bg-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-guardian-blue text-white flex items-center justify-center font-bold text-xs uppercase">
                {currentUser?.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-500">{currentUser?.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-2 py-2 text-red-400 hover:text-red-300 transition-colors">
              <LogOut size={20} />
              <span className="text-sm font-bold">Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
        <nav className="lg:hidden bg-white border-b border-slate-200 p-4 -mx-6 -mt-6 mb-6 flex items-center justify-between sticky top-0 z-[40]">
           <GradientLogo size="text-xl" />
           <button onClick={() => setMenuOpen(true)} className="p-2 text-slate-600"><Menu /></button>
        </nav>

        <div className="max-w-6xl mx-auto h-full">
          <ViewTransitions>
            {view === 'Dashboard' && <DashboardOverview />}
            {view === 'SubmitReport' && <ReportIncidentForm />}
            {view === 'IncidentLogs' && <IncidentLogsView />}
            {view === 'Gatekeeper' && <ApprovalRequests />}
            {view === 'Users' && <div className="text-center p-20 text-slate-400">User Directory Module - In Development</div>}
          </ViewTransitions>
        </div>
      </main>
    </div>
  );
};

export default App;
