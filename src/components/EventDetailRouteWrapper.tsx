import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getEventById } from "../api/data";
import { useAuthStatus } from "../hooks/useAuthStatus";
import { Card, Text, Spinner, Button } from "@radix-ui/themes";
import EventDetail from "./EventDetail";

const EventDetailRouteWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuthStatus();

  const {
    data: event,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["event", id],
    queryFn: () => getEventById(id!),
    enabled: !!id,
  });

  if (!id) {
    return (
      <Card className="mt-8 p-6 text-center text-red-500">
        <Text size="3">Error: ID de evento no encontrado en la URL.</Text>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="mt-8 p-6 text-center">
        <Spinner />
        <Text size="3" className="mt-2 block">
          Cargando evento...
        </Text>
      </Card>
    );
  }

  if (isError || !event) {
    return (
      <Card className="mt-8 p-6 text-center text-red-500">
        <Text size="3">
          No se pudo cargar el evento o no tienes permisos para verlo.
        </Text>
        <Button onClick={() => window.history.back()} mt="3" variant="soft">
          Volver
        </Button>
      </Card>
    );
  }

  const hasAccess =
    currentUser &&
    event &&
    (event.owner.email === currentUser.email ||
      event.members?.some((member) => member.email === currentUser.email));

  if (!hasAccess) {
    return (
      <Card className="mt-8 p-6 text-center text-red-500">
        <Text size="3">No tienes permisos para ver este evento.</Text>
        <Text size="2" color="gray" className="mt-2 block">
          Solo los miembros del evento pueden acceder.
        </Text>
        <Button onClick={() => window.history.back()} mt="3" variant="soft">
          Volver
        </Button>
      </Card>
    );
  }

  return <EventDetail eventId={id} onBack={() => window.history.back()} />;
};

export default EventDetailRouteWrapper;
