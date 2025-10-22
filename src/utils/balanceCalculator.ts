import type { Expense } from "../api/data";

export const getBalanceSummary = (
  expenses: Expense[],
  allMembersIdentifiers: string[]
): Array<[string, number]> => {
  const balances = new Map<string, number>();

  allMembersIdentifiers.forEach((identifier) => balances.set(identifier, 0));

  expenses.forEach((expense) => {
    // Usar displayName como identificador si no hay email
    const paidByIdentifier = expense.paidBy.email || expense.paidBy.displayName;
    const sharedWithIdentifiers = expense.sharedWith
      .map((ref) => ref.email || ref.displayName)
      .filter(Boolean) as string[];

    if (!paidByIdentifier || sharedWithIdentifiers.length === 0) {
      console.warn("Gasto inválido omitido:", expense);
      return;
    }

    const shareAmount = expense.amount / sharedWithIdentifiers.length;

    const currentPaidByBalance = balances.get(paidByIdentifier) || 0;
    balances.set(paidByIdentifier, currentPaidByBalance + expense.amount);

    sharedWithIdentifiers.forEach((sharedIdentifier) => {
      if (sharedIdentifier) {
        const currentSharedBalance = balances.get(sharedIdentifier) || 0;
        balances.set(sharedIdentifier, currentSharedBalance - shareAmount);
      }
    });
  });

  const summaryArray = Array.from(balances.entries());

  const finalSummary = summaryArray.filter(([identifier]) =>
    allMembersIdentifiers.includes(identifier)
  );

  return finalSummary;
};
