import { Flex, Badge, Spinner } from "@radix-ui/themes";

interface LoadingStateProps {
  message: string;
}

const LoadingState = ({ message }: LoadingStateProps) => {
  return (
    <Flex justify="center" align="center">
      <Badge radius="full" size="3" color="blue">
        <Spinner /> {message}
      </Badge>
    </Flex>
  );
};

export default LoadingState;
