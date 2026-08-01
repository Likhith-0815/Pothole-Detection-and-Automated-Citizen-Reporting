import React from 'react';
import { WardBudget } from '../types';
import { DollarSign, PieChart, TrendingUp, AlertTriangle, ShieldCheck, Building2 } from 'lucide-react';

interface BudgetPanelProps {
  budgets: WardBudget[];
}

export const BudgetPanel: React.FC<BudgetPanelProps> = ({ budgets }) => {
  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocatedINR, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spentINR, 0);
  const totalPending = budgets.reduce((sum, b) => sum + b.pendingEstimatesINR, 0);
  const overallUtilization = Math.round((totalSpent / totalAllocated) * 100);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#0F1F44] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <PieChart className="w-6 h-6 text-[#22C55E]" />
            GVMC Ward Budget Intelligence & Audit
          </h1>
          <p className="text-xs text-[#AAB6D4] mt-0.5">
            Transparent municipal expenditure tracking, AI-driven pre-repair cost estimations, and zonal utilization
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-[#13294B] border border-emerald-500/30 text-emerald-400 font-bold">
            Total Allocated: ₹{(totalAllocated / 100000).toFixed(1)} Lakhs
          </div>
        </div>
      </div>

      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[#13294B] border border-white/10">
          <span className="text-xs font-mono font-bold text-[#AAB6D4] uppercase">Total Spent to Date</span>
          <div className="text-3xl font-black text-white mt-1">₹{(totalSpent / 100000).toFixed(2)} Lakhs</div>
          <p className="text-[11px] text-emerald-400 mt-1 font-bold">{overallUtilization}% Budget Utilized</p>
        </div>

        <div className="p-5 rounded-xl bg-[#13294B] border border-white/10">
          <span className="text-xs font-mono font-bold text-[#AAB6D4] uppercase">Pending AI Work Orders</span>
          <div className="text-3xl font-black text-[#00D9FF] mt-1">₹{(totalPending / 1000).toFixed(0)}k</div>
          <p className="text-[11px] text-[#AAB6D4] mt-1">Estimates calculated from surface area & depth</p>
        </div>

        <div className="p-5 rounded-xl bg-[#13294B] border border-white/10">
          <span className="text-xs font-mono font-bold text-[#AAB6D4] uppercase">Remaining Contingency</span>
          <div className="text-3xl font-black text-emerald-400 mt-1">
            ₹{((totalAllocated - totalSpent) / 100000).toFixed(2)} Lakhs
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 font-bold">Unallocated Reserves</p>
        </div>
      </div>

      {/* WARD BUDGET TABLE */}
      <div className="p-6 rounded-2xl bg-[#13294B] border border-white/10 shadow-2xl space-y-4">
        <h3 className="font-extrabold text-base text-white">GVMC Ward-Wise Allocation Breakdown</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#AAB6D4]">
            <thead className="bg-[#0F1F44] text-white uppercase text-[10px] font-mono border-b border-white/10">
              <tr>
                <th className="p-3">Ward Name</th>
                <th className="p-3">Officer in Charge</th>
                <th className="p-3">Allocated (₹)</th>
                <th className="p-3">Spent (₹)</th>
                <th className="p-3">Pending AI Est. (₹)</th>
                <th className="p-3">Active Defects</th>
                <th className="p-3">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {budgets.map((b) => {
                const util = Math.round((b.spentINR / b.allocatedINR) * 100);
                return (
                  <tr key={b.wardCode} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-bold text-white">{b.wardName}</td>
                    <td className="p-3">{b.officerInCharge}</td>
                    <td className="p-3 font-mono">₹{(b.allocatedINR / 100000).toFixed(1)}L</td>
                    <td className="p-3 font-mono text-white">₹{(b.spentINR / 100000).toFixed(1)}L</td>
                    <td className="p-3 font-mono text-[#00D9FF]">₹{b.pendingEstimatesINR.toLocaleString()}</td>
                    <td className="p-3 font-bold">
                      <span className={b.criticalCount > 0 ? 'text-red-400' : 'text-emerald-400'}>
                        {b.activePotholesCount} ({b.criticalCount} Critical)
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-[#06132A] h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${util > 80 ? 'bg-amber-400' : 'bg-emerald-400'}`} 
                            style={{ width: `${util}%` }} 
                          />
                        </div>
                        <span className="font-mono text-[10px] font-bold text-white">{util}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
