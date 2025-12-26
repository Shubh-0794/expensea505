
import React, { useState, useEffect, useCallback } from 'react';
import PersonInput from './components/PersonInput.tsx';
import ExpenseForm from './components/ExpenseForm.tsx';
import ExpenseList from './components/ExpenseList.tsx';
import Summary from './components/Summary.tsx';
import LoginPage from './components/LoginPage.tsx';
import { Expense } from './types.ts';
import MonthSelector from './components/MonthSelector.tsx';
import History from './components/History.tsx';
import Avatar from './components/Avatar.tsx';
import { PlusIcon } from './components/icons/PlusIcon.tsx';
import { ListIcon } from './components/icons/ListIcon.tsx';
import { RupeeIcon } from './components/icons/RupeeIcon.tsx';
import { UsersIcon } from './components/icons/UsersIcon.tsx';
import { HistoryIcon } from './components/icons/HistoryIcon.tsx';
import { SunIcon } from './components/icons/SunIcon.tsx';
import { MoonIcon } from './components/icons/MoonIcon.tsx';

const App: React.FC = () => {
  const getCurrentMonthKey = () => new Date().toISOString().slice(0, 7); // YYYY-MM
  const DEFAULT_PEOPLE = ['Shubham P.', 'Shubham R.', 'Pranjal', 'Vishal', 'Piyush J.'];

  const [availableMonths, setAvailableMonths] = useState<string[]>(() => {
    const stored = localStorage.getItem('expense_months');
    return stored ? JSON.parse(stored) : [getCurrentMonthKey()];
  });

  const [currentMonth, setCurrentMonth] = useState<string>(availableMonths[0] || getCurrentMonthKey());
  const [activeTab, setActiveTab] = useState('add');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('expense_theme') === 'dark' || 
           (!localStorage.getItem('expense_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [people, setPeople] = useState<string[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('expense_current_user');
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('expense_is_logged_in') === 'true';
  });

  // Handle dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('expense_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('expense_theme', 'light');
    }
  }, [isDarkMode]);

  // Load data for the current month
  useEffect(() => {
    const savedData = localStorage.getItem(`expense_data_${currentMonth}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setPeople(parsed.people || DEFAULT_PEOPLE);
        setExpenses(parsed.expenses || []);
      } catch (e) {
        setPeople(DEFAULT_PEOPLE);
        setExpenses([]);
      }
    } else {
      const sortedMonths = [...availableMonths].sort().reverse();
      const lastKnownMonth = sortedMonths.find(m => m < currentMonth);
      let inheritedPeople = DEFAULT_PEOPLE;
      
      if (lastKnownMonth) {
        const prevData = localStorage.getItem(`expense_data_${lastKnownMonth}`);
        if (prevData) {
          try {
            const parsedPrev = JSON.parse(prevData);
            if (parsedPrev.people && parsedPrev.people.length > 0) inheritedPeople = parsedPrev.people;
          } catch (e) {}
        }
      }
      setPeople(inheritedPeople);
      setExpenses([]);
    }
  }, [currentMonth]);

  // Save data
  useEffect(() => {
    if (people.length === 0 && expenses.length === 0) {
      const existing = localStorage.getItem(`expense_data_${currentMonth}`);
      if (existing) return;
    }

    const dataToSave = { people, expenses };
    localStorage.setItem(`expense_data_${currentMonth}`, JSON.stringify(dataToSave));

    if (!availableMonths.includes(currentMonth)) {
      const updatedMonths = [...availableMonths, currentMonth].sort().reverse();
      setAvailableMonths(updatedMonths);
      localStorage.setItem('expense_months', JSON.stringify(updatedMonths));
    }
  }, [people, expenses, currentMonth, availableMonths]);

  const handleLogin = useCallback((userName: string) => {
    setCurrentUser(userName);
    setIsLoggedIn(true);
    localStorage.setItem('expense_current_user', userName);
    localStorage.setItem('expense_is_logged_in', 'true');
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('expense_current_user');
    localStorage.setItem('expense_is_logged_in', 'false');
  }, []);

  const addExpense = useCallback((expense: Expense) => {
    setExpenses(prev => [...prev, expense]);
  }, []);

  const removeExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const editExpense = useCallback((id: string, updatedExpenseData: Partial<Omit<Expense, 'id'>>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updatedExpenseData } : e));
  }, []);

  const handleAddPerson = useCallback((name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setPeople(prev => {
      if (prev.includes(trimmedName)) return prev;
      return [...prev, trimmedName];
    });
  }, []);

  const handleRemovePerson = useCallback((personToRemove: string) => {
    if (currentUser === personToRemove) handleLogout();
    setPeople(prev => prev.filter(p => p !== personToRemove));
    setExpenses(prev => prev.map(exp => ({
      ...exp,
      splitWith: exp.splitWith.filter(p => p !== personToRemove),
      paidBy: exp.paidBy === personToRemove ? '' : exp.paidBy
    })).filter(exp => exp.splitWith.length > 0 && exp.paidBy !== ''));
  }, [currentUser, handleLogout]);

  const handleEditPerson = useCallback((oldName: string, newName: string) => {
    const trimmedNewName = newName.trim();
    if (!trimmedNewName || trimmedNewName === oldName) return;
    if (currentUser === oldName) handleLogin(trimmedNewName);
    setPeople(prev => prev.map(p => (p === oldName ? trimmedNewName : p)));
    setExpenses(prev => prev.map(exp => ({
      ...exp,
      paidBy: exp.paidBy === oldName ? trimmedNewName : exp.paidBy,
      splitWith: exp.splitWith.map(p => (p === oldName ? trimmedNewName : p))
    })));
  }, [currentUser, handleLogin]);

  if (!isLoggedIn) {
    return (
      <LoginPage 
        people={people.length > 0 ? people : DEFAULT_PEOPLE} 
        onLogin={handleLogin} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
      />
    );
  }

  const tabs = [
    { id: 'add', label: 'Add', icon: PlusIcon },
    { id: 'list', label: 'List', icon: ListIcon },
    { id: 'total', label: 'Total', icon: RupeeIcon },
    { id: 'people', label: 'People', icon: UsersIcon },
    { id: 'history', label: 'History', icon: HistoryIcon },
  ];

  return (
    <div className="max-w-md w-full mx-auto animate-in fade-in duration-500">
      <main className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden min-h-[500px] transition-colors duration-300">
        <header className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/20 dark:bg-slate-800/20">
          <div className="flex justify-between items-start mb-4">
             <div>
               <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono tracking-tighter">Split X A505</h1>
             </div>
             <div className="flex items-center gap-2">
               <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition-colors"
                  aria-label="Toggle Theme"
               >
                  {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
               </button>
               {currentUser && (
                 <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-blue-100 dark:border-slate-700 shadow-sm transition-colors">
                    <Avatar name={currentUser} />
                    <div className="flex flex-col hidden sm:flex">
                      <span className="text-[9px] font-bold text-blue-500 dark:text-blue-400 uppercase leading-none">Logged In</span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-slate-200 leading-none mt-1">{currentUser}</span>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="ml-2 text-[10px] text-gray-400 hover:text-red-600 font-bold uppercase transition-colors"
                    >
                      Logout
                    </button>
                 </div>
               )}
             </div>
          </div>
          
          <MonthSelector 
            currentMonth={currentMonth}
            availableMonths={availableMonths}
            onMonthChange={setCurrentMonth}
          />
        </header>

        <nav className="flex border-b border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 transition-colors">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-1 text-center focus:outline-none transition-all duration-200
                  ${activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-b-2 border-blue-500'
                    : 'text-gray-500 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800'}`
                }
              >
                <div className="flex flex-col items-center">
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">{tab.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 min-h-[400px] transition-colors duration-300">
          {activeTab === 'add' && <ExpenseForm people={people} addExpense={addExpense} currentUser={currentUser} />}
          {activeTab === 'list' && <ExpenseList expenses={expenses} removeExpense={removeExpense} people={people} editExpense={editExpense} />}
          {activeTab === 'total' && <Summary people={people} expenses={expenses} />}
          {activeTab === 'people' && (
            <PersonInput 
              people={people} 
              addPerson={handleAddPerson} 
              removePerson={handleRemovePerson} 
              editPerson={handleEditPerson}
              currentUser={currentUser}
              onLogin={handleLogin}
            />
          )}
          {activeTab === 'history' && <History availableMonths={availableMonths} />}
        </div>
        <footer className="text-center py-6 bg-gray-50/30 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 transition-colors">
          <p className="text-[11px] text-gray-400 dark:text-slate-500 font-medium uppercase tracking-widest">Made by <span className="text-red-500">♥</span> with A505</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
