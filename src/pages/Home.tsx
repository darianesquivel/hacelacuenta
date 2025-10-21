import EventsList from "../components/EventsList";
import { useAuthStore } from "../store/authStore";
import { Heading, Text, Separator, Flex } from "@radix-ui/themes";

const Home = () => {
  const { currentUser } = useAuthStore();

  const displayName =
    currentUser?.displayName || currentUser?.email || "Usuario";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Flex direction="column" gap="4">
        <Heading size="7">¡Bienvenido/a, {displayName.split(" ")[0]}!</Heading>

        <Text as="p" size="4" color="gray">
          Aquí verás un resumen de tus Eventos de gastos y saldos pendientes.
        </Text>
      </Flex>

      <Separator size="4" my="6" />

      <EventsList />
    </div>
  );
};

export default Home;
