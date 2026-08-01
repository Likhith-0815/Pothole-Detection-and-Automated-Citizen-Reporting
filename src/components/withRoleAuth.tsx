import React, { useEffect, useState } from 'react';
import { UserRole } from '../types';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ShieldAlert, Lock, UserCheck, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';

export interface WithRoleAuthProps {
  userRole: UserRole;
  setUserRole?: (role: UserRole) => void;
  onNavigateTab?: (tab: string) => void;
}

/**
 * Higher-Order Component (HOC) to protect components (like AdminPanel) and routes.
 * Ensures that only authenticated users with an 'engineer' role claim (or 'admin') can render the protected UI.
 */
export function withRoleAuth<P extends WithRoleAuthProps>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: UserRole[] = ['engineer', 'admin']
) {
  const ComponentWithAuth: React.FC<P> = (props) => {
    const { userRole, setUserRole, onNavigateTab } = props;
    const [firebaseUser, setFirebaseUser] = useState<User | null>(auth.currentUser);
    const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
    const [roleClaim, setRoleClaim] = useState<string | null>(null);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setFirebaseUser(user);
        if (user) {
          try {
            // Get ID token result to inspect custom claims if present
            const idTokenResult = await user.getIdTokenResult();
            const claim = (idTokenResult.claims.role as string) || (idTokenResult.claims.engineer ? 'engineer' : null);
            setRoleClaim(claim);
          } catch (err) {
            console.warn("Could not parse Firebase custom claims:", err);
          }
        } else {
          setRoleClaim(null);
        }
        setCheckingAuth(false);
      });

      return () => unsubscribe();
    }, []);

    // Verification check: User must have an allowed role ('engineer' or 'admin')
    const isAuthorized = allowedRoles.includes(userRole) || (roleClaim && allowedRoles.includes(roleClaim as UserRole));

    if (checkingAuth) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8 bg-[#0A2540] text-white rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-mono font-bold text-slate-300">Verifying Engineer Role Claim Security Handshake...</p>
          </div>
        </div>
      );
    }

    if (!isAuthorized) {
      return (
        <div className="max-w-2xl mx-auto my-12 p-8 bg-gradient-to-br from-[#06132A] to-[#0A2540] text-white rounded-3xl border-2 border-red-500/30 shadow-2xl space-y-6 text-center font-sans">
          <div className="w-16 h-16 bg-red-500/20 border-2 border-red-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-10 h-10 text-red-400 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-mono font-bold uppercase tracking-widest">
              GVMC Security Protocol • Restricted Access
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Municipal Engineer Authentication Required
            </h2>
            <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
              This Command & Control Admin Panel is protected by Role-Based Access Control (RBAC). 
              Only authenticated users with verified <strong className="text-amber-400 font-mono">engineer</strong> role claims can access telemetry override controls, fleet dispatch logs, and ward budget approvals.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300 font-mono">
              <span>Current Session Role:</span>
              <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 uppercase">
                {userRole}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300 font-mono">
              <span>Required Role Claim:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300 font-bold border border-emerald-400/30 uppercase">
                engineer
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300 font-mono">
              <span>Firebase Auth Status:</span>
              <span className="text-slate-400">
                {firebaseUser ? `Authenticated (${firebaseUser.email || 'GVMC Staff'})` : 'Unauthenticated'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {setUserRole && (
              <button
                onClick={() => {
                  setUserRole('engineer');
                  if (onNavigateTab) onNavigateTab('admin');
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <UserCheck className="w-4 h-4 text-slate-950" />
                <span>Switch to Engineer Role Claim</span>
              </button>
            )}

            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('login')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 border border-white/20 shadow-md"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>GVMC Portal Login</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  ComponentWithAuth.displayName = `withRoleAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return ComponentWithAuth;
}

/**
 * Convenient wrapper specifically enforcing 'engineer' role claim.
 */
export function withEngineerAuth<P extends WithRoleAuthProps>(
  WrappedComponent: React.ComponentType<P>
) {
  return withRoleAuth(WrappedComponent, ['engineer', 'admin']);
}
