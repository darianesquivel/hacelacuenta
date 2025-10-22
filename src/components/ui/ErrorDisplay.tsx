import { Callout, Button, Flex } from "@radix-ui/themes";

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorDisplay = ({
  message,
  onRetry,
  retryText = "Reintentar",
}: ErrorDisplayProps) => {
  return (
    <Callout.Root color="red" size="1">
      <Callout.Text>{message}</Callout.Text>
      {onRetry && (
        <Flex justify="end" mt="2">
          <Button size="1" variant="soft" color="red" onClick={onRetry}>
            {retryText}
          </Button>
        </Flex>
      )}
    </Callout.Root>
  );
};
