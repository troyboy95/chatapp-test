import { fetchWithAuth } from "./client";
import {useContactsStore } from "@/store/contactStore"

export const addContact = async (id: string, name: string) => {
    try {
        const res = fetchWithAuth('/contacts',{
            method: "POST",
            headers: {"content-type" : "application/json"},
            body: JSON.stringify({
                contact_id: id,
                saved_name: name
            })
        })
        useContactsStore().addContact(res as any)
        
    } catch (error) {
        
    }
}