
import React, { useState, useMemo } from 'react';
import { Expense } from '../types.ts';
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';
import { ChevronUpIcon } from './icons/ChevronUpIcon.tsx';
import Avatar from './Avatar.tsx';
import { formatIndianCurrency } from '../utils/formatCurrency.ts';

interface HistoryProps {
  availableMonths: string[];
}

const formatMonth = (monthStr: string) => {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

interface MonthData {
  people: string[];
  expenses: Expense[];
  totalAmount: number;
}

const History: React.FC<HistoryProps> = ({ availableMonths }) => {
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const handleToggleMonth = (month: string) => {
    setExpandedMonth(prev => (prev === month ? null : month));
  };

  const monthlyData = useMemo(() => {
    const data: Record<string, MonthData> = {};
    availableMonths.forEach(month => {
      try {
        const rawData = localStorage.getItem(`expense_data_${month}`);
        if (rawData) {
          const parsedData = JSON.parse(rawData);
          const totalAmount = parsedData.expenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0);
          data[month] = { ...parsedData, totalAmount };
        }
      } catch (error) {
        console.error(`Failed to load data for month ${month}:`, error);
      }
    });
    return data;
  }, [availableMonths]);
  
  const groupExpensesByDate = (expenses: Expense[]): Record<string, Expense[]> => {
      return expenses.reduce((acc, expense) => {
          const date = expense.date;
          if (!acc[date]) {
              acc[date] = [];
          }
          acc[date].push(expense);
          return acc;
      }, {} as Record<string, Expense[]>);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center text-gray-800 dark:text-slate-100">Expense History</h2>
      {availableMonths.length > 0 ? (
        <div className="space-y-3">
          {availableMonths.map((month) => {
            const isExpanded = expandedMonth === month;
            const data = monthlyData[month];

            return (
              <div key={month} className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden transition-colors">
                <button
                  onClick={() => handleToggleMonth(month)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
                >
                  <div className="text-left">
                    <p className="font-bold text-gray-800 dark:text-slate-200">{formatMonth(month)}</p>
                    {data && (
                       <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-slate-500 tracking-tighter">
                           {data.expenses.length} expenses • {formatIndianCurrency(data.totalAmount)}
                       </p>
                    )}
                  </div>
                  {isExpanded ? <ChevronUpIcon className="w-6 h-6 text-gray-400" /> : <ChevronDownIcon className="w-6 h-6 text-gray-400" />}
                </button>
                {isExpanded && data && (
                  <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 transition-colors animate-in slide-in-from-top-2 duration-300">
                    {data.expenses.length > 0 ? (
                        <div className="space-y-6">
                            {Object.entries(groupExpensesByDate(data.expenses))
                                .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                                .map(([date, expensesOnDate]) => (
                                <div key={date}>
                                    <h4 className="text-[10px] font-black uppercase text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800/50 p-2 rounded-lg mb-3 tracking-widest">{formatDate(date)}</h4>
                                    <ul className="space-y-3 pl-2 border-l-2 border-gray-200 dark:border-slate-800 ml-2 transition-colors">
                                        {expensesOnDate.map(expense => (
                                            <li key={expense.id} className="text-sm">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar name={expense.paidBy} />
                                                        <div>
                                                           <p className="font-bold text-gray-800 dark:text-slate-300">{expense.description}</p>
                                                           <p className="text-[10px] text-gray-400 uppercase font-medium">Paid by {expense.paidBy}</p>
                                                        </div>
                                                    </div>
                                                    <span className="font-bold font-mono text-yellow-700 dark:text-yellow-500">{formatIndianCurrency(expense.amount)}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-slate-500 py-4 text-xs">No expenses recorded for this month.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-slate-500 py-10">
          <p>No historical data found.</p>
        </div>
      )}
    </div>
  );
};

export default History;
