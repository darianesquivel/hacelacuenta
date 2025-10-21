import { useState } from "react";
import {
  Flex,
  Text,
  TextField,
  Button,
  Callout,
  Select,
  Card,
} from "@radix-ui/themes";
import { useAuthStatus } from "../hooks/useAuthStatus";
import { addExpense } from "../api/data";
import { useQueryClient, useMutation } from "@tanstack/react-query";

interface ExpenseFormProps {
  eventId: string;
  members: string[];
}

const ExpenseForm = ({ eventId, members }: ExpenseFormProps) => {
  const { currentUser } = useAuthStatus();
  const queryClient = useQueryClient();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [paidByEmail, setPaidByEmail] = useState(currentUser?.email || "");
  const [formError, setFormError] = useState<string | null>(null);

  const { mutate: addExpenseMutate, isPending } = useMutation({
    mutationFn: (data: Parameters<typeof addExpense>[0]) => addExpense(data),
    onSuccess: () => {
      setDescription("");
      setAmount("");
      setFormError(null);
      queryClient.invalidateQueries({ queryKey: ["expenses", eventId] });
      queryClient.invalidateQueries({ queryKey: ["eventBalance", eventId] });
    },
    onError: (error) => {
      console.error("Error al agregar gasto:", error);
      setFormError(error.message || "Error desconocido al agregar el gasto.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!description.trim() || !amount || amount <= 0 || !paidByEmail) {
      setFormError(
        "Por favor, completa la descripción y el monto (debe ser mayor a 0) y selecciona quién pagó."
      );
      return;
    }

    if (!currentUser) {
      setFormError("Debes estar autenticado para registrar un gasto.");
      return;
    }

    // 1. Encontrar el objeto UserReference del que pagó (para paidBy)
    const paidByUserRef = {
      uid: currentUser.uid,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
      email: currentUser.email,
    };

    const sharedWithRefs = members.map((email) => ({
      uid: "N/A",
      displayName: null,
      photoURL: null,
      email: email,
    }));

    addExpenseMutate({
      eventId,
      description: description.trim(),
      amount: amount as number,
      paidBy: currentUser,
      sharedWith: sharedWithRefs,
    });
  };

  return (
    <Card variant="surface" className="p-4 mb-4">
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap="3">
          {formError && (
            <Callout.Root color="red" size="1">
              <Callout.Text>{formError}</Callout.Text>
            </Callout.Root>
          )}

          <label>
            <Text size="2" weight="medium" as="div" mb="1">
              Descripción del Gasto
            </Text>
            <TextField.Root
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: La carne para el asado"
              required
            />
          </label>

          <label>
            <Text size="2" weight="medium" as="div" mb="1">
              Monto ($)
            </Text>
            <TextField.Root
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || "")}
              type="number"
              step="0.01"
              required
            />
          </label>

          <label>
            <Text size="2" weight="medium" as="div" mb="1">
              Pagado por:
            </Text>
            <Select.Root
              value={paidByEmail}
              onValueChange={setPaidByEmail}
              required
            >
              <Select.Trigger placeholder="Selecciona quién pagó..." />
              <Select.Content>
                {members.map((email) => (
                  <Select.Item key={email} value={email}>
                    {email === currentUser?.email ? `${email} (Tú)` : email}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </label>

          <Button type="submit" color="green" disabled={isPending}>
            {isPending ? "Agregando..." : "Agregar Gasto"}
          </Button>
        </Flex>
      </form>
    </Card>
  );
};

export default ExpenseForm;
