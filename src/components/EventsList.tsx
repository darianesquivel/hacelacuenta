import { Flex } from "@radix-ui/themes";
import { useUserEvents } from "../hooks/useEvents";
import { useAuthStatus } from "../hooks/useAuthStatus";
import EventCard from "./ui/EventCard";
import LoadingState from "./ui/LoadingState";
import ErrorState from "./ui/ErrorState";
import { EmptyState } from "./ui/EmptyState";

const EventsList = () => {
  const { currentUser } = useAuthStatus();

  const {
    data: events,
    isLoading: isLoadingEvents,
    isError,
  } = useUserEvents(currentUser?.email);

  if (isLoadingEvents) {
    return <LoadingState message="Cargando tus eventos..." />;
  }

  if (isError) {
    return <ErrorState message="Ocurrió un error al cargar los eventos." />;
  }

  return (
    <>
      {!events || events.length < 1 ? (
        <EmptyState message="No tenés eventos creados." />
      ) : (
        <Flex gap="3" width="100%" wrap="wrap">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </Flex>
      )}
    </>
  );
};

export default EventsList;
