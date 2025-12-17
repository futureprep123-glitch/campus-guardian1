
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
  UserX
} from 'lucide-react';
import { User, UserRole, Incident, IncidentCategory, IncidentStatus } from './types';
import { GradientLogo, RoleIcon, Card, Badge } from './components/BrandingComponents';
import { PieChart, BarGraph } from './components/DashboardStats';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'Landing' | 'Login' | 'SignUp' | 'Forgot' | 'Dashboard' | 'Reports' | 'Users' | 'ApprovalPending'>('Landing');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [authError, setAuthError] = useState('');

  // Mock Database
  const [incidents, setIncidents] = useState<Incident[]>([
    { id: '1', type: 'Bunking', severity: 'Medium', status: 'Pending', timestamp: '2024-05-20 10:30', location: 'Canteen Area', description: 'Student seen leaving premises during class hours.', reporterId: 'G1', studentId: 'S101' },
    { id: '2', type: 'Property Damage', severity: 'High', status: 'In Progress', timestamp: '2024-05-19 14:15', location: 'Science Lab', description: 'Window broken in Lab B.', reporterId: 'G2', studentId: 'S202' },
  ]);

  const [users, setUsers] = useState<User[]>([
    { id: 'A1', name: 'System Admin', email: 'shaikdilse58@gmail.com', password: 'hitam123', role: 'Admin', isActive: true, status: 'Active' },
    { id: 'G1', name: 'Rajesh Kumar', email: 'rajesh.k@security.edu', password: '123', role: 'Security', isActive: true, status: 'Active' },
    { id: 'S101', name: 'Arjun Verma', email: 'arjun.v@student.edu', password: '123', role: 'Student', isActive: true, status: 'Active' },
  ]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      if (user.status === 'Pending') {
        setView('ApprovalPending');
      } else if (user.status === 'Rejected') {
        setAuthError('Your access request was rejected by the admin.');
      } else {
        setCurrentUser(user);
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
      status: 'Pending'
    };

    setUsers([...users, newUser]);
    setView('ApprovalPending');
  };

  const approveUser = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: 'Active', isActive: true } : u));
    setNotifications([`User ${id} has been approved.`, ...notifications]);
  };

  const rejectUser = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: 'Rejected', isActive: false } : u));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('Landing');
    setMenuOpen(false);
  };

  const addIncident = (incident: Omit<Incident, 'id' | 'status' | 'timestamp'>) => {
    const timestamp = new Date().toLocaleString();
    const newIncident: Incident = {
      ...incident,
      id: Math.random().toString(36).substr(2, 9),
      status: 'Pending',
      timestamp: timestamp,
    };
    setIncidents([newIncident, ...incidents]);
    setView('Dashboard');
  };

  // Views
  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-mesh flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-medium">
          <Shield size={16} className="text-guardian-green" /> 
          Advanced Campus Security Platform
        </div>
        <h1 className="text-6xl md:text-8xl font-heading font-bold text-white tracking-tighter leading-none mb-4">
          CAMPUS <br/> <span className="text-guardian-green">GUARDIAN</span>
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
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

  const ApprovalPendingPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-md p-10 text-center space-y-8">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <Clock size={40} className="text-guardian-blue" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Approval Pending</h2>
          <p className="text-slate-500">Your registration has been submitted successfully.</p>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed">
          The campus administrator needs to verify your identity before granting access to the Guardian portal. 
          Please check back in 24-48 hours.
        </p>
        <button 
          onClick={() => setView('Landing')}
          className="w-full py-4 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
        >
          Return to Home
        </button>
      </Card>
    </div>
  );

  const ForgotPasswordPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-md p-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Reset Password</h2>
          <p className="text-slate-500 text-sm mt-2">Enter your registered email address</p>
        </div>
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Reset link sent to your email.'); setView('Login'); }}>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="email" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-guardian-blue outline-none" required />
            </div>
          </div>
          <button className="w-full py-4 bg-guardian-blue text-white font-bold rounded-xl shadow-lg shadow-blue-500/10">
            Send Reset Link
          </button>
          <button type="button" onClick={() => setView('Login')} className="w-full text-sm text-slate-500 hover:text-guardian-blue">
            Back to Login
          </button>
        </form>
      </Card>
    </div>
  );

  const ApprovalPortal = () => {
    const pending = users.filter(u => u.status === 'Pending');

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-heading font-bold">Access Gatekeeper</h2>
            <p className="text-slate-500">Verify and approve new campus members</p>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 text-guardian-blue font-bold text-sm">
            {pending.length} Requests Awaiting
          </div>
        </div>

        {pending.length === 0 ? (
          <Card className="p-12 text-center text-slate-400">
            <UserCheck size={48} className="mx-auto mb-4 opacity-20" />
            <p>No new access requests at the moment.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pending.map(user => (
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
    );
  };

  const AdminDashboard = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold">Guardian Overview</h2>
          <p className="text-slate-500">Real-time safety metrics and trend analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg flex items-center gap-2 text-sm">
            <Clock size={16} className="text-slate-400" />
            <span>Active Session</span>
          </div>
          <button className="p-2 bg-guardian-blue text-white rounded-lg hover:bg-blue-700">
            <Bell size={20} />
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
              { label: 'Pending', value: 45, color: '#94A3B8' },
              { label: 'In Progress', value: 25, color: '#3B82F6' },
              { label: 'Resolved', value: 30, color: '#10B981' },
            ]} 
          />
        </Card>
        <Card>
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <LayoutDashboard size={20} className="text-guardian-purple" /> Category Breakdown
          </h3>
          <BarGraph 
            data={[
              { label: 'Bunking', value: 34, color: '#7C3AED' },
              { label: 'Property Damage', value: 12, color: '#2563EB' },
              { label: 'Disrespect', value: 22, color: '#10B981' },
              { label: 'Physical', value: 8, color: '#EF4444' },
            ]} 
          />
        </Card>
      </div>
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

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">User</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Role</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400">
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button className="p-1.5 text-slate-400 hover:text-guardian-blue hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                        <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
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

  if (view === 'Landing') return <LandingPage />;
  if (view === 'Login') return <LoginPage />;
  if (view === 'SignUp') return <SignUpPage />;
  if (view === 'Forgot') return <ForgotPasswordPage />;
  if (view === 'ApprovalPending') return <ApprovalPendingPage />;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Nav */}
      <nav className="lg:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <GradientLogo size="text-xl" />
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-slate-600"><Menu /></button>
        </div>
      </nav>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-guardian-dark text-slate-400 transition-transform lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'} lg:static shrink-0`}>
          <div className="flex flex-col h-full p-6">
            <div className="mb-10 px-2 flex items-center justify-between">
              <GradientLogo size="text-xl" />
              <button onClick={() => setMenuOpen(false)} className="lg:hidden text-white"><X size={20}/></button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 px-2">Main Menu</div>
              <SidebarItem active={view === 'Dashboard'} icon={<LayoutDashboard size={20}/>} label="Overview" onClick={() => {setView('Dashboard'); setMenuOpen(false);}} />
              
              {currentUser?.role === 'Admin' && (
                <>
                  <SidebarItem active={view === 'Reports'} icon={<UserCheck size={20}/>} label="The Gatekeeper" onClick={() => {setView('Reports'); setMenuOpen(false);}} />
                  <SidebarItem active={view === 'Users'} icon={<Users size={20}/>} label="User Directory" onClick={() => {setView('Users'); setMenuOpen(false);}} />
                </>
              )}
              
              <SidebarItem active={false} icon={<Settings size={20}/>} label="Preferences" onClick={() => {}} />
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-800">
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

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            {view === 'Dashboard' && <AdminDashboard />}
            {view === 'Reports' && (currentUser?.role === 'Admin' ? <ApprovalPortal /> : <AdminDashboard />)}
            {view === 'Users' && <UserManagement />}
          </div>
        </main>
      </div>
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

export default App;
