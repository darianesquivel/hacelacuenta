import { useState } from "react";
import {
  Button,
  Flex,
  Text,
  TextField,
  TextArea,
  Callout,
} from "@radix-ui/themes";
import { useCreateEvent } from "../hooks/useEvents";
import MemberManager from "./MemberManager";
import { useAuthStatus } from "../hooks/useAuthStatus";
import { useToast } from "../hooks/useToast";
import type { EventMember } from "../api/data";

interface EventFormProps {
  onClose: () => void;
}

const EventForm = ({ onClose }: EventFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState<EventMember[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const { currentUser } = useAuthStatus();
  const { showSuccess, showError } = useToast();

  const { mutateAsync: createEventMutate, isPending } = useCreateEvent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("El nombre es obligatorio.");
      return;
    }

    if (members.length === 0) {
      setFormError("Debe agregar al menos un miembro al evento.");
      return;
    }

    try {
      await createEventMutate({
        name,
        description,
        members,
      });
      showSuccess(`Evento "${name}" creado exitosamente`);
      onClose();
    } catch (err: any) {
      console.error(err);
      const errorMessage =
        err.message || "Error desconocido al crear el evento.";
      setFormError(errorMessage);
      showError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="4">
        {formError && (
          <Callout.Root color="red" size="1">
            <Callout.Text>{formError}</Callout.Text>
          </Callout.Root>
        )}

        <label>
          <Text size="2" weight="medium" as="div" mb="1">
            Nombre del Evento
          </Text>

          <TextField.Root
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Asado del Sábado"
            required
          />
        </label>

        <label>
          <Text size="2" weight="medium" as="div" mb="1">
            Descripción (Opcional)
          </Text>

          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Breve descripción del evento..."
          />
        </label>

        <MemberManager
          members={members}
          onMembersChange={setMembers}
          currentUser={currentUser}
          isCreatingEvent={true}
        />

        <Flex gap="3" justify="end" mt="4">
          <Button variant="soft" color="gray" onClick={onClose} type="button">
            Cancelar
          </Button>

          <Button
            color="indigo"
            variant="solid"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Creando..." : "Crear Evento"}
          </Button>
        </Flex>
      </Flex>{" "}
    </form>
  );
};

export default EventForm;
