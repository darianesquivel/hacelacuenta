import { useParams } from "react-router-dom";
import EventDetail from "./EventDetail";

const EventDetailRouteWrapper = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>Error: ID de evento no encontrado en la URL.</div>;
  }

  return <EventDetail eventId={id} onBack={() => window.history.back()} />;
};

export default EventDetailRouteWrapper;
