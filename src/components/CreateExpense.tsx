import { useState } from "react";
import { Button, Flex, Dialog } from "@radix-ui/themes";
import ExpenseForm from "./ExpenseForm";
import { PlusIcon } from "lucide-react";
import type { EventMember } from "../api/data";

interface CreateExpenseProps {
  eventId: string;
  members: EventMember[];
}

const CreateExpense = ({ eventId, members }: CreateExpenseProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Dialog.Trigger>
        <Button variant="solid" color="green">
          <PlusIcon /> Agregar gasto
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Nuevo Gasto</Dialog.Title>
        <Dialog.Description>
          Registra un nuevo gasto para este evento
        </Dialog.Description>
        <ExpenseForm
          eventId={eventId}
          members={members}
          onClose={() => setIsModalOpen(false)}
        />
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default CreateExpense;
