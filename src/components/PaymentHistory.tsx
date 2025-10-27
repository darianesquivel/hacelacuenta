import {
  Card,
  Heading,
  Text,
  Flex,
  Button,
  Callout,
  Spinner,
} from "@radix-ui/themes";
import { CheckIcon, TrashIcon } from "@radix-ui/react-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPayments, deletePayment } from "../api/data";
import { useAuthStatus } from "../hooks/useAuthStatus";
import { useToast } from "../hooks/useToast";
import type { EventMember } from "../api/data";

interface PaymentHistoryProps {
  eventId: string;
  members?: EventMember[];
}

const PaymentHistory = ({ eventId }: PaymentHistoryProps) => {
  const { currentUser } = useAuthStatus();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const {
    data: payments,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["payments", eventId],
    queryFn: () => getPayments(eventId),
    enabled: !!eventId,
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (paymentId: string) => deletePayment(eventId, paymentId),
    onSuccess: () => {
      showSuccess("Pago eliminado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["payments", eventId] });
      queryClient.invalidateQueries({ queryKey: ["eventBalance", eventId] });
    },
    onError: (error) => {
      showError(error.message || "Error al eliminar el pago");
    },
  });

  const handleDeletePayment = (paymentId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este pago?")) {
      deletePaymentMutation.mutate(paymentId);
    }
  };

  const canDeletePayment = () => {
    // Cualquier usuario logueado puede eliminar pagos
    return !!currentUser;
  };

  if (isLoading) {
    return (
      <Flex justify="center" p="4">
        <Spinner />
      </Flex>
    );
  }

  if (isError || !payments) {
    return (
      <Callout.Root color="red" size="1">
        <Callout.Text>No se pudieron cargar los pagos del evento.</Callout.Text>
      </Callout.Root>
    );
  }

  if (payments.length === 0) {
    return (
      <Card variant="surface" className="p-4">
        <Callout.Root color="gray" size="1">
          <Callout.Text>
            No hay pagos registrados. ¡Haz clic en "Pagar" en las sugerencias
            cuando hayas realizado un pago!
          </Callout.Text>
        </Callout.Root>
      </Card>
    );
  }

  // Filtrar solo pagos completados
  const completedPayments = payments.filter(
    (payment) => payment.status === "completed"
  );

  if (completedPayments.length === 0) {
    return (
      <Card variant="surface" className="p-4">
        <Callout.Root color="gray" size="1">
          <Callout.Text>
            No hay pagos registrados. ¡Haz clic en "Pagar" en las sugerencias
            cuando hayas realizado un pago!
          </Callout.Text>
        </Callout.Root>
      </Card>
    );
  }

  return (
    <Card variant="surface" className="p-4">
      <Heading size="3" mb="3">
        📋 Pagos Realizados
      </Heading>

      <Flex direction="column" gap="3">
        {completedPayments.map((payment) => (
          <Card key={payment.id} variant="classic" className="p-3">
            <Flex justify="between" align="center">
              <Flex direction="column" gap="1">
                <Flex align="center" gap="2">
                  <Text weight="medium">{payment.fromUser.displayName}</Text>
                  <Text color="gray">→</Text>
                  <Text weight="medium">{payment.toUser.displayName}</Text>
                </Flex>
                {payment.description && (
                  <Text size="1" color="gray">
                    {payment.description}
                  </Text>
                )}
                <Text size="1" color="gray">
                  {payment.createdAt.toLocaleDateString()}{" "}
                  {payment.createdAt.toLocaleTimeString()}
                </Text>
              </Flex>

              <Flex align="center" gap="3">
                <Text weight="bold" color="green">
                  ${payment.amount.toFixed(2)}
                </Text>

                <Flex align="center" gap="1">
                  <CheckIcon
                    width="16"
                    height="16"
                    className="text-green-500"
                  />
                  <Text size="1" color="green">
                    Pagado
                  </Text>
                </Flex>

                {canDeletePayment() && (
                  <Button
                    size="1"
                    color="red"
                    variant="soft"
                    onClick={() => handleDeletePayment(payment.id)}
                    disabled={deletePaymentMutation.isPending}
                  >
                    <TrashIcon width="16" height="16" />
                    Eliminar
                  </Button>
                )}
              </Flex>
            </Flex>
          </Card>
        ))}
      </Flex>
    </Card>
  );
};

export default PaymentHistory;
