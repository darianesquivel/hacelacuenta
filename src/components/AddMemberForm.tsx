import { useState } from "react";
import { Flex, Text, TextField, Button, Callout } from "@radix-ui/themes";
import { useToast } from "../hooks/useToast";
import type { EventMember } from "../api/data";

interface AddMemberFormProps {
  onMemberAdded: (member: EventMember) => void;
  existingMembers: EventMember[];
  onClose?: () => void;
}

const AddMemberForm = ({
  onMemberAdded,
  existingMembers,
  onClose,
}: AddMemberFormProps) => {
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const { showSuccess } = useToast();

  const addMember = async () => {
    setError(null);
    setIsAdding(true);

    try {
      if (!newMemberName.trim()) {
        setError("El nombre es obligatorio");
        return;
      }

      if (
        existingMembers.some(
          (m) => m.name.toLowerCase() === newMemberName.toLowerCase()
        )
      ) {
        setError("Ya existe un miembro con ese nombre");
        return;
      }

      if (
        newMemberEmail &&
        existingMembers.some((m) => m.email === newMemberEmail)
      ) {
        setError("Ya existe un miembro con ese email");
        return;
      }

      const newMember: EventMember = {
        id: Date.now().toString(),
        name: newMemberName.trim(),
        email: newMemberEmail.trim() || undefined,
        isRegistered: false, // Simplificado: siempre false
      };

      onMemberAdded(newMember);
      setNewMemberName("");
      setNewMemberEmail("");
      showSuccess(`Miembro "${newMemberName.trim()}" agregado exitosamente`);
      onClose?.();
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Flex direction="column" gap="3">
      {error && (
        <Callout.Root color="red" size="1">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      <label>
        <Text size="2" weight="medium" as="div" mb="1">
          Nombre *
        </Text>
        <TextField.Root
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
          placeholder="Ej: Juan Pérez"
          required
        />
      </label>

      <label>
        <Text size="2" weight="medium" as="div" mb="1">
          Email (opcional)
        </Text>
        <TextField.Root
          value={newMemberEmail}
          onChange={(e) => setNewMemberEmail(e.target.value)}
          placeholder="juan@email.com"
          type="email"
        />
        <Text size="1" color="gray" as="div" mt="1">
          Si agregas un email, la persona podrá ver el evento desde su cuenta.
        </Text>
      </label>

      <Flex justify="end" gap="2">
        <Button variant="soft" color="gray" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={addMember}
          color="green"
          disabled={isAdding}
          loading={isAdding}
        >
          Agregar Miembro
        </Button>
      </Flex>
    </Flex>
  );
};

export default AddMemberForm;
