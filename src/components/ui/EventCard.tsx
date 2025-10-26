import { Card, Text, Flex } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import type { Event as EventType } from "@/api/data";

interface EventCardProps {
  event: EventType;
}

const EventCard = ({ event }: EventCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/events/${event.id}`);
  };

  return (
    <Card
      key={event.id}
      style={{ cursor: "pointer" }}
      onClick={handleClick}
      className="w-full max-w-md"
    >
      <Flex direction="column" gap="1">
        <Text size="4" weight="medium" color="indigo">
          {event.name}
        </Text>
        <Text size="2" color="gray">
          {event.description || "Sin descripción"}
        </Text>
      </Flex>
    </Card>
  );
};

export default EventCard;
