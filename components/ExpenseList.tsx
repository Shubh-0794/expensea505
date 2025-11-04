import React, { useState } from 'react';
import { Expense } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { EditIcon } from './icons/EditIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import Avatar from './Avatar';
import { formatIndianCurrency } from '../utils/formatCurrency';

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

  if (expenses.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        <p>No expenses added yet.</p>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleEditClick = (expense: Expense) => {
    setEditingId(expense.id);
    setEditFormData({
      description: expense.description,
      amount: expense.amount,
      paidBy: expense.paidBy,
      splitWith: [...expense.splitWith],
    });
    setExpandedId(null); // Close details view when editing
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData(null);
  };

  const handleSaveEdit = () => {
    if (editingId && editFormData) {
      if (!editFormData.description.trim() || !editFormData.amount || editFormData.amount <= 0 || !editFormData.paidBy || editFormData.splitWith.length === 0) {
        alert('Please fill all fields, select who paid, and select at least one person to split with.');
        return;
      }
      editExpense(editingId, {
        ...editFormData,
        amount: Number(editFormData.amount),
      });
      handleCancelEdit();
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center text-gray-800">Expense List</h2>
      <ul className="space-y-3">
        {expenses.map((expense) => {
          const share = expense.amount / expense.splitWith.length;
          const isExpanded = expandedId === expense.id;
          const isEditing = editingId === expense.id;

          return (
            <li key={expense.id} className="bg-white border border-gray-200 rounded-lg p-4 transition-shadow duration-200 hover:shadow-md">
              {isEditing && editFormData ? (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-gray-800">Editing: <span className="font-normal">{expense.description}</span></h3>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                    <input
                      type="text"
                      value={editFormData.description}
                      onChange={(e) => handleEditFormChange('description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      value={editFormData.amount}
                      onChange={(e) => handleEditFormChange('amount', e.target.value === '' ? '' : parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Paid by</label>
                    <select
                      value={editFormData.paidBy}
                      onChange={(e) => handleEditFormChange('paidBy', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {people.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Split with</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1 pr-2 border rounded-md p-2">
                      {people.map(p => (
                        <label key={p} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100">
                          <input type="checkbox" checked={editFormData.splitWith.includes(p)} onChange={() => handleToggleSplitWith(p)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          <span className="text-sm text-gray-800">{p}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-2">
                    <button onClick={handleCancelEdit} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">Cancel</button>
                    <button onClick={handleSaveEdit} className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">Save</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-800">{expense.description}</p>
                      <p className="text-lg font-mono font-semibold text-yellow-600">{formatIndianCurrency(expense.amount)}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                        <button onClick={() => handleEditClick(expense)} className="hover:text-blue-500 transition-colors" aria-label={`Edit ${expense.description}`}><EditIcon className="w-4 h-4" /></button>
                        <button onClick={() => removeExpense(expense.id)} className="hover:text-red-500 transition-colors" aria-label={`Remove ${expense.description}`}><TrashIcon className="w-4 h-4" /></button>
                        (split between <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">{expense.splitWith.length}</span> people)
                      </div>
                    </div>
                    <button
                      onClick={() => toggleExpand(expense.id)}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? <ChevronUpIcon className="w-6 h-6" /> : <ChevronDownIcon className="w-6 h-6" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Paid by: <strong className="text-gray-800">{expense.paidBy}</strong></p>
                      <ul className="space-y-2">
                        {expense.splitWith.map((person) => (
                          <li key={person} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded-md">
                            <div className="flex items-center gap-2">
                              <Avatar name={person} />
                              <span className="text-gray-700">{person}:</span>
                            </div>
                            <span className="font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-md">{formatIndianCurrency(share)}</span>
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