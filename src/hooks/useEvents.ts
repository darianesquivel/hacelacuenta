import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEvent,
  getUserEvents,
  getEventById,
  updateEvent,
  type NewEventData,
  type Event,
} from "../api/data";
import { useAuthStore } from "../store/authStore";

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const { currentUser } = useAuthStore();

  const mutation = useMutation({
    mutationFn: async (data: Omit<NewEventData, "owner">) => {
      if (!currentUser) {
        throw new Error("Se requiere autenticación para crear un Evento.");
      }
      return createEvent({
        ...data,
        owner: currentUser,
      });
    },
    onSuccess: (eventId) => {
      if (currentUser?.uid) {
        queryClient.invalidateQueries({
          queryKey: ["events", currentUser.uid],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["events"] });

      console.log(`¡Evento creado exitosamente con ID: ${eventId}!`);
    },
    onError: (error) => {
      console.error("Error al crear el Evento:", error);
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: Partial<Omit<Event, "owner" | "createdAt" | "id">> & {
        eventId: string;
      }
    ) => updateEvent(data),
    onSuccess: (updatedEvent) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", updatedEvent.id] });
      console.log(`Evento ${updatedEvent.id} actualizado.`);
    },
  });
}

export function useUserEvents(email: string | null | undefined) {
  return useQuery({
    queryKey: ["events", email],
    queryFn: () => getUserEvents(email!),
    enabled: !!email,
  });
}

export function useEventDetails(eventId: string | null) {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById(eventId!),
    enabled: !!eventId,
  });
}
