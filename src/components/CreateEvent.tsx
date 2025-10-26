import { useState } from "react";
import { Button, Flex, Dialog } from "@radix-ui/themes";
import EventForm from "./EventForm";
import { PlusIcon } from "lucide-react";

const CreateEvent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Flex justify="between" align="center" gap="4">
        <Dialog.Trigger>
          <Button variant="solid" color="green">
            <PlusIcon /> Crear evento
          </Button>
        </Dialog.Trigger>
      </Flex>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title> Nuevo Evento </Dialog.Title>
        <Dialog.Description> Completa los datos del evento </Dialog.Description>
        <EventForm onClose={() => setIsModalOpen(false)} />
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default CreateEvent;
