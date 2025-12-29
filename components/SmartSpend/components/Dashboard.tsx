
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Transaction, TransactionType, FinancialSummary } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  summary: FinancialSummary;
  theme: 'light' | 'dark';
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export const Dashboard: React.FC<DashboardProps> = ({ transactions, summary, theme }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Ensuring the component is mounted and the browser had time to layout
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const expenseData = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc: any[], curr) => {
      const existing = acc.find(item => item.name === curr.category);
      if (existing) {
        existing.value += curr.amount;
      } else {
        acc.push({ name: curr.category, value: curr.amount });
      }
      return acc;
    }, []);

  const latestDate = transactions.length > 0 
    ? new Date(Math.max(...transactions.map(t => new Date(t.date).getTime())))
    : new Date();

  const last7DaysData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(latestDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayIncome = transactions
      .filter(t => t.date === dateStr && t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const dayExpense = transactions
      .filter(t => t.date === dateStr && t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      date: dateStr.split('-').slice(1).join('/'),
      income: dayIncome,
      expense: dayExpense,
    };
  }).reverse();

  const displayData = expenseData.length > 0 
    ? expenseData 
    : [{ name: 'No Expenses', value: 0.0001 }];

  const isDarkMode = theme === 'dark';
  const gridColor = isDarkMode ? '#1e293b' : '#f1f5f9';
  const axisColor = isDarkMode ? '#64748b' : '#94a3b8';
  const tooltipTextColor = isDarkMode ? '#ffffff' : '#1e293b';
  const tooltipBgColor = isDarkMode ? '#0f172a' : '#fff';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Total Balance</p>
          <p className={`text-2xl font-bold ${summary.totalBalance >= 0 ? 'text-slate-800 dark:text-white' : 'text-red-600'}`}>
            ${summary.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 border-l-4 border-l-green-500 transition-colors">
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Total Income</p>
          <p className="text-2xl font-bold text-green-600">
            +${summary.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 border-l-4 border-l-red-500 transition-colors">
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">
            -${summary.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors min-w-0">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">Expense Breakdown</h3>
          <div className="w-full h-[300px] min-h-[300px] relative overflow-hidden">
            {isReady && (
              <ResponsiveContainer 
                width="100%" 
                height={300}
                minWidth={0}
                minHeight={0}
                key={`pie-${transactions.length}-${theme}`}
              >
                <PieChart>
                  <Pie
                    data={displayData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={expenseData.length > 0 ? 5 : 0}
                    dataKey="value"
                    stroke="none"
                  >
                    {expenseData.length > 0 ? (
                      expenseData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))
                    ) : (
                      <Cell fill={isDarkMode ? '#1e293b' : '#f1f5f9'} /> 
                    )}
                  </Pie>
                  {expenseData.length > 0 && (
                    <Tooltip 
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        backgroundColor: tooltipBgColor,
                      }}
                      itemStyle={{ color: tooltipTextColor }}
                      labelStyle={{ color: tooltipTextColor }}
                    />
                  )}
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors min-w-0">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">Activity (Last 7 Days)</h3>
          <div className="w-full h-[300px] min-h-[300px] relative overflow-hidden">
            {isReady && (
              <ResponsiveContainer 
                width="100%" 
                height={300}
                minWidth={0}
                minHeight={0}
                key={`bar-${transactions.length}-${theme}`}
              >
                <BarChart data={last7DaysData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="date" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      backgroundColor: tooltipBgColor,
                    }}
                    itemStyle={{ color: tooltipTextColor }}
                    labelStyle={{ color: tooltipTextColor }}
                  />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                  <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
