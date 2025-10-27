import { Card, Heading, Text, Flex, Spinner, Callout } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { getExpenses, getPayments } from "../api/data";
import { getBalanceSummary } from "../utils/balanceCalculator";
import { useAuthStatus } from "../hooks/useAuthStatus";

import type { EventMember } from "../api/data";

interface EventBalanceProps {
  eventId: string;
  members: EventMember[];
}

const useEventExpenses = (eventId: string) => {
  return useQuery({
    queryKey: ["expenses", eventId],
    queryFn: () => getExpenses(eventId),
    enabled: !!eventId,
  });
};

const EventBalance = ({ eventId, members }: EventBalanceProps) => {
  const { currentUser } = useAuthStatus();
  const { data: expenses, isLoading, isError } = useEventExpenses(eventId);

  const {
    data: payments,
    isLoading: paymentsLoading,
    isError: paymentsError,
  } = useQuery({
    queryKey: ["payments", eventId],
    queryFn: () => getPayments(eventId),
    enabled: !!eventId,
  });

  const isEventCreator = (member: EventMember): boolean => {
    // Solo mostrar si es el creador del evento
    return member.email === currentUser?.email;
  };

  if (isLoading || paymentsLoading) {
    return (
      <Flex justify="center">
        <Spinner />
      </Flex>
    );
  }

  if (isError || !expenses || paymentsError) {
    return (
      <Callout.Root color="red" size="1">
        <Callout.Text>No se pudieron cargar los datos del evento.</Callout.Text>
      </Callout.Root>
    );
  }

  if (expenses.length === 0) {
    return (
      <Callout.Root color="gray" size="1">
        <Callout.Text>
          No hay gastos registrados. ¡Agrega uno para empezar el cálculo!
        </Callout.Text>
      </Callout.Root>
    );
  }

  // Función para redondear balances de manera inteligente
  const roundBalance = (balance: number): number => {
    // Si el balance está muy cerca de 0 (menos de 0.01), considerarlo como 0
    return Math.abs(balance) < 0.01 ? 0 : Math.round(balance * 100) / 100;
  };

  const memberEmails = members.map((m) => m.email || m.name);
  const summary = getBalanceSummary(expenses, memberEmails, payments);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <Flex direction="column" gap="4">
      <Card variant="surface" className="p-4">
        <Heading size="3">Resumen Financiero</Heading>
        <Text size="2">Gasto Total: ${totalExpenses.toFixed(2)}</Text>
      </Card>

      <Heading size="3">Saldos Individuales</Heading>

      {summary.map(([identifier, balance]) => {
        const roundedBalance = roundBalance(balance);

        return (
          <Card key={identifier} variant="surface">
            <Flex justify="between" align="center">
              <Flex direction="column" gap="1">
                <Text weight="medium">{identifier}</Text>
                <Text size="1" color="gray">
                  {(() => {
                    const member = members.find(
                      (m) => (m.email || m.name) === identifier
                    );
                    return member && isEventCreator(member)
                      ? "Creador del evento"
                      : "";
                  })()}
                </Text>
              </Flex>
              {roundedBalance < 0 ? (
                <Text color="red" weight="bold">
                  Debe: ${Math.abs(roundedBalance).toFixed(2)}
                </Text>
              ) : roundedBalance > 0 ? (
                <Text color="green" weight="bold">
                  A su favor: ${roundedBalance.toFixed(2)}
                </Text>
              ) : (
                <Text color="gray" weight="bold">
                  Saldado
                </Text>
              )}
            </Flex>
          </Card>
        );
      })}
    </Flex>
  );
};

export default EventBalance;
