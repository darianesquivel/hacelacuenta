import { Card, Heading, Text, Flex, Button, Callout } from "@radix-ui/themes";
import { ArrowRightIcon, CheckIcon } from "@radix-ui/react-icons";
import type { PaymentSuggestion } from "../api/data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPayment } from "../api/data";
import { useToast } from "../hooks/useToast";

interface PaymentSuggestionsProps {
  eventId: string;
  suggestions: PaymentSuggestion[];
  onPaymentAdded?: () => void;
}

const PaymentSuggestions = ({
  eventId,
  suggestions,
  onPaymentAdded,
}: PaymentSuggestionsProps) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const addPaymentMutation = useMutation({
    mutationFn: (suggestion: PaymentSuggestion) =>
      addPayment({
        eventId,
        fromUser: suggestion.fromUser,
        toUser: suggestion.toUser,
        amount: suggestion.amount,
        description: suggestion.reason,
        status: "completed", // Marcar como completado directamente
      }),
    onSuccess: () => {
      showSuccess("Pago registrado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["payments", eventId] });
      queryClient.invalidateQueries({ queryKey: ["eventBalance", eventId] });
      onPaymentAdded?.();
    },
    onError: (error) => {
      showError(error.message || "Error al registrar el pago");
    },
  });

  const handleAddPayment = (suggestion: PaymentSuggestion) => {
    addPaymentMutation.mutate(suggestion);
  };

  if (suggestions.length === 0) {
    return (
      <Card variant="surface" className="p-4">
        <Callout.Root color="green" size="1">
          <Callout.Text>
            ¡Perfecto! Todos los balances están equilibrados. No hay pagos
            pendientes.
          </Callout.Text>
        </Callout.Root>
      </Card>
    );
  }

  return (
    <Card variant="surface" className="p-4">
      <Heading size="3" mb="3">
        💡 Sugerencias de Pago
      </Heading>
      <Text size="2" color="gray" mb="4">
        Para equilibrar las cuentas, haz clic en "Pagar" cuando hayas realizado
        el pago:
      </Text>

      <Flex direction="column" gap="3">
        {suggestions.map((suggestion, index) => (
          <Card key={index} variant="classic" className="p-3">
            <Flex justify="between" align="center">
              <Flex direction="column" gap="1">
                <Flex align="center" gap="2">
                  <Text weight="medium">{suggestion.fromUser.displayName}</Text>
                  <ArrowRightIcon width="16" height="16" />
                  <Text weight="medium">{suggestion.toUser.displayName}</Text>
                </Flex>
                <Text size="1" color="gray">
                  {suggestion.reason}
                </Text>
              </Flex>
              <Flex align="center" gap="3">
                <Text weight="bold" color="green">
                  ${suggestion.amount.toFixed(2)}
                </Text>
                <Button
                  size="1"
                  color="green"
                  onClick={() => handleAddPayment(suggestion)}
                  disabled={addPaymentMutation.isPending}
                >
                  <CheckIcon width="16" height="16" />
                  {addPaymentMutation.isPending ? "Registrando..." : "Pagar"}
                </Button>
              </Flex>
            </Flex>
          </Card>
        ))}
      </Flex>

      <Text size="1" color="gray" mt="3">
        💡 Tip: Los pagos sugeridos están calculados para minimizar el número de
        transacciones necesarias.
      </Text>
    </Card>
  );
};

export default PaymentSuggestions;
