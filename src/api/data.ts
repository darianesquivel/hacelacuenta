import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  serverTimestamp,
  orderBy,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { app } from "../firebase/firebase";
import { type User } from "firebase/auth";

const db = getFirestore(app);

// TYPES

export interface UserReference {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
}

export interface EventMember {
  id: string;
  name: string;
  email?: string;
  isRegistered: boolean;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  owner: UserReference;
  members: EventMember[];
}

export interface NewEventData {
  name: string;
  description?: string;
  owner: User;
  members: EventMember[];
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  createdAt: Date;
  paidBy: UserReference;
  sharedWith: UserReference[];
  eventId: string;
}

export interface Payment {
  id: string;
  eventId: string;
  fromUser: UserReference;
  toUser: UserReference;
  amount: number;
  description?: string;
  createdAt: Date;
  status: "pending" | "completed" | "cancelled";
}

export interface PaymentSuggestion {
  fromUser: UserReference;
  toUser: UserReference;
  amount: number;
  reason: string;
}

export interface NewExpenseData {
  eventId: string;
  description: string;
  amount: number;
  paidBy: UserReference;
  sharedWith: UserReference[];
}

// EVENTS

const getEventsCollectionRef = () => collection(db, "events");

export async function createEvent(data: NewEventData) {
  if (!data.owner.uid || !data.owner.email) {
    throw new Error(
      "El usuario debe estar autenticado y tener un email para crear un evento."
    );
  }

  const ownerRef: UserReference = {
    uid: data.owner.uid,
    displayName: data.owner.displayName,
    photoURL: data.owner.photoURL,
    email: data.owner.email,
  };

  const membersSet = new Set<string>();
  data.members?.forEach((member) => {
    if (member.email) membersSet.add(member.email);
  });

  if (ownerRef.email && !membersSet.has(ownerRef.email)) {
    data.members = data.members || [];
    data.members.push({
      id: `owner-${Date.now()}`,
      name: ownerRef.displayName || ownerRef.email,
      email: ownerRef.email,
      isRegistered: true,
    });
  }

  const finalMembers = (data.members || []).map((member) => {
    const processedMember: any = {
      id: member.id,
      name: member.name,
      isRegistered: member.isRegistered || false,
    };

    if (member.email) {
      processedMember.email = member.email;
    }

    return processedMember;
  });

  const newEvent = {
    name: data.name,
    description: data.description || null,
    createdAt: serverTimestamp(),
    owner: ownerRef,
    members: finalMembers,
  };

  const docRef = await addDoc(getEventsCollectionRef(), newEvent);
  return docRef.id;
}

export async function updateEvent(
  data: Partial<Omit<Event, "owner" | "createdAt" | "id">> & { eventId: string }
): Promise<Event> {
  const { eventId, ...updateData } = data;
  const eventRef = doc(db, "events", eventId);

  if (updateData.members) {
    console.log(
      "updateEvent - Miembros antes del procesamiento:",
      updateData.members
    );
    updateData.members = updateData.members.map((member) => {
      const processedMember: any = {
        id: member.id,
        name: member.name,
        isRegistered: member.isRegistered || false,
      };

      if (member.email) {
        processedMember.email = member.email;
      }

      return processedMember;
    });
  }

  await updateDoc(eventRef, updateData as Record<string, any>);

  const updatedSnapshot = await getDoc(eventRef);
  if (!updatedSnapshot.exists()) {
    throw new Error(
      `Evento con ID ${eventId} no encontrado después de la actualización.`
    );
  }

  const eventData = updatedSnapshot.data();
  return {
    id: updatedSnapshot.id,
    ...eventData,
    createdAt: eventData?.createdAt?.toDate?.() ?? new Date(),
  } as Event;
}

export async function getUserEvents(email: string): Promise<Event[]> {
  if (!email) return [];

  const q1 = query(getEventsCollectionRef(), where("owner.email", "==", email));
  const q2 = query(getEventsCollectionRef());

  const [ownerSnapshot, memberSnapshot] = await Promise.all([
    getDocs(q1),
    getDocs(q2),
  ]);

  const eventsMap = new Map<string, Event>();

  const processDoc = (doc: any) => {
    if (!doc.exists()) return;
    const data = doc.data();
    const event: Event = {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    } as Event;
    eventsMap.set(event.id, event);
  };

  ownerSnapshot.docs.forEach(processDoc);

  memberSnapshot.docs.forEach((doc) => {
    if (!doc.exists()) return;
    const data = doc.data();
    const isMember = data.members?.some(
      (member: any) => member.email === email
    );
    if (isMember) {
      processDoc(doc);
    }
  });

  const allUserEvents = Array.from(eventsMap.values());

  allUserEvents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return allUserEvents;
}

export async function getEventById(eventId: string): Promise<Event | null> {
  const ref = doc(db, "events", eventId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  } as Event;
}

export async function deleteEvent(eventId: string): Promise<void> {
  const expensesSnapshot = await getDocs(
    collection(db, "events", eventId, "expenses")
  );

  const deleteExpensesPromises = expensesSnapshot.docs.map((expenseDoc) =>
    deleteDoc(expenseDoc.ref)
  );

  await Promise.all(deleteExpensesPromises);

  const eventRef = doc(db, "events", eventId);
  await deleteDoc(eventRef);
}

