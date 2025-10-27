import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getEventById } from "../api/data";
import { useAuthStatus } from "../hooks/useAuthStatus";
import { Button, Flex } from "@radix-ui/themes";
import EventDetail from "./EventDetail";
import LoadingState from "./ui/LoadingState";
import ErrorState from "./ui/ErrorState";

const EventDetailRouteWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuthStatus();
  const navigate = useNavigate();

  const {
    data: event,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["event", id],
    queryFn: () => getEventById(id!),
    enabled: !!id,
  });

  const handleBack = () => {
    navigate("/");
  };

  if (!id) {
    return (
      <ErrorState message="Error: ID de evento no encontrado en la URL." />
    );
  }

  if (isLoading) {
    return <LoadingState message="Cargando evento..." />;
  }

  if (isError || !event) {
    return (
      <Flex direction="column" gap="1" align="center">
        <ErrorState message="No se pudo cargar el evento o no tienes permisos para verlo." />
        <Button onClick={handleBack} mt="3" variant="soft">
          Volver
        </Button>
      </Flex>
    );
  }

  const hasAccess =
    currentUser &&
    event &&
    (event.owner.email === currentUser.email ||
      event.members?.some((member) => member.email === currentUser.email));

  if (!hasAccess) {
    return (
      <Flex direction="column" gap="1" align="center">
        <ErrorState message="Solo los miembros del evento pueden acceder." />
        <Button onClick={handleBack} mt="3" variant="soft">
          Volver
        </Button>
      </Flex>
    );
  }

  return <EventDetail eventId={id} />;
};

export default EventDetailRouteWrapper;
