
import React from 'react';

interface MonthSelectorProps {
  currentMonth: string;
  availableMonths: string[];
  onMonthChange: (month: string) => void;
}

const formatMonth = (monthStr: string) => {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

const MonthSelector: React.FC<MonthSelectorProps> = ({ currentMonth, availableMonths, onMonthChange }) => {
  return (
    <div className="mt-4">
      <select
        id="month-select"
        value={currentMonth}
        onChange={(e) => onMonthChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm font-semibold transition-colors appearance-none cursor-pointer shadow-sm"
        aria-label="Select month to view data"
      >
        {availableMonths.map((month) => (
          <option key={month} value={month}>
            {formatMonth(month)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MonthSelector;
