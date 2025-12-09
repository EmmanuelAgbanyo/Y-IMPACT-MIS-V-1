import React from 'react';
import { SME } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, DollarSign, Briefcase, Activity } from 'lucide-react';

interface DashboardProps {
  smes: SME[];
}

export const Dashboard: React.FC<DashboardProps> = ({ smes }) => {
  // Aggregate Calculations
  const totalSMEs = smes.length;
  const activeSMEs = smes.filter(s => s.status === 'Active').length;
  const paidOffSMEs = smes.filter(s => s.status === 'Paid Off').length;
  
  const totalPossibleRevenue = smes.reduce((acc, curr) => acc + curr.totalCost, 0);
  const totalCollected = smes.reduce((acc, curr) => acc + (curr.totalPaid || 0), 0);
  const totalOutstanding = totalPossibleRevenue - totalCollected;

  // Chart Data
  const statusData = [
    { name: 'Active', value: activeSMEs, color: '#F59E0B' }, // Amber
    { name: 'Paid Off', value: paidOffSMEs, color: '#10B981' }, // Emerald
  ];

  const toolDistribution = smes.reduce((acc: any, curr) => {
    const existing = acc.find((i: any) => i.name === curr.toolGiven);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: curr.toolGiven, value: 1 });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total SMEs</p>
            <p className="text-2xl font-bold text-gray-900">{totalSMEs}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
            <span className="text-xl font-bold">₵</span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Collected</p>
            <p className="text-2xl font-bold text-gray-900">₵{totalCollected.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-rose-100 rounded-lg text-rose-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Outstanding Debt</p>
            <p className="text-2xl font-bold text-gray-900">₵{totalOutstanding.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Paid Off Clients</p>
            <p className="text-2xl font-bold text-gray-900">{paidOffSMEs}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-80">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Repayment Status</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-80">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tool Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={toolDistribution}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip cursor={{fill: '#f3f4f6'}} />
              <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};