import { useState, useEffect } from "react";
import {
  Card,
  Text,
  TextField,
  Button,
  Flex,
  IconButton,
  Callout,
} from "@radix-ui/themes";
import { Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";
import type { EventMember, Expense } from "../api/data";

interface ExpenseEditorProps {
  expense: Expense;
  members: EventMember[];
  onUpdate: (expenseId: string, updates: Partial<Expense>) => void;
  onDelete: (expenseId: string) => void;
  currentUserEmail?: string;
}

const ExpenseEditor = ({
  expense,
  members,
  onUpdate,
  onDelete,
  currentUserEmail,
}: ExpenseEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(expense.description);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [paidByMemberId, setPaidByMemberId] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const paidByMember = members.find(
      (m) =>
        m.email === expense.paidBy.email ||
        m.name === expense.paidBy.displayName
    );
    if (paidByMember) {
      setPaidByMemberId(paidByMember.id);
    }

    const originalSharedWith = expense.sharedWith
      .map((sw) =>
        members.find((m) => m.email === sw.email || m.name === sw.displayName)
      )
      .filter(Boolean)
      .map((m) => m!.id);
    setSelectedMembers(originalSharedWith);
  }, [expense, members]);

  const handleSave = () => {
    setError(null);

    if (
      !description.trim() ||
      !amount ||
      parseFloat(amount) <= 0 ||
      !paidByMemberId ||
      selectedMembers.length === 0
    ) {
      setError("Por favor, completa todos los campos correctamente.");
      return;
    }

    const paidByMember = members.find((m) => m.id === paidByMemberId);
    const sharedWithMembers = members.filter((m) =>
      selectedMembers.includes(m.id)
    );

    if (!paidByMember || sharedWithMembers.length === 0) {
      setError("Error al procesar los miembros seleccionados.");
      return;
    }

    const updatedExpense = {
      description: description.trim(),
      amount: parseFloat(amount),
      paidBy: {
        uid: paidByMember.isRegistered
          ? paidByMember.email || "guest"
          : "guest",
        displayName: paidByMember.name,
        photoURL: null,
        email: paidByMember.email || null,
      },
      sharedWith: sharedWithMembers.map((member) => ({
        uid: member.isRegistered ? member.email || "guest" : "guest",
        displayName: member.name,
        photoURL: null,
        email: member.email || null,
      })),
    };

    onUpdate(expense.id, updatedExpense);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm("¿Estás seguro de que quieres eliminar este gasto?")) {
      onDelete(expense.id);
    }
  };

  if (isEditing) {
    return (
      <Card variant="surface" className="p-4">
        <Flex direction="column" gap="3">
          <Text size="3" weight="medium">
            Editar Gasto
          </Text>

          {error && (
            <Callout.Root color="red" size="1">
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          )}

          <TextField.Root
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción del gasto"
          />

          <TextField.Root
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            step="0.01"
            placeholder="Monto"
          />

          <Flex direction="column" gap="2">
            <Text size="2" weight="medium">
              Pagado por:
            </Text>
            <select
              value={paidByMemberId}
              onChange={(e) => setPaidByMemberId(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              <option value="">Selecciona quién pagó</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                  {member.email && ` (${member.email})`}
                  {member.email === currentUserEmail && " (Tú)"}
                </option>
              ))}
            </select>
          </Flex>

          <Flex direction="column" gap="2">
            <Text size="2" weight="medium">
              Repartir entre:
            </Text>
            {members.map((member) => (
              <Flex key={member.id} align="center" gap="2">
                <input
                  type="checkbox"
                  id={`edit-member-${member.id}`}
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
                <label htmlFor={`edit-member-${member.id}`}>
                  <Text size="2">
                    {member.name}
                    {member.email && ` (${member.email})`}
                    {member.email === currentUserEmail && " (Tú)"}
                  </Text>
                </label>
              </Flex>
            ))}
          </Flex>

          <Flex gap="2" justify="end">
            <Button
              variant="soft"
              color="gray"
              onClick={() => setIsEditing(false)}
            >
              Cancelar
            </Button>
            <Button color="green" onClick={handleSave}>
              Guardar
            </Button>
          </Flex>
        </Flex>
      </Card>
    );
  }

  return (
    <Card variant="surface" className="p-4">
      <Flex justify="between" align="start">
        <Flex direction="column" gap="1" style={{ flex: 1 }}>
          <Text weight="medium">{expense.description}</Text>
          <Text size="2" color="gray">
            ${expense.amount.toFixed(2)} - Pagado por:{" "}
            {expense.paidBy.displayName}
          </Text>
          <Text size="1" color="gray">
            Repartido entre:{" "}
            {expense.sharedWith.map((sw) => sw.displayName).join(", ")}
          </Text>
        </Flex>
        <Flex gap="1">
          <IconButton
            variant="soft"
            color="blue"
            size="1"
            onClick={() => setIsEditing(true)}
          >
            <Pencil2Icon width="12" height="12" />
          </IconButton>
          <IconButton
            variant="soft"
            color="red"
            size="1"
            onClick={handleDelete}
          >
            <TrashIcon width="12" height="12" />
          </IconButton>
        </Flex>
      </Flex>
    </Card>
  );
};

export default ExpenseEditor;
