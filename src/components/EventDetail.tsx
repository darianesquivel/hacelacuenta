import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  TrashIcon,
} from "@radix-ui/react-icons";
import {
  useEventDetails,
  useUpdateEvent,
  useDeleteEvent,
} from "../hooks/useEvents";
import { useAuthStatus } from "../hooks/useAuthStatus";
import { useToast } from "../hooks/useToast";
import ExpenseForm from "./ExpenseForm";
import EventBalance from "./EventBalance";
import MemberManager from "./MemberManager";
import ExpensesList from "./ExpensesList";
import PaymentManager from "./PaymentManager";
import LoadingState from "./ui/LoadingState";
import ErrorState from "./ui/ErrorState";

interface EventDetailProps {
  eventId: string;
}

interface CopyLinkButtonProps {
  eventId: string;
}

const CopyLinkButton = ({ eventId }: CopyLinkButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();

    const fullUrl = `${window.location.origin}/events/${eventId}`;

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("No se pudo copiar el texto", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-2 rounded-full transition-colors duration-200 shadow-lg flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
        copied
          ? "bg-green-500 hover:bg-green-600 text-white focus:ring-green-300"
          : "bg-indigo-500 hover:bg-indigo-600 text-white focus:ring-indigo-300"
      }`}
      aria-label={copied ? "Enlace copiado" : "Copiar Enlace"}
      title={copied ? "Enlace copiado" : "Copiar Enlace para Compartir"}
    >
      {copied ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.74 1.74" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.74-1.74" />
        </svg>
      )}
    </button>
  );
};

const EventDetail = ({ eventId }: EventDetailProps) => {
  const { data: event, isLoading, isError } = useEventDetails(eventId);
  const { mutate: updateEventMutate, isPending: isUpdating } = useUpdateEvent();
  const { mutate: deleteEventMutate, isPending: isDeleting } = useDeleteEvent();
  const { currentUser } = useAuthStatus();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emailsString, setEmailsString] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (event && !isEditing) {
      setName(event.name || "");
      setDescription(event.description || "");
      setEmailsString(event.members?.map((m) => m.email).join(", ") || "");
    }
  }, [event, isEditing]);

  if (isLoading) {
    return <LoadingState message="Cargando detalles del evento..." />;
  }

  if (isError || !event) {
    return (
      <ErrorState message="Ocurrió un error al cargar el evento o el evento no existe." />
    );
  }

  const handleUpdate = async () => {
    setEditError(null);
    if (!name.trim()) {
      setEditError("El nombre es obligatorio.");
      return;
    }

    const memberEmails = emailsString
      .split(",")
      .map((email: string) => email.trim())
      .filter((email: string) => email.length > 0 && email.includes("@"));

    const members = memberEmails.map((email) => ({
      id: `member-${Date.now()}-${Math.random()}`,
      name: email,
      email,
      isRegistered: false,
    }));

    try {
      await updateEventMutate({
        eventId: event.id,
        name: name.trim(),
        description: description.trim(),
        members,
      });
      showSuccess("Evento actualizado exitosamente");
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || "Error al actualizar el evento.";
      setEditError(errorMessage);
      showError(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!event) return;

    const confirmMessage = `¿Estás seguro de que quieres eliminar el evento "${event.name}"?\n\nEsta acción eliminará:\n• El evento completo\n• Todos los gastos registrados\n• Todos los datos asociados\n\nEsta acción NO se puede deshacer.`;

    if (confirm(confirmMessage)) {
      try {
        await deleteEventMutate(eventId);
        showSuccess(`Evento "${event.name}" eliminado exitosamente`);
        navigate("/");
      } catch (err: any) {
        console.error("Error al eliminar evento:", err);
        const errorMessage = err.message || "Error al eliminar el evento.";
        setEditError(errorMessage);
        showError(errorMessage);
      }
    }
  };

  return (
    <Card className="mt-8 p-6">
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <IconButton
            onClick={() => navigate("/")}
            variant="soft"
            color="gray"
            size="2"
          >
            <ArrowLeftIcon width="16" height="16" />
          </IconButton>
          <Heading size="6">{event.name}</Heading>
          <Flex gap="2">
            <IconButton
              onClick={() => setIsEditing(!isEditing)}
              variant="soft"
              color="indigo"
              size="2"
            >
              <Pencil2Icon width="16" height="16" />
            </IconButton>
            {currentUser?.email === event.owner.email && (
              <IconButton
                onClick={handleDelete}
                variant="soft"
                color="red"
                size="2"
                disabled={isDeleting}
                title={isDeleting ? "Eliminando..." : "Eliminar evento"}
              >
                {isDeleting ? (
                  <Spinner size="1" />
                ) : (
                  <TrashIcon width="16" height="16" />
                )}
              </IconButton>
            )}
            <CopyLinkButton eventId={event.id} />
          </Flex>
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
                  placeholder="amigo1@mail.com, amigo2@mail.com"
                />
                <Text size="1" color="gray" as="div" mt="1">
                  Separa los emails con comas. Los nombres se pueden agregar
                  después.
                </Text>
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
                  Miembros: {event.members?.length || 0}
                </Text>
              </Flex>
              {event.members && event.members.length > 0 && (
                <Flex direction="column" gap="1">
                  <Text size="1" color="gray" weight="medium">
                    Participantes:
                  </Text>
                  {event.members.map((member, index) => (
                    <Text key={index} size="1" color="gray">
                      • {member.name || member.email}
                      {member.isRegistered && " (Registrado)"}
                    </Text>
                  ))}
                </Flex>
              )}
              <Text size="1" color="gray">
                ID: {event.id}
              </Text>
            </Flex>
          )}
        </Card>

        <Tabs.Root defaultValue="members">
          <Tabs.List>
            <Tabs.Trigger value="members">Miembros</Tabs.Trigger>
            <Tabs.Trigger value="expenses">Gastos</Tabs.Trigger>
            <Tabs.Trigger value="balance">Balance</Tabs.Trigger>
            <Tabs.Trigger value="payments">Pagos</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="members">
            <MemberManager
              members={event.members || []}
              onMembersChange={(newMembers) => {
                updateEventMutate({
                  eventId: event.id,
                  members: newMembers,
                });
              }}
              currentUserEmail={currentUser?.email || undefined}
              currentUser={currentUser}
              isCreatingEvent={false}
            />
          </Tabs.Content>

          <Tabs.Content value="expenses">
            <Flex direction="column" gap="4">
              <Heading size="4">Agregar Nuevo Gasto</Heading>
              <ExpenseForm eventId={eventId} members={event.members || []} />

              <ExpensesList
                eventId={eventId}
                members={event.members || []}
                currentUserEmail={currentUser?.email || undefined}
              />
            </Flex>
          </Tabs.Content>

          <Tabs.Content value="balance">
            <EventBalance eventId={eventId} members={event.members || []} />
          </Tabs.Content>

          <Tabs.Content value="payments">
            <PaymentManager eventId={eventId} members={event.members || []} />
          </Tabs.Content>
        </Tabs.Root>
      </Flex>
    </Card>
  );
};

export default EventDetail;
