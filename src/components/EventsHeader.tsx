import CreateEvent from "@/components/CreateEvent";
import { Flex, Heading, Text, Separator } from "@radix-ui/themes";

const EventsHeader = () => {
  return (
    <Flex direction="column" gap="4" width="100%">
      <Heading size="4">Eventos</Heading>
      <Separator size="4" />
      <Text size="2">Aquí puedes ver tus eventos</Text>
      <CreateEvent />
    </Flex>
  );
};

export default EventsHeader;
