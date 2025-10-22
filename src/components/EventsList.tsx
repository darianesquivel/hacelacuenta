import { useState } from "react";
import {
  Card,
  Heading,
  Text,
  Button,
  Flex,
  Spinner,
  Dialog,
  Link,
} from "@radix-ui/themes";
import { useUserEvents } from "../hooks/useEvents";
import { useAuthStatus } from "../hooks/useAuthStatus";
import EventForm from "./EventForm";
import EventDetail from "./EventDetail";

const EventsList = () => {
  const { currentUser } = useAuthStatus();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const {
    data: events,
    isLoading: isLoadingEvents,
    isError,
  } = useUserEvents(currentUser?.email);

  if (selectedEventId) {
    return (
      <EventDetail
        eventId={selectedEventId}
        onBack={() => setSelectedEventId(null)}
      />
    );
  }

  if (!currentUser) {
    return (
      <Card className="mt-8 p-6 text-center">
        <Text size="3">Debes iniciar sesión para ver tus eventos.</Text>
      </Card>
    );
  }

  if (isLoadingEvents) {
    return (
      <Card className="mt-8 p-6 text-center">
        <Spinner />
        <Text size="3" className="mt-2 block">
          Cargando tus eventos...
        </Text>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="mt-8 p-6 text-center text-red-500">
        <Text size="3">Ocurrió un error al cargar los eventos.</Text>
      </Card>
    );
  }

  return (
    <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Card className="mt-8 p-6">
        <Flex justify="between" align="center" mb="4">
          <Heading size="5">Tus Eventos</Heading>
          <Dialog.Trigger>
            <Button color="indigo" variant="solid">
              Nuevo Evento
            </Button>
          </Dialog.Trigger>
        </Flex>
        {!events || events.length === 0 ? (
          <Text size="3" color="gray">
            Aún no tenés eventos creados.
          </Text>
        ) : (
          <Flex direction="column" gap="3">
            {events.map((event) => (
              <Card
                key={event.id}
                variant="surface"
                asChild
                style={{ cursor: "pointer" }}
              >
                <Link
                  onClick={() => setSelectedEventId(event.id)}
                  style={{ textDecoration: "none" }}
                >
                  <Flex direction="column" gap="1">
                    <Text size="4" weight="medium" color="indigo">
                      {event.name}
                    </Text>
                    <Text size="2" color="gray">
                      {event.description || "Sin descripción"}
                    </Text>
                  </Flex>
                </Link>
              </Card>
            ))}
          </Flex>
        )}
      </Card>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title> Crear Nuevo Evento </Dialog.Title>
        <Dialog.Description> Completa los datos del evento </Dialog.Description>
        <EventForm onClose={() => setIsModalOpen(false)} />
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default EventsList;
