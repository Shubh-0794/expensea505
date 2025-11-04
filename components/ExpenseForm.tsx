import React, { useState, useEffect } from 'react';
import { Expense } from '../types';
import { v4 as uuidv4 } from 'uuid';
import Avatar from './Avatar';
import { formatIndianCurrency } from '../utils/formatCurrency';

interface ExpenseFormProps {
  people: string[];
  addExpense: (expense: Expense) => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ people, addExpense }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paidBy, setPaidBy] = useState<string>('');
  const [splitWith, setSplitWith] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (people.length > 0 && (!paidBy || !people.includes(paidBy))) {
        setPaidBy(people[0]);
    }
    if (people.length === 0) {
        setPaidBy('');
    }
  }, [people, paidBy]);

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
      date: new Date().toISOString().slice(0, 10), // Add current date
    });

    setSuccess('Expense added successfully!');
    setDescription('');
    setAmount('');
    setSplitWith([]);
    
    setTimeout(() => setSuccess(''), 3000);
  };
  
  const splitAmount = amount && splitWith.length > 0 ? (Number(amount) / splitWith.length) : 0;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Expense Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
            placeholder="Amount ₹"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0.01"
            step="0.01"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700">
              Select People:
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full">{splitWith.length}</span>
            </h3>
            <div className="text-xs">
                <button type="button" onClick={() => setSplitWith(people)} className="font-medium text-blue-600 hover:text-blue-500">Select All</button>
                <span className="mx-1 text-gray-300">|</span>
                <button type="button" onClick={() => setSplitWith([])} className="font-medium text-blue-600 hover:text-blue-500">Deselect All</button>
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
            {people.map((person) => (
              <label key={person} htmlFor={`split-${person}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <div className="flex items-center gap-3">
                  <input
                    id={`split-${person}`}
                    type="checkbox"
                    checked={splitWith.includes(person)}
                    onChange={() => handleToggleSplitWith(person)}
                    className="h-5 w-5 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Avatar name={person} />
                  <span className="font-medium text-gray-800">{person}</span>
                </div>
                {splitWith.includes(person) && (
                  <span className="text-sm font-semibold text-red-700 bg-red-100 px-2 py-1 rounded-md">
                    {formatIndianCurrency(splitAmount)}
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <label htmlFor="paidBy" className="block text-sm font-medium text-gray-700 mb-1">Paid by</label>
          <select
            id="paidBy"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          >
            {people.map((person) => (
              <option key={person} value={person}>
                {person}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
        {success && <p className="text-sm text-center text-green-600 bg-green-100 p-3 rounded-md">{success}</p>}
        
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
        >
          Add Expense
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;