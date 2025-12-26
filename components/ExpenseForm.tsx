
import React, { useState, useEffect } from 'react';
import { Expense } from '../types.ts';
import { v4 as uuidv4 } from 'uuid';
import Avatar from './Avatar.tsx';
import { formatIndianCurrency } from '../utils/formatCurrency.ts';

interface ExpenseFormProps {
  people: string[];
  addExpense: (expense: Expense) => void;
  currentUser: string | null;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ people, addExpense, currentUser }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paidBy, setPaidBy] = useState<string>('');
  const [splitWith, setSplitWith] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Update paidBy whenever people or currentUser changes
  useEffect(() => {
    if (people.length > 0) {
      if (currentUser && people.includes(currentUser)) {
        setPaidBy(currentUser);
      } else if (!paidBy || !people.includes(paidBy)) {
        setPaidBy(people[0]);
      }
    } else {
      setPaidBy('');
    }
  }, [people, currentUser]);

  const handleToggleSplitWith = (person: string) => {
    setSplitWith(prev => 
      prev.includes(person) ? prev.filter(p => p !== person) : [...prev, person]
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!description.trim() || !amount || amount <= 0 || !paidBy || splitWith.length === 0) {
      setError('Please fill in all fields and select at least one person to split with.');
      return;
    }
    
    addExpense({
      id: uuidv4(),
      description: description.trim(),
      amount: Number(amount),
      paidBy,
      splitWith,
      date: new Date().toISOString().slice(0, 10),
    });

    setSuccess('Expense added successfully!');
    setDescription('');
    setAmount('');
    setSplitWith([]);
    
    if (currentUser && people.includes(currentUser)) {
       setPaidBy(currentUser);
    }
    
    setTimeout(() => setSuccess(''), 3000);
  };
  
  const splitAmount = amount && splitWith.length > 0 ? (Number(amount) / splitWith.length) : 0;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-1 ml-1">Expense Detail</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Dinner, Fuel, Rent"
            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-slate-100 transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-1 ml-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
            placeholder="₹ 0.00"
            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-gray-900 dark:text-slate-100 transition-colors"
            min="0.01"
            step="0.01"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">
              Split With:
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-blue-500 rounded-full shadow-sm">{splitWith.length}</span>
            </h3>
            <div className="text-[10px] uppercase font-bold">
                <button type="button" onClick={() => setSplitWith(people)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 transition-colors">All</button>
                <span className="mx-2 text-gray-300 dark:text-slate-700">|</span>
                <button type="button" onClick={() => setSplitWith([])} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 transition-colors">None</button>
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2 pr-2 border border-gray-200 dark:border-slate-800 rounded-xl p-2 bg-gray-50/30 dark:bg-slate-800/20 shadow-inner transition-colors">
            {people.map((person) => (
              <label key={person} htmlFor={`split-${person}`} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 cursor-pointer hover:border-blue-200 dark:hover:border-blue-800 transition-all">
                <div className="flex items-center gap-2">
                  <input
                    id={`split-${person}`}
                    type="checkbox"
                    checked={splitWith.includes(person)}
                    onChange={() => handleToggleSplitWith(person)}
                    className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                  />
                  <Avatar name={person} />
                  <span className={`text-sm ${splitWith.includes(person) ? 'font-bold text-gray-900 dark:text-slate-100' : 'text-gray-600 dark:text-slate-400'}`}>
                    {person}
                  </span>
                </div>
                {splitWith.includes(person) && (
                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded border border-red-100 dark:border-red-800/30">
                    {formatIndianCurrency(splitAmount)}
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <label htmlFor="paidBy" className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-1 ml-1">Who Paid?</label>
          <select
            id="paidBy"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-sm font-semibold text-gray-900 dark:text-slate-100 transition-colors"
          >
            {people.map((person) => (
              <option key={person} value={person}>
                {person} {currentUser === person ? '(Me)' : ''}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-[11px] font-bold text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-900/30">{error}</p>}
        {success && <p className="text-[11px] font-bold text-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-100 dark:border-green-900/30">{success}</p>}
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-md shadow-blue-100 dark:shadow-none active:scale-95"
        >
          Save Expense
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
