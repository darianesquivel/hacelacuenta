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

export interface Event {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  owner: UserReference;
  memberEmails: string[];
}

export interface NewEventData {
  name: string;
  description?: string;
  owner: User;
  memberEmails: string[];
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

  const memberEmailsSet = new Set<string>(data.memberEmails);

  if (ownerRef.email) {
    memberEmailsSet.add(ownerRef.email);
  }

  const finalMemberEmails = Array.from(memberEmailsSet).filter(
    (email) => email && email.includes("@")
  );

  const newEvent = {
    name: data.name,
    description: data.description,
    createdAt: serverTimestamp(),
    owner: ownerRef,
    memberEmails: finalMemberEmails,
  };

  const docRef = await addDoc(getEventsCollectionRef(), newEvent);
  return docRef.id;
}

export async function updateEvent(
  data: Partial<Omit<Event, "owner" | "createdAt" | "id">> & { eventId: string }
): Promise<Event> {
  const { eventId, ...updateData } = data;
  const eventRef = doc(db, "events", eventId);

  if (updateData.memberEmails) {
    const memberEmailsSet = new Set<string>(updateData.memberEmails);

    updateData.memberEmails = Array.from(memberEmailsSet).filter(
      (email) => email && email.includes("@")
    );
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

  const q2 = query(
    getEventsCollectionRef(),
    where("memberEmails", "array-contains", email)
  );

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
  memberSnapshot.docs.forEach(processDoc);

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
