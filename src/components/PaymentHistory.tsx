import {
  Card,
  Heading,
  Text,
  Flex,
  Button,
  Callout,
  Spinner,
} from "@radix-ui/themes";
import { CheckIcon, Cross2Icon, ClockIcon } from "@radix-ui/react-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPayments, updatePaymentStatus } from "../api/data";
import { useAuthStatus } from "../hooks/useAuthStatus";
import { useToast } from "../hooks/useToast";
import type { EventMember } from "../api/data";

interface PaymentHistoryProps {
  eventId: string;
  members?: EventMember[];
}

const PaymentHistory = ({ eventId, members = [] }: PaymentHistoryProps) => {
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

  const updatePaymentMutation = useMutation({
    mutationFn: ({
      paymentId,
      status,
    }: {
      paymentId: string;
      status: "completed" | "cancelled";
    }) => updatePaymentStatus(eventId, paymentId, status),
    onSuccess: () => {
      showSuccess("Estado del pago actualizado");
      queryClient.invalidateQueries({ queryKey: ["payments", eventId] });
      queryClient.invalidateQueries({ queryKey: ["eventBalance", eventId] });
    },
    onError: (error) => {
      showError(error.message || "Error al actualizar el pago");
    },
  });

  const handleUpdateStatus = (
    paymentId: string,
    status: "completed" | "cancelled"
  ) => {
    updatePaymentMutation.mutate({ paymentId, status });
  };

  const canConfirmPayment = (payment: any) => {
    if (!currentUser) return false;

    if (payment.fromUser.email === currentUser.email) return true;

    if (payment.toUser.email === currentUser.email) return true;

    if (!currentUser.email) {
      const currentUserMember = members.find(
        (m) =>
          m.email === currentUser.email ||
          (m.name &&
            currentUser.displayName &&
            m.name === currentUser.displayName)
      );

      if (currentUserMember) {
        const fromMember = members.find(
          (m) =>
            (m.email || m.name) ===
            (payment.fromUser.email || payment.fromUser.displayName)
        );
        const toMember = members.find(
          (m) =>
            (m.email || m.name) ===
            (payment.toUser.email || payment.toUser.displayName)
        );

        return (
          currentUserMember === fromMember || currentUserMember === toMember
        );
      }
    }

    return false;
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
            No hay pagos registrados. ¡Agrega uno desde las sugerencias!
          </Callout.Text>
        </Callout.Root>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckIcon width="16" height="16" className="text-green-500" />;
      case "cancelled":
        return <Cross2Icon width="16" height="16" className="text-red-500" />;
      default:
        return <ClockIcon width="16" height="16" className="text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "yellow";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado";
      case "cancelled":
        return "Cancelado";
      default:
        return "Pendiente";
    }
  };

  return (
    <Card variant="surface" className="p-4">
      <Heading size="3" mb="3">
        📋 Historial de Pagos
      </Heading>

      <Flex direction="column" gap="3">
        {payments.map((payment) => (
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
                  {getStatusIcon(payment.status)}
                  <Text size="1" color={getStatusColor(payment.status)}>
                    {getStatusText(payment.status)}
                  </Text>
                </Flex>

                {payment.status === "pending" && canConfirmPayment(payment) && (
                  <Flex gap="1">
                    <Button
                      size="1"
                      color="green"
                      onClick={() =>
                        handleUpdateStatus(payment.id, "completed")
                      }
                      disabled={updatePaymentMutation.isPending}
                    >
                      <CheckIcon width="16" height="16" />
                      {payment.fromUser.email === currentUser?.email ||
                      (payment.fromUser.displayName &&
                        currentUser?.displayName ===
                          payment.fromUser.displayName)
                        ? "Pagado"
                        : "Recibido"}
                    </Button>
                    <Button
                      size="1"
                      color="red"
                      variant="soft"
                      onClick={() =>
                        handleUpdateStatus(payment.id, "cancelled")
                      }
                      disabled={updatePaymentMutation.isPending}
                    >
                      <Cross2Icon width="16" height="16" />
                      Cancelar
                    </Button>
                  </Flex>
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
