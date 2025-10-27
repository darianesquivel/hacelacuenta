import { useState } from "react";
import { Button, Dialog } from "@radix-ui/themes";
import AddMemberForm from "./AddMemberForm";
import { PlusIcon } from "lucide-react";
import type { EventMember } from "../api/data";

interface AddMemberProps {
  onMemberAdded: (member: EventMember) => void;
  existingMembers: EventMember[];
}

const AddMember = ({ onMemberAdded, existingMembers }: AddMemberProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMemberAdded = (member: EventMember) => {
    onMemberAdded(member);
    setIsModalOpen(false);
  };

  return (
    <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Dialog.Trigger>
        <Button variant="solid" color="blue">
          <PlusIcon /> Agregar miembro
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Nuevo Miembro</Dialog.Title>
        <Dialog.Description>
          Agrega un nuevo miembro al evento
        </Dialog.Description>
        <AddMemberForm
          onMemberAdded={handleMemberAdded}
          existingMembers={existingMembers}
          onClose={() => setIsModalOpen(false)}
        />
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default AddMember;
