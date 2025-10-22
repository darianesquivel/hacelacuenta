import React from "react";
import { Card, Text, Button, Flex, Heading } from "@radix-ui/themes";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error capturado por ErrorBoundary:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            resetError={this.resetError}
          />
        );
      }

      return (
        <Card className="mt-8 p-6 text-center">
          <Flex direction="column" gap="4" align="center">
            <Heading size="5" color="red">
              ¡Oops! Algo salió mal
            </Heading>
            <Text size="3" color="gray">
              Ha ocurrido un error inesperado. Por favor, intenta recargar la
              página.
            </Text>
            <Flex gap="3">
              <Button
                variant="soft"
                color="gray"
                onClick={() => window.location.reload()}
              >
                Recargar página
              </Button>
              <Button color="indigo" onClick={this.resetError}>
                Intentar de nuevo
              </Button>
            </Flex>
            {import.meta.env.DEV && this.state.error && (
              <Card variant="surface" className="p-4 mt-4">
                <Text size="1" color="red" weight="medium">
                  Error de desarrollo:
                </Text>
                <Text size="1" color="gray" className="mt-1 block">
                  {this.state.error.message}
                </Text>
              </Card>
            )}
          </Flex>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
