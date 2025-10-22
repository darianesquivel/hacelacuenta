import React, { useState } from "react";
import {
  Card,
  Text,
  TextField,
  Button,
  Flex,
  IconButton,
  Callout,
} from "@radix-ui/themes";
import { PlusIcon, Cross2Icon } from "@radix-ui/react-icons";
import { EventMember } from "../api/data";
import { checkIfUserIsRegistered } from "../api/auth";

interface MemberManagerProps {
  members: EventMember[];
  onMembersChange: (members: EventMember[]) => void;
  currentUserEmail?: string;
  currentUser?: any;
  isCreatingEvent?: boolean;
}

const MemberManager = ({
  members,
  onMembersChange,
  currentUserEmail,
  currentUser,
  isCreatingEvent = false,
}: MemberManagerProps) => {
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Agregar automáticamente al creador si no está presente (solo en creación de evento)
  React.useEffect(() => {
    if (
      isCreatingEvent &&
      currentUser &&
      currentUser.email &&
      members.length === 0
    ) {
      // Verificar si ya existe el owner en los miembros
      const ownerExists = members.some(
        (member) =>
          member.email === currentUser.email ||
          member.id === `owner-${currentUser.uid}`
      );

      if (!ownerExists) {
        const ownerMember: EventMember = {
          id: `owner-${currentUser.uid}`,
          name: currentUser.displayName || currentUser.email,
          email: currentUser.email,
          isRegistered: true,
        };
        onMembersChange([ownerMember]);
      }
    }
  }, [isCreatingEvent, currentUser]); // Solo se ejecuta cuando cambia isCreatingEvent o currentUser

  const addMember = async () => {
    setError(null);
    setIsAdding(true);

    try {
      if (!newMemberName.trim()) {
        setError("El nombre es obligatorio");
        return;
      }

      // Verificar si ya existe un miembro con ese nombre
      if (
        members.some(
          (m) => m.name.toLowerCase() === newMemberName.toLowerCase()
        )
      ) {
        setError("Ya existe un miembro con ese nombre");
        return;
      }

      // Verificar si ya existe un miembro con ese email (si se proporciona)
      if (newMemberEmail && members.some((m) => m.email === newMemberEmail)) {
        setError("Ya existe un miembro con ese email");
        return;
      }

      // Verificar si el usuario está registrado en Firebase (si se proporciona email)
      let isRegistered = false;
      if (newMemberEmail) {
        try {
          isRegistered = await checkIfUserIsRegistered(newMemberEmail);
        } catch (error) {
          console.error("Error verificando usuario:", error);
          // Continuar con isRegistered = false
        }
      }

      const newMember: EventMember = {
        id: Date.now().toString(),
        name: newMemberName.trim(),
        email: newMemberEmail.trim() || undefined,
        isRegistered,
      };

      console.log("Agregando miembro:", newMember);
      console.log("Miembros actuales:", members);
      console.log("Nuevos miembros:", [...members, newMember]);

      onMembersChange([...members, newMember]);
      setNewMemberName("");
      setNewMemberEmail("");
    } finally {
      setIsAdding(false);
    }
  };

  const removeMember = (memberId: string) => {
    onMembersChange(members.filter((m) => m.id !== memberId));
  };

  return (
    <Card variant="surface" className="p-4">
      <Text size="3" weight="medium" mb="3">
        Gestionar Miembros
      </Text>

      {error && (
        <Callout.Root color="red" size="1" mb="3">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      {/* Formulario para agregar miembro */}
      <Flex direction="column" gap="3" mb="4">
        <Flex gap="2" align="end">
          <Flex direction="column" gap="1" style={{ flex: 1 }}>
            <Text size="2" weight="medium">
              Nombre *
            </Text>
            <TextField.Root
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="Ej: Juan Pérez"
            />
          </Flex>
          <Flex direction="column" gap="1" style={{ flex: 1 }}>
            <Text size="2" weight="medium">
              Email (opcional)
            </Text>
            <TextField.Root
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="juan@email.com"
              type="email"
            />
          </Flex>
          <Button onClick={addMember} color="green" disabled={isAdding}>
            <PlusIcon width="16" height="16" />
            {isAdding ? "Verificando..." : "Agregar"}
          </Button>
        </Flex>
        <Text size="1" color="gray">
          Si agregas un email, la persona podrá ver el evento desde su cuenta.
        </Text>
      </Flex>

      {/* Lista de miembros */}
      <Flex direction="column" gap="2">
        <Text size="2" weight="medium">
          Miembros actuales ({members.length}):
        </Text>
        {members.map((member) => (
          <Card key={member.id} variant="surface" className="p-3">
            <Flex justify="between" align="center">
              <Flex direction="column" gap="1">
                <Text weight="medium">
                  {member.name}
                  {member.email && member.email === currentUserEmail && " (Tú)"}
                </Text>
                {member.email && (
                  <Text size="1" color="gray">
                    {member.email}
                  </Text>
                )}
                <Text size="1" color={member.isRegistered ? "green" : "gray"}>
                  {member.isRegistered ? "Registrado" : "Invitado"}
                </Text>
              </Flex>
              {!(member.email && member.email === currentUserEmail) && (
                <IconButton
                  variant="soft"
                  color="red"
                  size="1"
                  onClick={() => removeMember(member.id)}
                >
                  <Cross2Icon width="12" height="12" />
                </IconButton>
              )}
            </Flex>
          </Card>
        ))}
      </Flex>
    </Card>
  );
};

export default MemberManager;
