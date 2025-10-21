// src/components/EventForm.tsx
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

interface EventFormProps {
  onClose: () => void;
}

const EventForm = ({ onClose }: EventFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emailsString, setEmailsString] = useState(""); // Input para emails
  const [formError, setFormError] = useState<string | null>(null);

  const { mutateAsync: createEventMutate, isPending } = useCreateEvent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("El nombre es obligatorio.");
      return;
    }

    const memberEmails = emailsString
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0 && email.includes("@"));

    try {
      await createEventMutate({
        name,
        description,
        memberEmails,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "Error desconocido al crear el evento.");
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

        <label>
          <Text size="2" weight="medium" as="div" mb="1">
            Invitar Miembros (Opcional)
          </Text>

          <TextField.Root
            value={emailsString}
            onChange={(e) => setEmailsString(e.target.value)}
            placeholder="amigo1@mail.com, amigo2@mail.com"
          />

          <Text size="1" color="gray" as="div" mt="1">
            Separa los emails con comas. Tu email se incluye automáticamente.
          </Text>
        </label>

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
