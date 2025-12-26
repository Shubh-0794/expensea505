
import React, { useMemo } from 'react';
import { Expense } from '../types.ts';
import { WhatsAppIcon } from './icons/WhatsAppIcon.tsx';
import { RupeeIcon } from './icons/RupeeIcon.tsx';
import Avatar from './Avatar.tsx';
import { formatIndianCurrency } from '../utils/formatCurrency.ts';

interface SummaryProps {
  people: string[];
  expenses: Expense[];
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

const Summary: React.FC<SummaryProps> = ({ people, expenses }) => {
  const defaultUPIId = "shubhamredekar9@okhdfcbank"; 
  const recipientName = "Shubham Redekar"; 
  const imagePath = "upi_1766154366034.png";

  const { stats, settlements, totalSpent } = useMemo(() => {
    const statsMap: Record<string, { paid: number; share: number }> = {};
    people.forEach(p => {
      statsMap[p] = { paid: 0, share: 0 };
    });

    expenses.forEach((expense) => {
      if (statsMap[expense.paidBy]) {
        statsMap[expense.paidBy].paid += expense.amount;
      }
      
      if (expense.splitWith.length > 0) {
        const perPerson = expense.amount / expense.splitWith.length;
        expense.splitWith.forEach((person) => {
          if (statsMap[person]) {
            statsMap[person].share += perPerson;
          }
        });
      }
    });

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const balances = Object.keys(statsMap).map(person => ({
      name: person,
      balance: statsMap[person].paid - statsMap[person].share
    }));

    const debtors = balances.filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance);
    const creditors = balances.filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance);

    const settlementList: Settlement[] = [];
    let dIdx = 0;
    let cIdx = 0;

    const dTemp = debtors.map(d => ({ ...d, balance: Math.abs(d.balance) }));
    const cTemp = creditors.map(c => ({ ...c }));

    while (dIdx < dTemp.length && cIdx < cTemp.length) {
      const amount = Math.min(dTemp[dIdx].balance, cTemp[cIdx].balance);
      settlementList.push({
        from: dTemp[dIdx].name,
        to: cTemp[cIdx].name,
        amount
      });

      dTemp[dIdx].balance -= amount;
      cTemp[cIdx].balance -= amount;

      if (dTemp[dIdx].balance < 0.01) dIdx++;
      if (cTemp[cIdx].balance < 0.01) cIdx++;
    }

    return { stats: statsMap, settlements: settlementList, totalSpent: total };
  }, [people, expenses]);

  const handlePay = (amount: number) => {
    // Format amount to 2 decimal places as required by most UPI apps
    const formattedAmount = amount.toFixed(2);
    const upiUrl = `upi://pay?pa=${defaultUPIId}&pn=${encodeURIComponent(recipientName)}&am=${formattedAmount}&cu=INR`;
    window.location.href = upiUrl;
  };

  const generateWhatsAppMessage = () => {
    let message = `*Expense Total Breakdown*\n\n`;
    
    expenses.forEach(exp => {
      message += `*${exp.description}*: ${formatIndianCurrency(exp.amount)} (split between ${exp.splitWith.length} people)\n`;
      const perPerson = exp.amount / exp.splitWith.length;
      exp.splitWith.forEach(person => {
        message += ` › ${person}: ${formatIndianCurrency(perPerson)}\n`;
      });
      message += `\n`;
    });
    
    message += `*--- Total per Person ---*\n`;
    Object.entries(stats).forEach(([person, data]) => {
      const d = data as { paid: number; share: number };
      message += `${person}: ${formatIndianCurrency(d.share)}\n`;
    });

    // Added settlement section with amount-specific UPI links
    if (settlements.length > 0) {
      message += `\n*--- How to Settle ---*\n`;
      settlements.forEach(s => {
        const formattedAmt = s.amount.toFixed(2);
        const upiLink = `upi://pay?pa=${defaultUPIId}&pn=${encodeURIComponent(recipientName)}&am=${formattedAmt}&cu=INR`;
        message += `✅ *${s.from}* pays *${s.to}*: ${formatIndianCurrency(s.amount)}\n`;
        message += `🔗 Pay now: ${upiLink}\n\n`;
      });
    } else {
      message += `\nAll settled up! 🎉\n\n`;
    }
    
    message += `Image Ref: ${imagePath}`;

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-slate-500 py-10">
        <p>No expenses recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-colors">
       <section className="bg-blue-600 dark:bg-blue-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-100 dark:shadow-none relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <RupeeIcon className="w-16 h-16" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Total Spending</p>
          <h2 className="text-3xl font-mono font-bold">{formatIndianCurrency(totalSpent)}</h2>
       </section>

       <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
             <h3 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Balance Breakdown</h3>
             <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-tighter">Paid - Share</span>
          </div>
          
          <div className="space-y-2">
              {Object.entries(stats)
                .sort(([, a], [, b]) => {
                  const dataA = a as { paid: number; share: number };
                  const dataB = b as { paid: number; share: number };
                  return (dataB.paid - dataB.share) - (dataA.paid - dataA.share);
                })
                .map(([person, data]) => {
                  const d = data as { paid: number; share: number };
                  const balance = d.paid - d.share;
                  const isPositive = balance >= 0;
                  
                  return (
                    <div key={person} className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-4 shadow-sm transition-colors">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Avatar name={person} />
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-slate-100 leading-none mb-1">{person}</p>
                                    <div className="flex gap-2 text-[9px] font-bold uppercase tracking-tighter">
                                        <span className="text-blue-500 dark:text-blue-400 font-black">Paid: {formatIndianCurrency(d.paid)}</span>
                                        <span className="text-gray-400 dark:text-slate-500">Share: {formatIndianCurrency(d.share)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-sm font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {isPositive ? '+' : '-'}{formatIndianCurrency(Math.abs(balance))}
                                </p>
                                <p className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase">
                                    {isPositive ? 'Credit' : 'Debt'}
                                </p>
                            </div>
                        </div>
                    </div>
                  );
                })}
          </div>
       </section>

       {settlements.length > 0 && (
         <section className="space-y-3">
            <h3 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1">How to Settle</h3>
            <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 space-y-2 transition-colors">
               {settlements.map((s, i) => (
                 <div key={i} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-slate-700 last:border-0 group">
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-bold text-gray-700 dark:text-slate-300">{s.from}</span>
                       <span className="text-gray-400 dark:text-slate-600">→</span>
                       <span className="text-xs font-bold text-gray-700 dark:text-slate-300">{s.to}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-gray-200 dark:border-slate-700 text-[11px]">
                           {formatIndianCurrency(s.amount)}
                        </span>
                        <button 
                          onClick={() => handlePay(s.amount)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm active:scale-95 flex items-center gap-1 uppercase tracking-tight"
                        >
                          Pay
                        </button>
                    </div>
                 </div>
               ))}
            </div>
         </section>
       )}

       <div className="pt-4 pb-6">
          <button
            onClick={generateWhatsAppMessage}
            className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white font-bold py-4 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-green-100 dark:shadow-none"
          >
            <WhatsAppIcon className="w-5 h-5" />
            <span className="uppercase text-xs tracking-widest font-bold">Share via WhatsApp</span>
          </button>
          <p className="text-center text-[10px] text-gray-400 dark:text-slate-500 mt-3 italic">
            Individual payment links are included in the message.
          </p>
       </div>
    </div>
  );
};

export default Summary;
