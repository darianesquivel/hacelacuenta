import { Card, Heading, Text, Flex, Spinner, Callout } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { getExpenses } from "../api/data";
import { getBalanceSummary } from "../utils/balanceCalculator";

interface EventBalanceProps {
  eventId: string;
  members: string[];
}

const useEventExpenses = (eventId: string) => {
  return useQuery({
    queryKey: ["expenses", eventId],
    queryFn: () => getExpenses(eventId),
    enabled: !!eventId,
  });
};

const EventBalance = ({ eventId, members }: EventBalanceProps) => {
  const { data: expenses, isLoading, isError } = useEventExpenses(eventId);

  if (isLoading) {
    return (
      <Flex justify="center">
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
          No hay gastos registrados. ¡Agrega uno para empezar el cálculo!
        </Callout.Text>
      </Callout.Root>
    );
  }

  const summary = getBalanceSummary(expenses, members);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <Flex direction="column" gap="4">
      <Card variant="surface" className="p-4">
        <Heading size="3">Resumen Financiero</Heading>
        <Text size="2">Gasto Total: ${totalExpenses.toFixed(2)}</Text>
      </Card>

      <Heading size="3">Saldos Individuales</Heading>

      {summary.map(([email, balance]) => (
        <Card key={email} variant="surface">
          <Flex justify="between" align="center">
            <Text weight="medium">{email}</Text>
            {balance < 0 ? (
              <Text color="red" weight="bold">
                Debe: ${Math.abs(balance).toFixed(2)}
              </Text>
            ) : balance > 0 ? (
              <Text color="green" weight="bold">
                A su favor: ${balance.toFixed(2)}
              </Text>
            ) : (
              <Text color="gray" weight="bold">
                Saldado
              </Text>
            )}
          </Flex>
        </Card>
      ))}
    </Flex>
  );
};

export default EventBalance;
