
import React, { useState } from 'react';
import Avatar from './Avatar.tsx';
import { SunIcon } from './icons/SunIcon.tsx';
import { MoonIcon } from './icons/MoonIcon.tsx';

interface LoginPageProps {
  people: string[];
  onLogin: (name: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ people, onLogin, isDarkMode, toggleDarkMode }) => {
  const [selectedPerson, setSelectedPerson] = useState<string>(people[0] || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerson) return;
    
    const expectedPassword = `${selectedPerson}@07`;
    if (password === expectedPassword) {
      onLogin(selectedPerson);
    } else {
      setError('Incorrect password. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto min-h-[600px] flex items-center justify-center p-4">
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500 transition-colors">
        <div className="bg-blue-600 dark:bg-blue-700 p-8 text-center text-white relative">
          <button 
            onClick={toggleDarkMode}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>
          
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-lg">
             <span className="text-2xl font-bold">₹</span>
          </div>
          <h1 className="text-2xl font-bold font-mono tracking-tighter">Split X A505</h1>
          <p className="text-blue-100 text-xs mt-2 font-medium opacity-80 uppercase tracking-widest">Financial Dashboard</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase ml-1">Select Your Profile</label>
            <div className="grid grid-cols-1 gap-2">
               <select 
                 value={selectedPerson}
                 onChange={(e) => {
                   setSelectedPerson(e.target.value);
                   setPassword(''); // Clear password when person changes
                 }}
                 className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer text-gray-900 dark:text-slate-100"
               >
                 {people.map(person => (
                   <option key={person} value={person}>{person}</option>
                 ))}
               </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase ml-1">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 dark:text-slate-100"
            />
            <p className="text-[9px] text-gray-400 dark:text-slate-500 italic ml-1">Hint: {selectedPerson}@07</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-[11px] font-bold p-3 rounded-lg animate-in shake duration-300">
               {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-[0.98] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-100 dark:shadow-none transition-all duration-200 uppercase tracking-widest text-xs"
          >
            Enter Dashboard
          </button>
        </form>
        
        <div className="bg-gray-50 dark:bg-slate-800/50 p-6 text-center border-t border-gray-100 dark:border-slate-800 transition-colors">
            <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-widest font-medium">Made by <span className="text-red-500">♥</span> with A505</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
