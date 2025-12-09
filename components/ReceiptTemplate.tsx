import React, { useRef } from 'react';
import { SME, Transaction } from '../types';
import { Download, X, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ReceiptTemplateProps {
  transaction: Transaction;
  sme: SME;
  onClose: () => void;
}

export const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({ transaction, sme, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2, // Higher resolution
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Receipt_${transaction.receiptId}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF", err);
      alert("Error generating PDF. Please try again.");
    }
  };

  const remainingBalance = (sme.balance || 0) - transaction.amountPaid; // Balance *after* this payment calculation logic might vary based on when balance is updated, but assuming snapshot.

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-800 text-white p-4 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Printer className="w-5 h-5" /> Print / Save Receipt
          </h2>
          <button onClick={onClose} className="hover:bg-slate-700 p-1 rounded transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50">
          {/* Visual Receipt Box (Target for PDF) */}
          <div 
            ref={receiptRef} 
            className="bg-white border-2 border-slate-800 p-8 mx-auto shadow-sm max-w-md"
            style={{ minHeight: '500px' }}
          >
            {/* Receipt Header */}
            <div className="text-center border-b-2 border-slate-800 pb-6 mb-6">
              <h1 className="text-2xl font-bold tracking-widest text-slate-900">Y IMPACT</h1>
              <p className="text-sm text-slate-500 uppercase tracking-widest mt-1">Payment Receipt</p>
            </div>

            {/* Receipt Details */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="text-xs text-slate-400 uppercase">Receipt No.</div>
                <div className="font-mono text-lg font-bold text-slate-800">{transaction.receiptId}</div>
              </div>

              <div className="flex justify-between items-end">
                <div className="text-xs text-slate-400 uppercase">Date</div>
                <div className="font-medium text-slate-800">{transaction.date}</div>
              </div>

              <div className="my-6 border-t border-dashed border-slate-300"></div>

              <div>
                <div className="text-xs text-slate-400 uppercase mb-1">Received From</div>
                <div className="text-lg font-bold text-slate-900">{sme.name}</div>
                <div className="text-sm text-slate-500">ID: {sme.id}</div>
              </div>

              <div>
                <div className="text-xs text-slate-400 uppercase mb-1">Collector</div>
                <div className="text-sm font-medium text-slate-800">{transaction.collectorName}</div>
              </div>

              <div className="bg-slate-50 p-4 rounded border border-slate-100 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Amount Paid</span>
                  <span className="text-xl font-bold text-emerald-600">
                    ₵{transaction.amountPaid.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 mt-2 pt-2 border-t border-slate-200">
                  <span>Current Balance</span>
                  <span>₵{(sme.balance ?? 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center">
              <p className="text-xs text-slate-400 italic">Thank you for your prompt payment.</p>
              <p className="text-[10px] text-slate-300 mt-4">Y IMPACT • Empowering SMEs</p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          >
            Cancel
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 shadow-lg"
          >
            <Download className="w-4 h-4" />
            Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
};