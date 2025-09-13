import { create } from "zustand";

export type Contact = {
  id: string;           // contact entry id
  user_id: string;      // owner (the logged-in user)
  contact_user_id: string; // the other person
  saved_name: string;   // nickname saved by the user
  email?: string;       // optional: include for quick lookups
};

type ContactsState = {
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
  addContact: (contact: Contact) => void;
  updateContact: (contactId: string, saved_name: string) => void;
  removeContact: (contactId: string) => void;
};

export const useContactsStore = create<ContactsState>((set) => ({
  contacts: [],
  setContacts: (contacts) => set({ contacts }),
  addContact: (contact) =>
    set((state) => ({ contacts: [...state.contacts, contact] })),
  updateContact: (contactId, saved_name) =>
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === contactId ? { ...c, saved_name } : c
      ),
    })),
  removeContact: (contactId) =>
    set((state) => ({
      contacts: state.contacts.filter((c) => c.id !== contactId),
    })),
}));
