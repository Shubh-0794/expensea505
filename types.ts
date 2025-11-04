export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitWith: string[];
  date: string; // YYYY-MM-DD
}

export interface Transaction {
  from: string;
  to: string;
  amount: number;
}
