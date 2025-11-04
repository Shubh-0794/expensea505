import React, { useState, useEffect } from 'react';
import PersonInput from './components/PersonInput';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Summary from './components/Summary';
import { Expense } from './types';
import MonthSelector from './components/MonthSelector';
import History from './components/History';
import { PlusIcon } from './components/icons/PlusIcon';
import { ListIcon } from './components/icons/ListIcon';
import { RupeeIcon } from './components/icons/RupeeIcon';
import { UsersIcon } from './components/icons/UsersIcon';
import { HistoryIcon } from './components/icons/HistoryIcon';

const App: React.FC = () => {
  const getCurrentMonthKey = () => new Date().toISOString().slice(0, 7); // YYYY-MM

  // --- State Initialization with Lazy Loaders ---
  const [availableMonths, setAvailableMonths] = useState<string[]>(() => {
    // This function runs only once on the initial render
    try {
      const currentMonthKey = getCurrentMonthKey();
      // --- Migration from old format ---
      const oldPeopleData = localStorage.getItem('people');
      const oldExpensesData = localStorage.getItem('expenses');
      if (oldPeopleData && oldExpensesData) {
        const dataToSave = { people: JSON.parse(oldPeopleData), expenses: JSON.parse(oldExpensesData) };
        localStorage.setItem(`expense_data_${currentMonthKey}`, JSON.stringify(dataToSave));
        localStorage.removeItem('people');
        localStorage.removeItem('expenses');

        const months = JSON.parse(localStorage.getItem('expense_months') || '[]');
        if (!months.includes(currentMonthKey)) {
          months.push(currentMonthKey);
          const sortedMonths = months.sort().reverse();
          localStorage.setItem('expense_months', JSON.stringify(sortedMonths));
          return sortedMonths;
        }
      }
      // --- End Migration ---

      const storedMonths = localStorage.getItem('expense_months');
      if (storedMonths) {
        return JSON.parse(storedMonths);
      }
    } catch (error) {
      console.error("Error initializing available months from localStorage:", error);
    }
    // Default case if nothing is stored or an error occurs
    return [getCurrentMonthKey()];
  });

  const [currentMonth, setCurrentMonth] = useState<string>(() => availableMonths[0] || getCurrentMonthKey());
  const [people, setPeople] = useState<string[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState('add');

  // --- Effect to LOAD data when month changes ---
  useEffect(() => {
    let data;
    try {
      const savedData = localStorage.getItem(`expense_data_${currentMonth}`);
      data = savedData ? JSON.parse(savedData) : null;
    } catch (error) {
      console.error(`Error parsing data for month ${currentMonth}:`, error);
      data = null;
    }

    if (data && data.people && data.expenses) {
      // --- Date Migration for old entries ---
      const migratedExpenses = data.expenses.map((exp: Expense & { date?: string }) => {
        if (!exp.date) {
          // Assign a default date (1st of the month) for old entries
          return { ...exp, date: `${currentMonth}-01` };
        }
        return exp;
      });

      setPeople(data.people);
      setExpenses(migratedExpenses);
    } else {
      // It's a new month or data is corrupted, let's set initial state
      let initialPeople = ['Prashant', 'Nikhil', 'Shubham P.', 'Shubham R.', 'Pranjal', 'Vishal', 'Piyush J.'];
      // Try to inherit people from the most recent month with data
      const sortedMonths = [...availableMonths].sort().reverse();
      const lastMonthWithData = sortedMonths.find(m => m < currentMonth && localStorage.getItem(`expense_data_${m}`));
      
      if (lastMonthWithData) {
        try {
          const lastMonthRawData = localStorage.getItem(`expense_data_${lastMonthWithData}`);
          const lastMonthParsed = lastMonthRawData ? JSON.parse(lastMonthRawData) : null;
          if (lastMonthParsed && lastMonthParsed.people && lastMonthParsed.people.length > 0) {
            initialPeople = lastMonthParsed.people;
          }
        } catch (error) {
          console.error(`Error inheriting people from month ${lastMonthWithData}:`, error);
        }
      }
      setPeople(initialPeople);
      setExpenses([]);
    }
  }, [currentMonth, availableMonths]);

  // --- Effect to SAVE data when it changes ---
  useEffect(() => {
    // We prevent saving on the very first render cycle if people/expenses are empty,
    // to avoid wiping data before it's loaded.
    if (people.length === 0 && expenses.length === 0) {
        // Check if there should be data for this month. If not, it's safe to save.
        const existingData = localStorage.getItem(`expense_data_${currentMonth}`);
        if (existingData) return;
    }
      
    try {
      const dataToSave = { people, expenses };
      localStorage.setItem(`expense_data_${currentMonth}`, JSON.stringify(dataToSave));

      // Also update the list of available months if this is a new one
      if (!availableMonths.includes(currentMonth)) {
        const newMonths = [...availableMonths, currentMonth].sort().reverse();
        setAvailableMonths(newMonths);
        localStorage.setItem('expense_months', JSON.stringify(newMonths));
      }
    } catch (error) {
      console.error(`Error saving data for month ${currentMonth}:`, error);
    }
  }, [people, expenses, currentMonth, availableMonths]);


  const addExpense = (expense: Expense) => {
    setExpenses(prevExpenses => [...prevExpenses, expense]);
  };

  const removeExpense = (id: string) => {
    setExpenses(prevExpenses => prevExpenses.filter((expense) => expense.id !== id));
  };

  const editExpense = (id: string, updatedExpenseData: Partial<Omit<Expense, 'id'>>) => {
    setExpenses(prevExpenses => prevExpenses.map(expense =>
      expense.id === id ? { ...expense, ...updatedExpenseData } : expense
    ));
  };

  const handleAddPerson = (name: string) => {
    if (name.trim() && !people.includes(name.trim())) {
      setPeople(prevPeople => [...prevPeople, name.trim()]);
    }
  };

  const handleRemovePerson = (personToRemove: string) => {
    const newPeople = people.filter((person) => person !== personToRemove);
    setPeople(newPeople);

    setExpenses(prevExpenses => prevExpenses.map(exp => ({
        ...exp,
        splitWith: exp.splitWith.filter(p => p !== personToRemove),
        // If the person who paid is removed, reassign to the first person in the new list
        paidBy: exp.paidBy === personToRemove ? (newPeople[0] || '') : exp.paidBy,
    })).filter(exp => exp.splitWith.length > 0) // Remove expenses that now have no one to split with
    );
  };

  const handleEditPerson = (oldName: string, newName: string) => {
    const trimmedNewName = newName.trim();
    if (!trimmedNewName || (people.includes(trimmedNewName) && trimmedNewName !== oldName)) return;

    setPeople(prevPeople => prevPeople.map(p => (p === oldName ? trimmedNewName : p)));

    setExpenses(prevExpenses =>
      prevExpenses.map(exp => ({
        ...exp,
        paidBy: exp.paidBy === oldName ? trimmedNewName : exp.paidBy,
        splitWith: exp.splitWith.map(p => (p === oldName ? trimmedNewName : p)),
      }))
    );
  };
  
  const tabs = [
    { id: 'add', label: 'Add', icon: PlusIcon },
    { id: 'list', label: 'List', icon: ListIcon },
    { id: 'total', label: 'Total', icon: RupeeIcon },
    { id: 'people', label: 'People', icon: UsersIcon },
    { id: 'history', label: 'History', icon: HistoryIcon },
  ];

  return (
    <div className="max-w-md w-full mx-auto">
      <main className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <header className="text-center p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-blue-600 font-mono tracking-tighter">Expense Calculator</h1>
          <MonthSelector 
            currentMonth={currentMonth}
            availableMonths={availableMonths}
            onMonthChange={setCurrentMonth}
          />
          <p className="text-sm text-gray-500 mt-4">Made by <span className="text-red-500">♥</span> with A505</p>
        </header>

        <nav className="flex border-b border-gray-200 bg-gray-50/50">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-2 text-center focus:outline-none transition-colors duration-200
                  ${activeTab === tab.id
                    ? 'bg-gray-200 text-gray-800'
                    : 'text-gray-500 hover:bg-gray-100'}`
                }
              >
                <div className="flex flex-col items-center">
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium">{tab.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-4 sm:p-6 bg-white">
          {activeTab === 'add' && <ExpenseForm people={people} addExpense={addExpense} />}
          {activeTab === 'list' && <ExpenseList expenses={expenses} removeExpense={removeExpense} people={people} editExpense={editExpense} />}
          {activeTab === 'total' && <Summary people={people} expenses={expenses} />}
          {activeTab === 'people' && <PersonInput people={people} addPerson={handleAddPerson} removePerson={handleRemovePerson} editPerson={handleEditPerson} />}
          {activeTab === 'history' && <History availableMonths={availableMonths} />}
        </div>
      </main>
    </div>
  );
};

export default App;