import { Card, Text, Flex } from "@radix-ui/themes";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export const EmptyState = ({ title, description, icon }: EmptyStateProps) => {
  return (
    <Card variant="surface" className="p-6">
      <Flex direction="column" gap="3" align="center">
        {icon && (
          <Flex
            align="center"
            justify="center"
            className="text-4xl text-gray-400"
          >
            {icon}
          </Flex>
        )}
        <Text size="3" weight="medium" color="gray">
          {title}
        </Text>
        {description && (
          <Text size="2" color="gray">
            {description}
          </Text>
        )}
      </Flex>
    </Card>
  );
};
