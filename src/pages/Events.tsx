import { useState } from "react";
import { Flex } from "@radix-ui/themes";
import EventsList from "@/components/EventsList";
import EventDetail from "@/components/EventDetail";
import EventsHeader from "@/components/EventsHeader";

const Events = () => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const handleBackToList = () => {
    setSelectedEventId(null);
  };

  // Si hay un evento seleccionado, mostrar solo el detalle
  if (selectedEventId) {
    return <EventDetail eventId={selectedEventId} onBack={handleBackToList} />;
  }

  // Si no hay evento seleccionado, mostrar la lista
  return (
    <Flex direction="column" gap="4" width="100%">
      <EventsHeader />
      <EventsList onEventClick={handleEventClick} />
    </Flex>
  );
};

export default Events;
