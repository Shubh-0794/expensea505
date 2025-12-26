
import React, { useState, useMemo, useEffect } from 'react';
import { Expense } from '../types.ts';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { EditIcon } from './icons/EditIcon.tsx';
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';
import { ChevronUpIcon } from './icons/ChevronUpIcon.tsx';
import Avatar from './Avatar.tsx';
import { formatIndianCurrency } from '../utils/formatCurrency.ts';

interface ExpenseListProps {
  expenses: Expense[];
  removeExpense: (id: string) => void;
  people: string[];
  editExpense: (id: string, updatedExpenseData: Partial<Omit<Expense, 'id'>>) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, removeExpense, people, editExpense }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{
    description: string;
    amount: number | '';
    paidBy: string;
    splitWith: string[];
  } | null>(null);

  const [filterType, setFilterType] = useState<'all' | 'paidBy' | 'splitWith'>('all');
  const [filterPerson, setFilterPerson] = useState<string>('');

  useEffect(() => {
    if (!editingId) {
      setEditFormData(null);
      return;
    }

    const expenseToEdit = expenses.find(exp => exp.id === editingId);
    if (expenseToEdit) {
      setEditFormData({
        description: expenseToEdit.description,
        amount: expenseToEdit.amount,
        paidBy: expenseToEdit.paidBy,
        splitWith: [...expenseToEdit.splitWith],
      });
    } else {
      setEditingId(null);
    }
  }, [editingId, expenses]);


  const filteredExpenses = useMemo(() => {
    if (filterType === 'all' || !filterPerson) {
      return expenses;
    }
    if (filterType === 'paidBy') {
      return expenses.filter(expense => expense.paidBy === filterPerson);
    }
    if (filterType === 'splitWith') {
      return expenses.filter(expense => expense.splitWith.includes(filterPerson));
    }
    return expenses;
  }, [expenses, filterType, filterPerson]);


  if (expenses.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-slate-500 py-10">
        <p>No expenses added yet.</p>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleEditClick = (expense: Expense) => {
    setEditingId(expense.id);
    setExpandedId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = () => {
    if (editingId && editFormData) {
      if (!editFormData.description.trim() || !editFormData.amount || editFormData.amount <= 0 || !editFormData.paidBy || editFormData.splitWith.length === 0) {
        alert('Please fill all fields.');
        return;
      }
      editExpense(editingId, {
        ...editFormData,
        amount: Number(editFormData.amount),
      });
      setEditingId(null);
    }
  };

  const handleEditFormChange = (field: keyof typeof editFormData, value: any) => {
    setEditFormData(prev => (prev ? { ...prev, [field]: value } : null));
  };

  const handleToggleSplitWith = (person: string) => {
    setEditFormData(prev => {
      if (!prev) return null;
      const newSplitWith = prev.splitWith.includes(person)
        ? prev.splitWith.filter(p => p !== person)
        : [...prev.splitWith, person];
      return { ...prev, splitWith: newSplitWith };
    });
  };

  const handleFilterTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilterType = e.target.value as 'all' | 'paidBy' | 'splitWith';
    setFilterType(newFilterType);
    if (newFilterType === 'all') {
      setFilterPerson('');
    }
  };

  const handleClearFilter = () => {
    setFilterType('all');
    setFilterPerson('');
  };


  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center text-gray-800 dark:text-slate-100">Expense List</h2>
      
      <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-800 space-y-3 transition-colors">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300">Filter Expenses</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={filterType}
            onChange={handleFilterTypeChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm transition-colors"
          >
            <option value="all">Show All Expenses</option>
            <option value="paidBy">Paid by...</option>
            <option value="splitWith">Split with...</option>
          </select>
          
          {filterType !== 'all' && (
            <select
              value={filterPerson}
              onChange={(e) => setFilterPerson(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm transition-colors"
            >
              <option value="">-- Select Person --</option>
              {people.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          )}
        </div>
        {filterType !== 'all' && filterPerson && (
          <div className="flex justify-end">
            <button
              onClick={handleClearFilter}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 transition-colors uppercase tracking-widest"
            >
              Clear Filter
            </button>
          </div>
        )}
      </div>

      {filteredExpenses.length === 0 && expenses.length > 0 && (
        <div className="text-center text-gray-500 dark:text-slate-500 py-10">
            <p>No expenses match your filter.</p>
        </div>
      )}

      <ul className="space-y-3">
        {filteredExpenses.map((expense) => {
          const share = expense.amount / expense.splitWith.length;
          const isExpanded = expandedId === expense.id;
          const isEditing = editingId === expense.id;

          return (
            <li key={expense.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 transition-all hover:shadow-lg dark:hover:border-slate-600">
              {isEditing && editFormData ? (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-slate-100">Editing: <span className="font-normal opacity-70">{expense.description}</span></h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase block mb-1">Description</label>
                      <input
                        type="text"
                        value={editFormData.description}
                        onChange={(e) => handleEditFormChange('description', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-slate-100 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase block mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        value={editFormData.amount}
                        onChange={(e) => handleEditFormChange('amount', e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-slate-100 font-mono transition-colors"
                        min="0.01"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase block mb-1">Paid by</label>
                      <select
                        value={editFormData.paidBy}
                        onChange={(e) => handleEditFormChange('paidBy', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-slate-100 transition-colors"
                      >
                        {people.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Split with</h4>
                      <div className="max-h-32 overflow-y-auto space-y-1 pr-2 border border-gray-200 dark:border-slate-700 rounded-lg p-2 bg-gray-50/50 dark:bg-slate-900/50 transition-colors">
                        {people.map(p => (
                          <label key={p} className="flex items-center gap-3 p-2 bg-white dark:bg-slate-800 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                            <input type="checkbox" checked={editFormData.splitWith.includes(p)} onChange={() => handleToggleSplitWith(p)} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-blue-600" />
                            <span className="text-sm text-gray-800 dark:text-slate-300">{p}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700 mt-2">
                    <button onClick={handleCancelEdit} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-slate-300 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded-lg transition-colors">Cancel</button>
                    <button onClick={handleSaveEdit} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">Save</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div className="overflow-hidden">
                      <p className="font-bold text-gray-800 dark:text-slate-100 truncate">{expense.description}</p>
                      <p className="text-lg font-mono font-semibold text-yellow-600 dark:text-yellow-500">{formatIndianCurrency(expense.amount)}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 mt-2">
                        <button onClick={() => handleEditClick(expense)} className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors"><EditIcon className="w-4 h-4" /></button>
                        <button onClick={() => removeExpense(expense.id)} className="hover:text-red-500 transition-all duration-200 ease-in-out hover:scale-125 hover:-rotate-12"><TrashIcon className="w-4 h-4" /></button>
                        <span className="flex items-center gap-1">
                          split among <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 dark:bg-red-600 rounded-full">{expense.splitWith.length}</span> people
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleExpand(expense.id)}
                      className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {isExpanded ? <ChevronUpIcon className="w-6 h-6" /> : <ChevronDownIcon className="w-6 h-6" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 animate-in fade-in duration-300">
                      <p className="text-xs text-gray-500 dark:text-slate-400 mb-3 uppercase tracking-widest font-bold">Paid by: <strong className="text-gray-800 dark:text-slate-200">{expense.paidBy}</strong></p>
                      <ul className="grid grid-cols-1 gap-2">
                        {expense.splitWith.map((person) => (
                          <li key={person} className="flex justify-between items-center text-sm bg-gray-50 dark:bg-slate-900/50 p-2 rounded-lg border border-gray-100 dark:border-slate-800 transition-colors">
                            <div className="flex items-center gap-2">
                              <Avatar name={person} />
                              <span className="text-gray-700 dark:text-slate-300">{person}:</span>
                            </div>
                            <span className="font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-2 py-0.5 rounded-lg border border-green-100 dark:border-green-800/30 font-mono text-xs">{formatIndianCurrency(share)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ExpenseList;
