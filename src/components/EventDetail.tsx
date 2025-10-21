import { useState } from "react";
import {
  Card,
  Heading,
  Text,
  Button,
  Flex,
  Spinner,
  Tabs,
  Callout,
  IconButton,
  TextField,
  TextArea,
} from "@radix-ui/themes";
import {
  ArrowLeftIcon,
  Pencil2Icon,
  PersonIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import { useEventDetails, useUpdateEvent } from "../hooks/useEvents";
import ExpenseForm from "./ExpenseForm";
import EventBalance from "./EventBalance";

interface EventDetailProps {
  eventId: string;
  onBack: () => void;
}

const EventDetail = ({ eventId, onBack }: EventDetailProps) => {
  const { data: event, isLoading, isError } = useEventDetails(eventId);
  const { mutate: updateEventMutate, isPending: isUpdating } = useUpdateEvent();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(event?.name || "");
  const [description, setDescription] = useState(event?.description || "");
  const [emailsString, setEmailsString] = useState(
    event?.memberEmails.join(", ") || ""
  );
  const [editError, setEditError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card className="mt-8 p-6 text-center">
        <Spinner />
        <Text size="3" className="mt-2 block">
          Cargando detalles del evento...
        </Text>
      </Card>
    );
  }

  if (isError || !event) {
    return (
      <Card className="mt-8 p-6 text-center text-red-500">
        <Text size="3">
          Ocurrió un error al cargar el evento o el evento no existe.
        </Text>
        <Button onClick={onBack} mt="3" variant="soft">
          Volver a la Lista
        </Button>
      </Card>
    );
  }

  if (name === "" && !isEditing) setName(event.name);
  if (description === "" && !isEditing) setDescription(event.description || "");
  if (emailsString === "" && !isEditing)
    setEmailsString(event.memberEmails.join(", "));

  const handleUpdate = async () => {
    setEditError(null);
    if (!name.trim()) {
      setEditError("El nombre es obligatorio.");
      return;
    }

    const memberEmails = emailsString
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0 && email.includes("@"));

    try {
      await updateEventMutate({
        eventId: event.id,
        name: name.trim(),
        description: description.trim(),
        memberEmails,
      });
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      setEditError(err.message || "Error al actualizar el evento.");
    }
  };

  return (
    <Card className="mt-8 p-6">
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <IconButton onClick={onBack} variant="soft" color="gray" size="2">
            <ArrowLeftIcon width="16" height="16" />
          </IconButton>
          <Heading size="6">{event.name}</Heading>
          <IconButton
            onClick={() => setIsEditing(!isEditing)}
            variant="soft"
            color="indigo"
            size="2"
          >
            <Pencil2Icon width="16" height="16" />
          </IconButton>
        </Flex>

        <Card variant="surface" className="p-4">
          {isEditing ? (
            <Flex direction="column" gap="3">
              <Heading size="3">Editar Evento</Heading>
              {editError && (
                <Callout.Root color="red" size="1">
                  <Callout.Text>{editError}</Callout.Text>
                </Callout.Root>
              )}

              <label>
                <Text size="2" weight="medium" as="div" mb="1">
                  Nombre
                </Text>
                <TextField.Root
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>

              <label>
                <Text size="2" weight="medium" as="div" mb="1">
                  Descripción
                </Text>
                <TextArea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>

              <label>
                <Text size="2" weight="medium" as="div" mb="1">
                  Miembros (Emails)
                </Text>
                <TextArea
                  value={emailsString}
                  onChange={(e) => setEmailsString(e.target.value)}
                  placeholder="Separados por comas"
                />
              </label>

              <Flex justify="end" gap="3">
                <Button
                  variant="soft"
                  color="gray"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
                <Button
                  color="indigo"
                  onClick={handleUpdate}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <UpdateIcon className="mr-2" /> Guardando...
                    </>
                  ) : (
                    "Guardar Cambios"
                  )}
                </Button>
              </Flex>
            </Flex>
          ) : (
            <Flex direction="column" gap="2">
              <Text size="2">Descripción: {event.description || "N/A"}</Text>
              <Flex align="center" gap="1">
                <PersonIcon />
                <Text size="2" color="gray">
                  Miembros: {event.memberEmails.length}
                </Text>
              </Flex>
              <Text size="1" color="gray">
                ID: {event.id}
              </Text>
            </Flex>
          )}
        </Card>

        <Tabs.Root defaultValue="expenses">
          <Tabs.List>
            <Tabs.Trigger value="expenses">Gastos</Tabs.Trigger>
            <Tabs.Trigger value="balance">Balance</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="expenses">
            <Heading size="4" mb="3">
              Agregar Nuevo Gasto
            </Heading>
            <ExpenseForm eventId={eventId} members={event.memberEmails} />
          </Tabs.Content>

          <Tabs.Content value="balance">
            <EventBalance eventId={eventId} members={event.memberEmails} />
          </Tabs.Content>
        </Tabs.Root>
      </Flex>
    </Card>
  );
};

export default EventDetail;
