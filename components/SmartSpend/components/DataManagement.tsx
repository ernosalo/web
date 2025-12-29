
import React, { useRef } from 'react';
import { Transaction, TransactionType } from '../types';

interface DataManagementProps {
  transactions: Transaction[];
  onImport: (transactions: Transaction[]) => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({ transactions, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => {
    try {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
      }
    } catch (e) {}
    return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(transactions, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const exportFileDefaultName = `smartspend-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.href = url;
      linkElement.download = exportFileDefaultName;
      document.body.appendChild(linkElement);
      linkElement.click();
      document.body.removeChild(linkElement);
      URL.revokeObjectURL(url);
    } catch (err) {
      // Export failures are rare and should likely still be notified if they occur
      alert('Failed to export data.');
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; 
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result !== 'string') return;

      try {
        const json = JSON.parse(result);
        if (!Array.isArray(json)) return;

        const validated: Transaction[] = json
          .filter(item => item && typeof item === 'object')
          .map((item: any) => {
            const description = item.description || item.desc || 'Imported';
            const amount = item.amount !== undefined ? Number(item.amount) : 0;
            const category = item.category || 'Other';
            const date = item.date || new Date().toISOString().split('T')[0];
            
            let type = TransactionType.EXPENSE;
            const rawType = String(item.type || '').toUpperCase();
            if (rawType === 'INCOME') {
              type = TransactionType.INCOME;
            }

            return {
              id: item.id || generateId(),
              description: String(description),
              amount: isNaN(amount) ? 0 : Math.abs(amount),
              type,
              category: String(category),
              date: String(date)
            };
          });

        if (validated.length > 0) {
          onImport(validated);
        }
      } catch (err) {
        // Silently fail as requested
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
      <div className="flex items-center space-x-2 mb-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Data Management</h3>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Backup your data or move it to another device by exporting your transactions.
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleExport}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors text-sm font-medium border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Export</span>
        </button>

        <button
          onClick={handleImportClick}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors text-sm font-medium border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Import</span>
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".json"
      />
    </div>
  );
};
