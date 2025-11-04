import React, { useState, useMemo } from 'react';
import { Expense } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import Avatar from './Avatar';
import { formatIndianCurrency } from '../utils/formatCurrency';

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
    // Adding timeZone to avoid off-by-one day errors
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
        console.error(`Failed to load or parse data for month ${month}:`, error);
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
      <h2 className="text-xl font-bold text-center text-gray-800">Expense History</h2>
      {availableMonths.length > 0 ? (
        <div className="space-y-3">
          {availableMonths.map((month) => {
            const isExpanded = expandedMonth === month;
            const data = monthlyData[month];

            return (
              <div key={month} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => handleToggleMonth(month)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none"
                >
                  <div>
                    <p className="font-bold text-gray-800">{formatMonth(month)}</p>
                    {data && (
                       <p className="text-sm text-gray-500">
                           {data.expenses.length} expenses totalling {formatIndianCurrency(data.totalAmount)}
                       </p>
                    )}
                  </div>
                  {isExpanded ? <ChevronUpIcon className="w-6 h-6 text-gray-500" /> : <ChevronDownIcon className="w-6 h-6 text-gray-500" />}
                </button>
                {isExpanded && data && (
                  <div className="p-4 bg-white">
                    {data.expenses.length > 0 ? (
                        <div className="space-y-6">
                            {Object.entries(groupExpensesByDate(data.expenses))
                                .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                                .map(([date, expensesOnDate]) => (
                                <div key={date}>
                                    <h4 className="text-sm font-semibold text-gray-600 bg-gray-100 p-2 rounded-md mb-3 sticky top-0">{formatDate(date)}</h4>
                                    <ul className="space-y-3 pl-2 border-l-2 border-gray-200 ml-2">
                                        {expensesOnDate.map(expense => (
                                            <li key={expense.id} className="text-sm">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar name={expense.paidBy} />
                                                        <div>
                                                           <p className="font-medium text-gray-800">{expense.description}</p>
                                                           <p className="text-xs text-gray-500">Paid by {expense.paidBy}</p>
                                                        </div>
                                                    </div>
                                                    <span className="font-semibold font-mono text-yellow-700">{formatIndianCurrency(expense.amount)}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-4">No expenses recorded for this month.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          <p>No historical data found.</p>
        </div>
      )}
    </div>
  );
};

export default History;