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

import type { EventMember } from "../api/data";

interface ExpenseFormProps {
  eventId: string;
  members: EventMember[];
}

const ExpenseForm = ({ eventId, members }: ExpenseFormProps) => {
  const { currentUser } = useAuthStatus();
  const queryClient = useQueryClient();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [paidByMemberId, setPaidByMemberId] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

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

    if (
      !description.trim() ||
      !amount ||
      amount <= 0 ||
      !paidByMemberId ||
      selectedMembers.length === 0
    ) {
      setFormError(
        "Por favor, completa todos los campos y selecciona quién pagó y con quién se reparte el gasto."
      );
      return;
    }

    if (!currentUser) {
      setFormError("Debes estar autenticado para registrar un gasto.");
      return;
    }

    // Encontrar el miembro que pagó
    const paidByMember = members.find((m) => m.id === paidByMemberId);
    if (!paidByMember) {
      setFormError("Error: No se encontró el miembro que pagó.");
      return;
    }

    // Encontrar los miembros con quienes se reparte
    const sharedWithMembers = members.filter((m) =>
      selectedMembers.includes(m.id)
    );
    if (sharedWithMembers.length === 0) {
      setFormError(
        "Error: No se encontraron los miembros para repartir el gasto."
      );
      return;
    }

    const paidByUserRef = {
      uid: paidByMember.isRegistered ? paidByMember.email || "guest" : "guest",
      displayName: paidByMember.name,
      photoURL: null,
      email: paidByMember.email || null,
    };

    const sharedWithRefs = sharedWithMembers.map((member) => ({
      uid: member.isRegistered ? member.email || "guest" : "guest",
      displayName: member.name,
      photoURL: null,
      email: member.email || null,
    }));

    addExpenseMutate({
      eventId,
      description: description.trim(),
      amount: amount as number,
      paidBy: paidByUserRef,
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
              value={paidByMemberId}
              onValueChange={setPaidByMemberId}
              required
            >
              <Select.Trigger placeholder="Selecciona quién pagó..." />
              <Select.Content>
                {members.map((member) => (
                  <Select.Item key={member.id} value={member.id}>
                    {member.name}
                    {member.email && ` (${member.email})`}
                    {member.email === currentUser?.email && " (Tú)"}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </label>

          <label>
            <Text size="2" weight="medium" as="div" mb="1">
              Repartir entre:
            </Text>
            <Flex direction="column" gap="2">
              {members.map((member) => (
                <Flex key={member.id} align="center" gap="2">
                  <input
                    type="checkbox"
                    id={`member-${member.id}`}
                    checked={selectedMembers.includes(member.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMembers([...selectedMembers, member.id]);
                      } else {
                        setSelectedMembers(
                          selectedMembers.filter((id) => id !== member.id)
                        );
                      }
                    }}
                  />
                  <label htmlFor={`member-${member.id}`}>
                    <Text size="2">
                      {member.name}
                      {member.email && ` (${member.email})`}
                      {member.email === currentUser?.email && " (Tú)"}
                    </Text>
                  </label>
                </Flex>
              ))}
            </Flex>
            <Text size="1" color="gray" as="div" mt="1">
              Selecciona todas las personas entre las que se reparte este gasto.
            </Text>
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
