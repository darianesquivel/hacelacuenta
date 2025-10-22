import { Flex, Spinner, Text } from "@radix-ui/themes";

interface LoadingSpinnerProps {
  message?: string;
  size?: "1" | "2" | "3" | "4";
}

export const LoadingSpinner = ({
  message = "Cargando...",
  size = "3",
}: LoadingSpinnerProps) => {
  return (
    <Flex direction="column" gap="3" align="center" p="4">
      <Spinner size={size} />
      <Text size="2" color="gray">
        {message}
      </Text>
    </Flex>
  );
};
