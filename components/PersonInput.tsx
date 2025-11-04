import React, { useState } from 'react';
import { TrashIcon } from './icons/TrashIcon';
import { EditIcon } from './icons/EditIcon';
import Avatar from './Avatar';
import { getInitials, getColorFromName } from '../utils/getInitials';

interface PersonInputProps {
  people: string[];
  addPerson: (name: string) => void;
  removePerson: (name: string) => void;
  editPerson: (oldName: string, newName: string) => void;
}

const PersonInput: React.FC<PersonInputProps> = ({ people, addPerson, removePerson, editPerson }) => {
  const [newName, setNewName] = useState('');
  const [editingName, setEditingName] = useState<string | null>(null);
  const [currentName, setCurrentName] = useState('');

  const handleAddPerson = () => {
    if (newName.trim()) {
      addPerson(newName);
      setNewName('');
    }
  };
  
  const handleEditClick = (name: string) => {
    setEditingName(name);
    setCurrentName(name);
  };

  const handleSaveClick = (oldName: string) => {
    editPerson(oldName, currentName);
    setEditingName(null);
  };
  
  const getAvatarInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1 && parts[1].length === 1) { // Handles "Shubham P." -> "SP"
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return getInitials(name);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-center text-gray-800">People List</h2>
      <ul className="space-y-3">
        {people.map((person) => (
          <li
            key={person}
            className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
          >
            {editingName === person ? (
              <input
                type="text"
                value={currentName}
                onChange={(e) => setCurrentName(e.target.value)}
                onBlur={() => handleSaveClick(person)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveClick(person)}
                className="flex-grow bg-white border border-blue-500 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                autoFocus
              />
            ) : (
            <>
              <div className="flex items-center gap-3">
                  <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: getColorFromName(person) }}
                  >
                      {getAvatarInitials(person)}
                  </div>
                  <span className="font-medium text-gray-700">{person}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                    onClick={() => handleEditClick(person)}
                    className="text-gray-400 hover:text-blue-500 transition-colors"
                    aria-label={`Edit ${person}`}
                >
                    <EditIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => removePerson(person)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label={`Remove ${person}`}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </>
            )}
          </li>
        ))}
      </ul>
      <div className="pt-6 border-t border-gray-200">
        <div className="flex gap-2">
            <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPerson()}
            placeholder="Enter a new name"
            className="flex-grow bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
            onClick={handleAddPerson}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
            + Add Person
            </button>
        </div>
      </div>
    </div>
  );
};

export default PersonInput;