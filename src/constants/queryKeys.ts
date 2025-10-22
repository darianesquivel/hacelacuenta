export const QUERY_KEYS = {
  EVENTS: "events",
  EVENT: "event",
  EXPENSES: "expenses",
  PAYMENTS: "payments",
  EVENT_BALANCE: "eventBalance",
} as const;

export const createQueryKey = {
  events: () => [QUERY_KEYS.EVENTS],
  event: (id: string) => [QUERY_KEYS.EVENT, id],
  expenses: (eventId: string) => [QUERY_KEYS.EXPENSES, eventId],
  payments: (eventId: string) => [QUERY_KEYS.PAYMENTS, eventId],
  eventBalance: (eventId: string) => [QUERY_KEYS.EVENT_BALANCE, eventId],
} as const;
