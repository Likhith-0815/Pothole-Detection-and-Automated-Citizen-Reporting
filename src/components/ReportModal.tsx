import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Incident, WardBudget } from '../types';
import { FileText, Download, CheckCircle2, Building2, X, Sparkles } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: Incident[];
  budgets: WardBudget[];
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  incidents,
  budgets
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const totalIncidents = incidents.length;
  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL').length;
  const resolvedCount = incidents.filter(i => i.status === 'RESOLVED').length;
  const totalSpent = budgets.reduce((sum, b) => sum + b.spentINR, 0);

  const downloadPDF = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const doc = new jsPDF();

      doc.setFillColor(6, 19, 42);
      doc.rect(0, 0, 210, 30, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("CIVICEYE VIZAG - MUNICIPAL REPORT", 14, 18);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Greater Visakhapatnam Municipal Corporation (GVMC) • Team Allide", 14, 24);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("1. Executive Summary", 14, 42);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 50);
      doc.text(`Total Defect Incidents Logged: ${totalIncidents}`, 14, 56);
      doc.text(`Critical Threats Identified: ${criticalCount}`, 14, 62);
      doc.text(`Repairs Resolved & Verified: ${resolvedCount}`, 14, 68);
      doc.text(`Total Budget Expenditure: Rs. ${totalSpent.toLocaleString()}`, 14, 74);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("2. Active Incident Log", 14, 90);

      let y = 100;
      incidents.slice(0, 6).forEach((inc, idx) => {
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(`${idx + 1}. [${inc.severity}] ${inc.title}`, 14, y);
        doc.setFont("helvetica", "normal");
        doc.text(`   Location: ${inc.locationName} | Est. Depth: ${inc.estimatedDepthCm}cm | Cost: Rs. ${inc.estimatedCostINR.toLocaleString()}`, 14, y + 5);
        y += 12;
      });

      doc.save(`GVMC_CivicEye_Report_${Date.now()}.pdf`);
      setIsGenerating(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#13294B] border border-white/15 shadow-2xl p-6 space-y-6 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#00D9FF]/10 text-[#00D9FF]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">GVMC Municipal Audit Report</h2>
              <p className="text-xs text-[#AAB6D4]">Official Infrastructure & Repair Logistics Summary</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#0F1F44] hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Report Preview Card */}
        <div className="p-5 rounded-xl bg-[#06132A] border border-white/10 text-xs space-y-3 font-mono">
          <div className="flex justify-between border-b border-white/10 pb-2 text-[#00D9FF] font-bold">
            <span>GVMC CIVICEYE AUDIT SUMMARY</span>
            <span>DATE: {new Date().toLocaleDateString()}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[#AAB6D4]">
            <div>• Total Incidents: <span className="text-white font-bold">{totalIncidents}</span></div>
            <div>• Critical Threats: <span className="text-red-400 font-bold">{criticalCount}</span></div>
            <div>• Resolved Repairs: <span className="text-emerald-400 font-bold">{resolvedCount}</span></div>
            <div>• Total Spend: <span className="text-white font-bold">₹{totalSpent.toLocaleString()}</span></div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <span className="text-white font-bold block mb-1">Recent Ward Breakdown:</span>
            {budgets.slice(0, 3).map(b => (
              <div key={b.wardCode} className="flex justify-between text-[11px] text-[#AAB6D4]">
                <span>{b.wardName}</span>
                <span>Spent: ₹{(b.spentINR/100000).toFixed(1)}L</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={downloadPDF}
            disabled={isGenerating}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#3B82F6] text-[#06132A] font-extrabold text-xs hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-[#00D9FF]/20"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? 'Generating Official PDF...' : 'Download Official PDF Report'}
          </button>
        </div>

      </div>
    </div>
  );
};
