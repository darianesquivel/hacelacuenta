import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getExpenses, getPayments } from "../api/data";
import { getBalanceSummary } from "../utils/balanceCalculator";
import { calculatePaymentSuggestions } from "../api/data";
import PaymentSuggestions from "./PaymentSuggestions";
import PaymentHistory from "./PaymentHistory";
import { Spinner, Callout, Flex } from "@radix-ui/themes";
import type { EventMember } from "../api/data";

interface PaymentManagerProps {
  eventId: string;
  members: EventMember[];
}

const PaymentManager = ({ eventId, members }: PaymentManagerProps) => {
  const {
    data: expenses,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["expenses", eventId],
    queryFn: () => getExpenses(eventId),
    enabled: !!eventId,
  });

  const {
    data: payments,
    isLoading: paymentsLoading,
    isError: paymentsError,
  } = useQuery({
    queryKey: ["payments", eventId],
    queryFn: () => getPayments(eventId),
    enabled: !!eventId,
  });

  if (isLoading || paymentsLoading) {
    return (
      <Flex justify="center" p="4">
        <Spinner />
      </Flex>
    );
  }

  if (isError || !expenses || paymentsError) {
    return (
      <Callout.Root color="red" size="1">
        <Callout.Text>
          No se pudieron cargar los datos para calcular las sugerencias de pago.
        </Callout.Text>
      </Callout.Root>
    );
  }

  if (expenses.length === 0) {
    return (
      <Flex direction="column" gap="4">
        <Callout.Root color="gray" size="1">
          <Callout.Text>
            No hay gastos registrados. Agrega algunos gastos para ver las
            sugerencias de pago.
          </Callout.Text>
        </Callout.Root>
        <PaymentHistory eventId={eventId} />
      </Flex>
    );
  }

  const memberEmails = members.map((m) => m.email || m.name);
  const balances = getBalanceSummary(expenses, memberEmails, payments);

  const suggestions = calculatePaymentSuggestions(balances, members);

  return (
    <Flex direction="column" gap="4">
      <PaymentSuggestions eventId={eventId} suggestions={suggestions} />
      <PaymentHistory eventId={eventId} />
    </Flex>
  );
};

export default PaymentManager;
