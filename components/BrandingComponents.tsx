
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Shield, Lock, Users, AlertCircle, FileText } from 'lucide-react';

export const GradientLogo = ({ size = "text-3xl" }: { size?: string }) => (
  <div className={`font-heading font-bold ${size} gradient-logo tracking-tighter uppercase`}>
    Campus Guardian
  </div>
);

export const RoleIcon = ({ role, size = 20 }: { role: string, size?: number }) => {
  switch (role) {
    case 'Admin': return <Lock size={size} className="text-red-500" />;
    case 'Security': return <Shield size={size} className="text-blue-600" />;
    case 'Student': return <Users size={size} className="text-purple-600" />;
    case 'Parent': return <Users size={size} className="text-green-600" />;
    default: return <FileText size={size} className="text-gray-500" />;
  }
};

export const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

// Fix: Updated Badge component props to use React.ReactNode for children and rely on the 'type' prop 
// for styling lookup. This resolves the TypeScript error in App.tsx where multiple child nodes 
// (e.g., dynamic text + static string) were passed to the Badge component.
export const Badge = ({ children, type }: { children: React.ReactNode, type: string }) => {
  const styles: Record<string, string> = {
    Critical: "bg-red-200 text-red-900 border border-red-300",
    High: "bg-red-100 text-red-700 border border-red-200",
    Medium: "bg-orange-100 text-orange-700 border border-orange-200",
    Low: "bg-blue-100 text-blue-700 border border-blue-200",
    Pending: "bg-slate-100 text-slate-600 border border-slate-200",
    Resolved: "bg-green-100 text-green-700 border border-green-200",
    "In Progress": "bg-blue-100 text-blue-700 border border-blue-200",
    Dismissed: "bg-slate-200 text-slate-700 border border-slate-300",
  };
  return (
    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${styles[type] || styles.Pending}`}>
      {children}
    </span>
  );
};
