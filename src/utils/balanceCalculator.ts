import type { Expense, Payment } from "../api/data";

export const getBalanceSummary = (
  expenses: Expense[],
  allMembersIdentifiers: string[],
  payments?: Payment[]
): Array<[string, number]> => {
  const balances = new Map<string, number>();

  allMembersIdentifiers.forEach((identifier) => balances.set(identifier, 0));

  expenses.forEach((expense) => {
    const paidByIdentifier = expense.paidBy.email || expense.paidBy.displayName;
    const sharedWithIdentifiers = expense.sharedWith
      .map((ref) => ref.email || ref.displayName)
      .filter(Boolean) as string[];

    if (!paidByIdentifier || sharedWithIdentifiers.length === 0) {
      console.warn("Gasto inválido omitido:", expense);
      return;
    }

    // Calcular distribución inteligente para evitar centavos perdidos
    const totalAmount = expense.amount;
    const shareCount = sharedWithIdentifiers.length;
    const baseShare = Math.floor((totalAmount * 100) / shareCount) / 100; // Redondear hacia abajo
    const remainder = Math.round((totalAmount - baseShare * shareCount) * 100); // Centavos restantes

    const currentPaidByBalance = balances.get(paidByIdentifier) || 0;
    balances.set(paidByIdentifier, currentPaidByBalance + expense.amount);

    sharedWithIdentifiers.forEach((sharedIdentifier, index) => {
      if (sharedIdentifier) {
        // Los primeros 'remainder' miembros reciben un centavo extra
        const extraCent = index < remainder ? 0.01 : 0;
        const finalShare = baseShare + extraCent;

        const currentSharedBalance = balances.get(sharedIdentifier) || 0;
        balances.set(sharedIdentifier, currentSharedBalance - finalShare);
      }
    });
  });

  if (payments) {
    payments.forEach((payment) => {
      if (payment.status === "completed") {
        const fromIdentifier =
          payment.fromUser.email || payment.fromUser.displayName;
        const toIdentifier = payment.toUser.email || payment.toUser.displayName;

        if (fromIdentifier && toIdentifier) {
          const currentFromBalance = balances.get(fromIdentifier) || 0;
          balances.set(fromIdentifier, currentFromBalance + payment.amount);

          const currentToBalance = balances.get(toIdentifier) || 0;
          balances.set(toIdentifier, currentToBalance - payment.amount);
        }
      }
    });
  }

  const summaryArray = Array.from(balances.entries());

  const finalSummary = summaryArray.filter(([identifier]) =>
    allMembersIdentifiers.includes(identifier)
  );

  return finalSummary;
};
