import { Flex, Badge } from "@radix-ui/themes";

interface ErrorStateProps {
  message: string;
}

const ErrorState = ({ message }: ErrorStateProps) => {
  return (
    <Flex justify="center" align="center">
      <Badge radius="full" size="3" color="red">
        {message}
      </Badge>
    </Flex>
  );
};

export default ErrorState;
