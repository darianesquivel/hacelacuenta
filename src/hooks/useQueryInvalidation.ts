import { useQueryClient } from "@tanstack/react-query";

export const useQueryInvalidation = () => {
  const queryClient = useQueryClient();

  const invalidateEventQueries = (eventId: string) => {
    queryClient.invalidateQueries({ queryKey: ["events"] });
    queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    queryClient.invalidateQueries({ queryKey: ["expenses", eventId] });
    queryClient.invalidateQueries({ queryKey: ["eventBalance", eventId] });
    queryClient.invalidateQueries({ queryKey: ["payments", eventId] });
  };

  const invalidateExpenseQueries = (eventId: string) => {
    queryClient.invalidateQueries({ queryKey: ["expenses", eventId] });
    queryClient.invalidateQueries({ queryKey: ["eventBalance", eventId] });
  };

  const invalidatePaymentQueries = (eventId: string) => {
    queryClient.invalidateQueries({ queryKey: ["payments", eventId] });
    queryClient.invalidateQueries({ queryKey: ["eventBalance", eventId] });
  };

  const invalidateAllEvents = () => {
    queryClient.invalidateQueries({ queryKey: ["events"] });
  };

  return {
    invalidateEventQueries,
    invalidateExpenseQueries,
    invalidatePaymentQueries,
    invalidateAllEvents,
  };
};
