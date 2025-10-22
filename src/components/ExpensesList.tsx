import { Flex, Spinner, Callout, Heading } from "@radix-ui/themes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExpenses, updateExpense, deleteExpense } from "../api/data";
import ExpenseEditor from "./ExpenseEditor";
import type { EventMember, Expense } from "../api/data";

interface ExpensesListProps {
  eventId: string;
  members: EventMember[];
  currentUserEmail?: string;
}

const ExpensesList = ({
  eventId,
  members,
  currentUserEmail,
}: ExpensesListProps) => {
  const queryClient = useQueryClient();

  const {
    data: expenses,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["expenses", eventId],
    queryFn: () => getExpenses(eventId),
    enabled: !!eventId,
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({
      expenseId,
      updates,
    }: {
      expenseId: string;
      updates: Partial<Expense>;
    }) => updateExpense(expenseId, updates, eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", eventId] });
      queryClient.invalidateQueries({ queryKey: ["eventBalance", eventId] });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (expenseId: string) => deleteExpense(expenseId, eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", eventId] });
      queryClient.invalidateQueries({ queryKey: ["eventBalance", eventId] });
    },
  });

  if (isLoading) {
    return (
      <Flex justify="center" p="4">
        <Spinner />
      </Flex>
    );
  }

  if (isError || !expenses) {
    return (
      <Callout.Root color="red" size="1">
        <Callout.Text>
          No se pudieron cargar los gastos del evento.
        </Callout.Text>
      </Callout.Root>
    );
  }

  if (expenses.length === 0) {
    return (
      <Callout.Root color="gray" size="1">
        <Callout.Text>
          No hay gastos registrados. ¡Agrega uno para empezar!
        </Callout.Text>
      </Callout.Root>
    );
  }

  return (
    <Flex direction="column" gap="3">
      <Heading size="3">Gastos Registrados</Heading>
      {expenses.map((expense) => (
        <ExpenseEditor
          key={expense.id}
          expense={expense}
          members={members}
          onUpdate={(expenseId, updates) => {
            updateExpenseMutation.mutate({ expenseId, updates });
          }}
          onDelete={(expenseId) => {
            deleteExpenseMutation.mutate(expenseId);
          }}
          currentUserEmail={currentUserEmail}
        />
      ))}
    </Flex>
  );
};

export default ExpensesList;
