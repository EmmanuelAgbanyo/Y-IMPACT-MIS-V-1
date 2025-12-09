import React, { useState, useEffect, useMemo } from 'react';
import { SME, Transaction, ViewState } from './types';
import { LayoutDashboard, Database, ClipboardList, Menu } from 'lucide-react';
import { MasterDatabase } from './components/MasterDatabase';
import { DailyLog } from './components/DailyLog';
import { Dashboard } from './components/Dashboard';
import { ReceiptTemplate } from './components/ReceiptTemplate';

// Mock Initial Data
const INITIAL_SMES: SME[] = [
  { id: '001', name: 'Alpha Textiles', phone: '555-0101', toolGiven: 'Sewing Machine', totalCost: 500, dailyRate: 10, totalPaid: 0, balance: 500, status: 'Active' },
  { id: '002', name: 'Beta Carpentry', phone: '555-0102', toolGiven: 'Power Drill Set', totalCost: 350, dailyRate: 15, totalPaid: 0, balance: 350, status: 'Active' },
  { id: '003', name: 'Gamma Food', phone: '555-0103', toolGiven: 'Industrial Blender', totalCost: 200, dailyRate: 5, totalPaid: 0, balance: 200, status: 'Active' },
  { id: '004', name: 'Delta Repairs', phone: '555-0104', toolGiven: 'Welding Kit', totalCost: 800, dailyRate: 20, totalPaid: 0, balance: 800, status: 'Active' },
  { id: '005', name: 'Epsilon Crafts', phone: '555-0105', toolGiven: 'Sewing Machine', totalCost: 500, dailyRate: 10, totalPaid: 0, balance: 500, status: 'Active' },
];

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [smes, setSmes] = useState<SME[]>(INITIAL_SMES);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [receiptToView, setReceiptToView] = useState<{ t: Transaction, s: SME } | null>(null);

  // Calculate stats dynamically whenever transactions change
  const processedSMEs = useMemo(() => {
    return smes.map(sme => {
      const totalPaid = transactions
        .filter(t => t.smeId === sme.id)
        .reduce((sum, t) => sum + t.amountPaid, 0);
      
      const balance = Math.max(0, sme.totalCost - totalPaid);
      const status: 'Active' | 'Paid Off' = balance <= 0 ? 'Paid Off' : 'Active';

      return { ...sme, totalPaid, balance, status };
    });
  }, [smes, transactions]);

  const handleAddTransaction = (newTransaction: Transaction) => {
    setTransactions(prev => [...prev, newTransaction]);
    
    // Check if this transaction pays off the SME
    const sme = processedSMEs.find(s => s.id === newTransaction.smeId);
    if (sme) {
      const newBalance = sme.balance! - newTransaction.amountPaid;
      if (newBalance <= 0) {
        // You could trigger a celebration effect here
        console.log(`SME ${sme.name} has paid off their debt!`);
      }
    }
  };

  const handleAddSME = (newSME: SME) => {
    setSmes(prev => [...prev, newSME]);
  };

  const handleUpdateSME = (updatedSME: SME) => {
    setSmes(prev => prev.map(sme => {
      if (sme.id === updatedSME.id) {
        return {
          ...sme,
          name: updatedSME.name,
          phone: updatedSME.phone,
          toolGiven: updatedSME.toolGiven,
          totalCost: updatedSME.totalCost,
          dailyRate: updatedSME.dailyRate
        };
      }
      return sme;
    }));
  };

  const handleDeleteSME = (id: string) => {
    setSmes(prev => prev.filter(sme => sme.id !== id));
  };

  const handleViewReceipt = (transaction: Transaction) => {
    const sme = processedSMEs.find(s => s.id === transaction.smeId);
    if (sme) {
      setReceiptToView({ t: transaction, s: sme });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      {/* Sidebar / Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold tracking-tight">Y IMPACT</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Management Portal</p>
        </div>
        
        <nav className="p-4 space-y-2">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'dashboard' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          
          <button 
            onClick={() => setCurrentView('master-db')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'master-db' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <Database className="w-5 h-5" />
            Master Database
          </button>
          
          <button 
            onClick={() => setCurrentView('daily-log')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'daily-log' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <ClipboardList className="w-5 h-5" />
            Daily Log
          </button>
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-2">System Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-sm font-medium">Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <header className="mb-8 md:hidden flex justify-between items-center">
          <span className="font-bold text-lg">Y IMPACT</span>
          <Menu className="w-6 h-6" />
        </header>

        {currentView === 'dashboard' && <Dashboard smes={processedSMEs} />}
        {currentView === 'master-db' && (
          <MasterDatabase 
            smes={processedSMEs} 
            onAddSME={handleAddSME}
            onUpdateSME={handleUpdateSME}
            onDeleteSME={handleDeleteSME}
          />
        )}
        {currentView === 'daily-log' && (
          <DailyLog 
            smes={processedSMEs} 
            transactions={transactions} 
            onAddTransaction={handleAddTransaction}
            onViewReceipt={handleViewReceipt}
          />
        )}
      </main>

      {/* Modal for Receipt */}
      {receiptToView && (
        <ReceiptTemplate 
          transaction={receiptToView.t} 
          sme={receiptToView.s} 
          onClose={() => setReceiptToView(null)} 
        />
      )}
    </div>
  );
}