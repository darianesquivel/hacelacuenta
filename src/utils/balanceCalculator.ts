import type { Expense } from "../api/data";

export const getBalanceSummary = (
  expenses: Expense[],
  allMembersEmails: string[]
): Array<[string, number]> => {
  const balances = new Map<string, number>();

  allMembersEmails.forEach((email) => balances.set(email, 0));

  expenses.forEach((expense) => {
    const paidByEmail = expense.paidBy.email;
    const sharedWithEmails = expense.sharedWith
      .map((ref) => ref.email)
      .filter(Boolean) as string[];

    if (!paidByEmail || sharedWithEmails.length === 0) {
      console.warn("Gasto inválido omitido:", expense);
      return;
    }

    const shareAmount = expense.amount / sharedWithEmails.length;

    const currentPaidByBalance = balances.get(paidByEmail) || 0;
    balances.set(paidByEmail, currentPaidByBalance + expense.amount);

    sharedWithEmails.forEach((sharedEmail) => {
      if (sharedEmail) {
        const currentSharedBalance = balances.get(sharedEmail) || 0;
        balances.set(sharedEmail, currentSharedBalance - shareAmount);
      }
    });
  });

  const summaryArray = Array.from(balances.entries());

  const finalSummary = summaryArray.filter(([email]) =>
    allMembersEmails.includes(email)
  );

  return finalSummary;
};