// EXPENSES

const getExpensesCollectionRef = (eventId: string) =>
  collection(db, "events", eventId, "expenses");

export async function addExpense(data: NewExpenseData) {
  if (!data.paidBy.uid) {
    throw new Error("El usuario debe estar autenticado para agregar un gasto.");
  }

  const paidByRef: UserReference = {
    uid: data.paidBy.uid,
    displayName: data.paidBy.displayName,
    photoURL: data.paidBy.photoURL,
    email: data.paidBy.email,
  };

  const newExpense: Omit<Expense, "id"> = {
    eventId: data.eventId,
    description: data.description,
    amount: data.amount,
    createdAt: serverTimestamp() as unknown as Date,
    paidBy: paidByRef,
    sharedWith: data.sharedWith,
  };

  const docRef = await addDoc(
    getExpensesCollectionRef(data.eventId),
    newExpense
  );
  return docRef.id;
}

export async function getExpenses(eventId: string): Promise<Expense[]> {
  const snapshot = await getDocs(
    query(getExpensesCollectionRef(eventId), orderBy("createdAt", "desc"))
  );

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() ?? new Date(),
  })) as Expense[];
}

export async function updateExpense(
  expenseId: string,
  updates: Partial<Expense>,
  eventId?: string
): Promise<void> {
  if (!eventId && !updates.eventId) {
    throw new Error("Se requiere eventId para actualizar el gasto");
  }

  const targetEventId = eventId || updates.eventId!;
  const expenseRef = doc(db, "events", targetEventId, "expenses", expenseId);

  await updateDoc(expenseRef, updates as Record<string, any>);
}

export async function deleteExpense(
  expenseId: string,
  eventId?: string
): Promise<void> {
  if (!eventId) {
    throw new Error("Se requiere eventId para eliminar el gasto");
  }

  const expenseRef = doc(db, "events", eventId, "expenses", expenseId);
  await deleteDoc(expenseRef);
}

// PAYMENT FUNCTIONS

export async function addPayment(data: {
  eventId: string;
  fromUser: UserReference;
  toUser: UserReference;
  amount: number;
  description?: string;
}): Promise<string> {
  const paymentRef = collection(db, "events", data.eventId, "payments");

  const newPayment: Omit<Payment, "id"> = {
    eventId: data.eventId,
    fromUser: data.fromUser,
    toUser: data.toUser,
    amount: data.amount,
    description: data.description,
    createdAt: serverTimestamp() as unknown as Date,
    status: "pending",
  };

  const docRef = await addDoc(paymentRef, newPayment);
  return docRef.id;
}

export async function updatePaymentStatus(
  eventId: string,
  paymentId: string,
  status: "completed" | "cancelled"
): Promise<void> {
  const paymentRef = doc(db, "events", eventId, "payments", paymentId);
  await updateDoc(paymentRef, { status });
}

export async function getPayments(eventId: string): Promise<Payment[]> {
  const paymentsRef = collection(db, "events", eventId, "payments");
  const snapshot = await getDocs(paymentsRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() ?? new Date(),
  })) as Payment[];
}

export function calculatePaymentSuggestions(
  balances: Array<[string, number]>,
  members: EventMember[]
): PaymentSuggestion[] {
  const suggestions: PaymentSuggestion[] = [];

  const debtors = balances.filter(([, balance]) => balance < 0);
  const creditors = balances.filter(([, balance]) => balance > 0);

  debtors.sort(([, a], [, b]) => a - b);
  creditors.sort(([, a], [, b]) => b - a);

  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const [debtorEmail, debtorBalance] = debtors[debtorIndex];
    const [creditorEmail, creditorBalance] = creditors[creditorIndex];

    const debtorMember = members.find(
      (m) => (m.email || m.name) === debtorEmail
    );
    const creditorMember = members.find(
      (m) => (m.email || m.name) === creditorEmail
    );

    if (!debtorMember || !creditorMember) {
      debtorIndex++;
      creditorIndex++;
      continue;
    }

    const paymentAmount = Math.min(Math.abs(debtorBalance), creditorBalance);

    if (paymentAmount > 0.01) {
      suggestions.push({
        fromUser: {
          uid: debtorMember.email || "guest",
          displayName: debtorMember.name,
          photoURL: null,
          email: debtorMember.email || null,
        },
        toUser: {
          uid: creditorMember.email || "guest",
          displayName: creditorMember.name,
          photoURL: null,
          email: creditorMember.email || null,
        },
        amount: paymentAmount,
        reason: `Pago para equilibrar cuentas`,
      });
    }

    debtors[debtorIndex][1] += paymentAmount;
    creditors[creditorIndex][1] -= paymentAmount;

    if (Math.abs(debtors[debtorIndex][1]) < 0.01) debtorIndex++;
    if (Math.abs(creditors[creditorIndex][1]) < 0.01) creditorIndex++;
  }

  return suggestions;
}
