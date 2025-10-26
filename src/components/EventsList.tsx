import { Flex, Spinner } from "@radix-ui/themes";
import { useUserEvents } from "../hooks/useEvents";
import { useAuthStatus } from "../hooks/useAuthStatus";
import EventCard from "./ui/EventCard";
import { Badge } from "@radix-ui/themes";

interface EventsListProps {
  onEventClick: (eventId: string) => void;
}

const EventsList = ({ onEventClick }: EventsListProps) => {
  const { currentUser } = useAuthStatus();

  const {
    data: events,
    isLoading: isLoadingEvents,
    isError,
  } = useUserEvents(currentUser?.email);

  if (isLoadingEvents) {
    return (
      <Flex justify="center" align="center">
        <Badge radius="full" size="3" color="blue">
          <Spinner /> Cargando tus eventos...
        </Badge>
      </Flex>
    );
  }

  if (isError) {
    return (
      <Flex justify="center" align="center">
        <Badge radius="full" size="3" color="red">
          Ocurrió un error al cargar los eventos.
        </Badge>
      </Flex>
    );
  }

  return (
    <>
      {!events || events.length < 1 ? (
        <Flex width="100%" align="center" justify="center">
          <Badge radius="full" size="3" color="red">
            No tenés eventos creados.
          </Badge>
        </Flex>
      ) : (
        <Flex gap="3" width="100%" wrap="wrap">
          {events.map((event) => (
            <EventCard key={event.id} event={event} onClick={onEventClick} />
          ))}
        </Flex>
      )}
    </>
  );
};

export default EventsList;
