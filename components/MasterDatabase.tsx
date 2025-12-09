import React, { useState } from 'react';
import { SME } from '../types';
import { Search, AlertCircle, CheckCircle, Plus, X, Pencil, Trash2, AlertTriangle, Download } from 'lucide-react';

interface MasterDatabaseProps {
  smes: SME[];
  onAddSME: (sme: SME) => void;
  onUpdateSME: (sme: SME) => void;
  onDeleteSME: (id: string) => void;
}

export const MasterDatabase: React.FC<MasterDatabaseProps> = ({ smes, onAddSME, onUpdateSME, onDeleteSME }) => {
  const [filter, setFilter] = useState('');
  
  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Data States
  const [isEditing, setIsEditing] = useState(false);
  const [smeToDelete, setSmeToDelete] = useState<SME | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    phone: '',
    toolGiven: '',
    totalCost: '',
    dailyRate: ''
  });

  const filteredSMEs = smes.filter(sme => 
    sme.name.toLowerCase().includes(filter.toLowerCase()) || 
    sme.id.includes(filter) ||
    sme.toolGiven.toLowerCase().includes(filter.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errorMessage) setErrorMessage('');
  };

  // Helper to generate the next available ID
  const generateNextId = () => {
    const numericIds = smes
      .map(s => parseInt(s.id, 10))
      .filter(n => !isNaN(n));
    
    const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
    return (maxId + 1).toString().padStart(3, '0');
  };

  const handleExportCSV = () => {
    // Define headers
    const headers = ['ID', 'Name', 'Phone', 'Tool Given', 'Total Cost', 'Daily Rate', 'Total Paid', 'Balance', 'Status'];
    
    // Convert data to CSV rows
    const csvContent = [
      headers.join(','),
      ...filteredSMEs.map(sme => [
        sme.id,
        `"${sme.name}"`, // Quote to handle commas in names
        sme.phone,
        `"${sme.toolGiven}"`,
        sme.totalCost,
        sme.dailyRate,
        sme.totalPaid || 0,
        sme.balance || 0,
        sme.status
      ].join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `y_impact_sme_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Edit Handlers ---
  const handleEditClick = (sme: SME) => {
    setFormData({
      id: sme.id,
      name: sme.name,
      phone: sme.phone,
      toolGiven: sme.toolGiven,
      totalCost: sme.totalCost.toString(),
      dailyRate: sme.dailyRate.toString()
    });
    setIsEditing(true);
    setIsFormModalOpen(true);
    setErrorMessage('');
  };

  const openAddModal = () => {
    setFormData({
      id: generateNextId(), // Auto-generate ID
      name: '',
      phone: '',
      toolGiven: '',
      totalCost: '',
      dailyRate: ''
    });
    setIsEditing(false);
    setIsFormModalOpen(true);
    setErrorMessage('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name || !formData.totalCost) return;

    // Note: ID uniqueness check is no longer strictly necessary as we auto-generate it based on max ID,
    // but the ID field is read-only so the user cannot introduce conflicts manually.

    const smePayload: SME = {
      id: formData.id,
      name: formData.name,
      phone: formData.phone,
      toolGiven: formData.toolGiven,
      totalCost: parseFloat(formData.totalCost),
      dailyRate: parseFloat(formData.dailyRate),
      // Derived values
      totalPaid: 0, 
      balance: 0, 
      status: 'Active'
    };

    if (isEditing) {
      onUpdateSME(smePayload);
    } else {
      onAddSME(smePayload);
    }

    setIsFormModalOpen(false);
    setErrorMessage('');
  };

  // --- Delete Handlers ---
  const handleDeleteClick = (sme: SME) => {
    setSmeToDelete(sme);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (smeToDelete) {
      onDeleteSME(smeToDelete.id);
      setIsDeleteModalOpen(false);
      setSmeToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Master Database</h2>
            <p className="text-sm text-gray-500 mt-1">Manage SME details, update terms, or remove records.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search SME ID, Name, Tool..."
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm border p-2"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            
            <button 
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>

            <button 
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add SME
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">SME Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tool Given</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total Cost</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Daily Rate</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Paid</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSMEs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                    No SMEs found matching your search.
                  </td>
                </tr>
              ) : (
                filteredSMEs.map((sme) => {
                  const percentPaid = sme.totalPaid && sme.totalCost ? (sme.totalPaid / sme.totalCost) * 100 : 0;
                  return (
                    <tr key={sme.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{sme.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{sme.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sme.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {sme.toolGiven}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-medium">
                        ₵{sme.totalCost.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        ₵{sme.dailyRate.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-emerald-600 font-medium">
                        ₵{(sme.totalPaid || 0).toLocaleString()}
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                          <div 
                            className="bg-emerald-500 h-1 rounded-full" 
                            style={{ width: `${Math.min(100, percentPaid)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-rose-600 font-medium">
                        ₵{(sme.balance || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {sme.status === 'Paid Off' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3" /> Paid Off
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            <AlertCircle className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleEditClick(sme)}
                            className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-md hover:bg-indigo-50 transition-colors"
                            title="Edit Details"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(sme)}
                            className="text-rose-600 hover:text-rose-900 p-1.5 rounded-md hover:bg-rose-50 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                {isEditing ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {isEditing ? 'Edit SME Details' : 'Add New SME'}
              </h3>
              <button onClick={() => setIsFormModalOpen(false)} className="text-gray-300 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {errorMessage && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-sm text-red-700">{errorMessage}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SME ID <span className="text-gray-400 font-normal ml-1">(Auto-generated)</span>
                </label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  readOnly
                  className="w-full rounded-md shadow-sm border p-2 bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 border p-2"
                  placeholder="Business or Owner Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 border p-2"
                  placeholder="Contact Number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tool Given</label>
                <input
                  type="text"
                  name="toolGiven"
                  required
                  value={formData.toolGiven}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 border p-2"
                  placeholder="e.g. Sewing Machine"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost (₵)</label>
                  <input
                    type="number"
                    name="totalCost"
                    required
                    min="0"
                    step="0.01"
                    value={formData.totalCost}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 border p-2"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daily Rate (₵)</label>
                  <input
                    type="number"
                    name="dailyRate"
                    required
                    min="0"
                    step="0.01"
                    value={formData.dailyRate}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 border p-2"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  {isEditing ? 'Save Changes' : 'Add SME'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && smeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden p-6">
             <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
             </div>
             
             <div className="text-center">
               <h3 className="text-lg font-medium text-gray-900">Delete SME Record?</h3>
               <p className="mt-2 text-sm text-gray-500">
                 Are you sure you want to delete <strong>{smeToDelete.name}</strong>?
               </p>
               
               {(smeToDelete.totalPaid || 0) > 0 && (
                 <div className="mt-3 bg-amber-50 border border-amber-200 rounded-md p-2">
                   <p className="text-xs text-amber-800 text-left">
                     <strong>Warning:</strong> This SME has recorded payments of <strong>₵{smeToDelete.totalPaid}</strong>. 
                     Deleting this record will orphan transaction history.
                   </p>
                 </div>
               )}
               
               <p className="mt-2 text-sm text-gray-500">
                 This action cannot be undone.
               </p>
             </div>

             <div className="mt-6 flex gap-3">
               <button
                 onClick={() => setIsDeleteModalOpen(false)}
                 className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
               >
                 Cancel
               </button>
               <button
                 onClick={confirmDelete}
                 className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
               >
                 Delete
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};