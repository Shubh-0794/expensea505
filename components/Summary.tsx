import React from 'react';
import { Expense } from '../types';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import Avatar from './Avatar';
import { formatIndianCurrency } from '../utils/formatCurrency';

interface SummaryProps {
  people: string[];
  expenses: Expense[];
}

const Summary: React.FC<SummaryProps> = ({ expenses }) => {
  const personTotals: { [key: string]: number } = {};
  const defaultUPIId = "shubhpadole071@ybl"; // Pre-filled UPI ID
  const recipientName = "Shubham Padole"; // Pre-filled Recipient Name

  expenses.forEach((expense) => {
    if (expense.splitWith.length === 0) return;
    const perPerson = expense.amount / expense.splitWith.length;
    expense.splitWith.forEach((person) => {
      if (!personTotals[person]) {
        personTotals[person] = 0;
      }
      personTotals[person] += perPerson;
    });
  });

  const generateWhatsAppMessage = () => {
    let message = "Expense Total Breakdown:\n\n";
    expenses.forEach((expense) => {
      message += `${expense.description}: ₹${expense.amount.toFixed(2)} (split between ${expense.splitWith.length} people)\n`;
      const totalPerPerson = (expense.amount / expense.splitWith.length).toFixed(2);
      expense.splitWith.forEach((person) => {
        message += ` › ${person}: ₹${totalPerPerson}\n`;
      });
      message += "\n"; // Add space between expenses
    });

    message += "--- Total per Person ---\n";
    for (const [person, total] of Object.entries(personTotals)) {
      message += `${person}: ₹${total.toFixed(2)}\n`;
    }

    // Generate UPI payment link
    const upiPaymentLink = `upi://pay?pa=${defaultUPIId}&pn=${encodeURIComponent(recipientName)}&cu=INR`;
    
    message += `\nTo pay, click here: ${upiPaymentLink}`;

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank'); // Open WhatsApp in a new tab
  };
  
  const sortedTotals = Object.entries(personTotals).sort(([, a], [, b]) => b - a);


  if (expenses.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        <p>Add some expenses to see the totals.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <h2 className="text-xl font-bold text-center text-gray-800">Total per Person</h2>
        <ul className="space-y-3">
            {sortedTotals.map(([person, totalAmount]) => (
                <li key={person} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Avatar name={person} />
                        <span className="font-medium text-gray-700">{person}:</span>
                    </div>
                    <span className="font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-md">{formatIndianCurrency(totalAmount)}</span>
                </li>
            ))}
        </ul>
        <div className="pt-6 border-t border-gray-200">
            <button
            onClick={generateWhatsAppMessage}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
            >
            <WhatsAppIcon className="w-5 h-5" />
            Send to WhatsApp
            </button>
        </div>
    </div>
  );
};

export default Summary;