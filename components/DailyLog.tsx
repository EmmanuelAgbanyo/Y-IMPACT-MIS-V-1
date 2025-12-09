import React, { useState } from 'react';
import { SME, Transaction } from '../types';
import { Plus, Search, FileText } from 'lucide-react';

interface DailyLogProps {
  smes: SME[];
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => void;
  onViewReceipt: (t: Transaction) => void;
}

export const DailyLog: React.FC<DailyLogProps> = ({ smes, transactions, onAddTransaction, onViewReceipt }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSmeId, setSelectedSmeId] = useState('');
  const [amount, setAmount] = useState('');
  const [collector, setCollector] = useState('');
  
  const activeSMEs = smes.filter(s => s.status === 'Active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSmeId || !amount || !collector) return;

    const newTransaction: Transaction = {
      receiptId: `R-${100 + transactions.length + 1}`,
      date,
      smeId: selectedSmeId,
      amountPaid: parseFloat(amount),
      collectorName: collector,
    };

    onAddTransaction(newTransaction);
    
    // Reset minimal fields for rapid entry
    setAmount('');
    // Keep date and collector as they likely stay same for a session
    alert("Transaction Logged Successfully!");
  };

  const filteredTransactions = transactions.filter(t => {
    const sme = smes.find(s => s.id === t.smeId);
    const searchString = `${t.receiptId} ${sme?.name} ${t.collectorName}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // Sort by newest first
  const sortedTransactions = [...filteredTransactions].reverse();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Entry Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              Log Payment
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 border p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SME Name</label>
                <select 
                  value={selectedSmeId}
                  onChange={(e) => setSelectedSmeId(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 border p-2"
                  required
                >
                  <option value="">Select SME...</option>
                  {activeSMEs.map(sme => (
                    <option key={sme.id} value={sme.id}>
                      {sme.name} (ID: {sme.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (₵)</label>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 border p-2"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Collector Name</label>
                <input 
                  type="text" 
                  value={collector}
                  onChange={(e) => setCollector(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 border p-2"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                Submit Transaction
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Transaction History Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
            <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-lg font-semibold text-slate-800">Transaction History</h2>
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search receipt, name..."
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm border p-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SME</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collector</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                        No transactions found. Start logging payments!
                      </td>
                    </tr>
                  ) : (
                    sortedTransactions.map((t) => {
                      const sme = smes.find(s => s.id === t.smeId);
                      return (
                        <tr key={t.receiptId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-slate-700">{t.receiptId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sme?.name || 'Unknown'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-emerald-600">
                            ₵{t.amountPaid.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.collectorName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <button 
                              onClick={() => onViewReceipt(t)}
                              className="text-slate-600 hover:text-emerald-600 transition-colors"
                              title="View Receipt"
                            >
                              <FileText className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};