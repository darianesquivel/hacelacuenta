import { Card, Text, Flex, IconButton } from "@radix-ui/themes";
import { Cross2Icon } from "@radix-ui/react-icons";
import type { EventMember } from "../api/data";
import { useToast } from "../hooks/useToast";

interface MembersListProps {
  members: EventMember[];
  onMemberRemoved: (memberId: string) => void;
  currentUserEmail?: string;
}

const MembersList = ({
  members,
  onMemberRemoved,
  currentUserEmail,
}: MembersListProps) => {
  const { showSuccess } = useToast();

  const removeMember = (memberId: string) => {
    const memberToRemove = members.find((m) => m.id === memberId);
    onMemberRemoved(memberId);
    if (memberToRemove) {
      showSuccess(`Miembro "${memberToRemove.name}" eliminado exitosamente`);
    }
  };

  return (
    <Flex direction="column" gap="2">
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
            </Flex>
            {!(member.email && member.email === currentUserEmail) && (
              <IconButton
                variant="soft"
                color="red"
                size="1"
                onClick={() => removeMember(member.id)}
                type="button"
              >
                <Cross2Icon width="12" height="12" />
              </IconButton>
            )}
          </Flex>
        </Card>
      ))}
    </Flex>
  );
};

export default MembersList;
