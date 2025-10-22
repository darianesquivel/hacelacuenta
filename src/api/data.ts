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

  // Agregar el owner como miembro si no está ya incluido
  const membersSet = new Set<string>();
  data.members?.forEach((member) => {
    if (member.email) membersSet.add(member.email);
  });

  // Agregar el owner como miembro si no está ya incluido
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

    // Solo agregar email si existe, sino no incluir el campo
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

  console.log("updateEvent - Datos recibidos:", data);
  console.log("updateEvent - eventId:", eventId);
  console.log("updateEvent - updateData:", updateData);

  if (updateData.members) {
    console.log(
      "updateEvent - Miembros antes del procesamiento:",
      updateData.members
    );
    // No filtrar miembros, mantener todos los miembros (con o sin email)
    updateData.members = updateData.members.map((member) => {
      const processedMember: any = {
        id: member.id,
        name: member.name,
        isRegistered: member.isRegistered || false,
      };

      // Solo agregar email si existe, sino no incluir el campo
      if (member.email) {
        processedMember.email = member.email;
      }

      return processedMember;
    });
    console.log(
      "updateEvent - Miembros después del procesamiento:",
      updateData.members
    );
  }

  console.log("updateEvent - Datos finales a guardar:", updateData);
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

  // Para miembros, necesitamos obtener todos los eventos y filtrar
  // ya que Firestore no soporta consultas complejas en arrays de objetos
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

  // Procesar eventos del owner
  ownerSnapshot.docs.forEach(processDoc);

  // Procesar eventos donde el usuario es miembro
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

  console.log("Actualizando gasto:", {
    expenseId,
    updates,
    eventId: targetEventId,
  });

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
  console.log("Eliminando gasto:", { expenseId, eventId });

  await deleteDoc(expenseRef);
}

export async function deleteEvent(eventId: string): Promise<void> {
  console.log("Eliminando evento:", { eventId });

  // Primero eliminar todos los gastos del evento
  const expensesSnapshot = await getDocs(
    collection(db, "events", eventId, "expenses")
  );

  const deleteExpensesPromises = expensesSnapshot.docs.map((expenseDoc) =>
    deleteDoc(expenseDoc.ref)
  );

  await Promise.all(deleteExpensesPromises);
  console.log(`Eliminados ${expensesSnapshot.docs.length} gastos del evento`);

  // Luego eliminar el evento
  const eventRef = doc(db, "events", eventId);
  await deleteDoc(eventRef);

  console.log("Evento eliminado exitosamente");
}
