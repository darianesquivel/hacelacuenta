import { Flex, Spinner, Callout } from "@radix-ui/themes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getExpenses,
  updateExpense,
  deleteExpense,
  hasPayments,
} from "../api/data";
import { useToast } from "../hooks/useToast";
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
  const { showSuccess, showError } = useToast();

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
      showSuccess("Gasto actualizado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["expenses", eventId] });
      queryClient.invalidateQueries({ queryKey: ["eventBalance", eventId] });
    },
    onError: (error) => {
      showError(error.message || "Error al actualizar el gasto");
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      // Verificar si hay pagos antes de eliminar
      const hasExistingPayments = await hasPayments(eventId);

      if (hasExistingPayments) {
        const confirmMessage = `⚠️ ADVERTENCIA: Hay pagos registrados en este evento.\n\nAl eliminar este gasto, los balances pueden quedar inconsistentes.\n\n¿Estás seguro de que quieres continuar?\n\nRecomendación: Revisa los pagos en la pestaña "Pagos" antes de eliminar gastos.`;

        if (!confirm(confirmMessage)) {
          throw new Error("Eliminación cancelada por el usuario");
        }
      }

      return deleteExpense(expenseId, eventId);
    },
    onSuccess: () => {
      showSuccess("Gasto eliminado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["expenses", eventId] });
      queryClient.invalidateQueries({ queryKey: ["eventBalance", eventId] });
      queryClient.invalidateQueries({ queryKey: ["payments", eventId] });
    },
    onError: (error) => {
      if (error.message === "Eliminación cancelada por el usuario") {
        // No mostrar error si el usuario canceló
        return;
      }
      showError(error.message || "Error al eliminar el gasto");
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
