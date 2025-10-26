import { Flex } from "@radix-ui/themes";
import EventsList from "@/components/EventsList";
import EventsHeader from "@/components/EventsHeader";

const Events = () => {
  return (
    <Flex direction="column" gap="4" width="100%">
      <EventsHeader />
      <EventsList />
    </Flex>
  );
};

export default Events;
