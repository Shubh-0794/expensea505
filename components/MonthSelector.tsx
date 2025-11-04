import React from 'react';

interface MonthSelectorProps {
  currentMonth: string;
  availableMonths: string[];
  onMonthChange: (month: string) => void;
}

const formatMonth = (monthStr: string) => { // "2024-07"
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' }); // "July 2024"
};

const MonthSelector: React.FC<MonthSelectorProps> = ({ currentMonth, availableMonths, onMonthChange }) => {
  return (
    <div className="mt-4">
      <select
        id="month-select"
        value={currentMonth}
        onChange={(e) => onMonthChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
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