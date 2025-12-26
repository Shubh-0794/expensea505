
import React, { useState } from 'react';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { EditIcon } from './icons/EditIcon.tsx';
import { getInitials, getColorFromName } from '../utils/getInitials.ts';

interface PersonInputProps {
  people: string[];
  addPerson: (name: string) => void;
  removePerson: (name: string) => void;
  editPerson: (oldName: string, newName: string) => void;
  currentUser: string | null;
  onLogin: (name: string) => void;
}

const PersonInput: React.FC<PersonInputProps> = ({ 
  people, 
  addPerson, 
  removePerson, 
  editPerson,
  currentUser
}) => {
  const [newName, setNewName] = useState('');
  const [editingName, setEditingName] = useState<string | null>(null);
  const [currentName, setCurrentName] = useState('');

  const handleAddPerson = () => {
    const trimmed = newName.trim();
    if (trimmed) {
      addPerson(trimmed);
      setNewName('');
    }
  };
  
  const handleEditClick = (name: string) => {
    setEditingName(name);
    setCurrentName(name);
  };

  const handleSaveClick = (oldName: string) => {
    const trimmed = currentName.trim();
    if (trimmed) {
      editPerson(oldName, trimmed);
    }
    setEditingName(null);
  };
  
  const getAvatarInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1 && parts[1][0]) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return getInitials(name);
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">People List</h2>
        <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 uppercase tracking-widest font-medium">Manage group members for this expense sheet</p>
      </div>
      
      <ul className="space-y-2">
        {people.map((person) => {
          const isMe = currentUser === person;
          
          return (
            <li
              key={person}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                isMe 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm' 
                  : 'bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-800'
              } group`}
            >
              {editingName === person ? (
                <input
                  type="text"
                  value={currentName}
                  onChange={(e) => setCurrentName(e.target.value)}
                  onBlur={() => handleSaveClick(person)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveClick(person)}
                  className="flex-grow bg-white dark:bg-slate-900 border border-blue-500 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-slate-100"
                  autoFocus
                />
              ) : (
              <>
                <div className="flex items-center gap-3 overflow-hidden">
                    <div
                        className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-white font-bold text-[10px] shadow-sm"
                        style={{ backgroundColor: getColorFromName(person) }}
                    >
                        {getAvatarInitials(person)}
                    </div>
                    <div className="flex flex-col truncate">
                      <span className={`font-bold truncate ${isMe ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-slate-200'}`}>
                        {person}
                      </span>
                      {isMe && <span className="text-[9px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-tighter">You</span>}
                    </div>
                </div>
                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button
                      onClick={() => handleEditClick(person)}
                      className="text-gray-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 p-1 transition-colors"
                  >
                      <EditIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removePerson(person)}
                    className="text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-1 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </>
              )}
            </li>
          );
        })}
      </ul>
      <div className="pt-6 border-t border-gray-200 dark:border-slate-800 transition-colors">
        <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase ml-1">Add New Person</label>
            <div className="flex gap-2">
              <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPerson()}
              placeholder="Enter name..."
              className="flex-grow bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-gray-900 dark:text-slate-100 transition-colors"
              />
              <button
              onClick={handleAddPerson}
              disabled={!newName.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-blue-100 dark:shadow-none"
              >
              Add
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PersonInput;
