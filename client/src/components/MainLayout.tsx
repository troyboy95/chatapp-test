import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import ListComponent from "./ListComponent"
import ChatComponent from "./ChatViewComponent"
import { Separator } from "./ui/separator"
import { fetchWithAuth } from "@/api/client"
import { useContactsStore } from "@/store/contactStore"
import { useConversationsStore } from "@/store/conversationStore"
import { useEffect, useState } from "react"
import { Contact, MessageCircle } from "lucide-react"

const MainLayout = () => {

    // const { selectedChat } = useChatLayoutStore()
    const { contacts, setContacts } = useContactsStore();
    const { conversations, setConversations } = useConversationsStore();

    const [index, setIndex] = useState(0)

    const items: any = [
        { title: 'Chats', icon: MessageCircle },
        { title: 'Contacts', icon: Contact },
    ]


    async function handleFetchComplete() {
        try {
            const [contacts, conversations] = await Promise.all([
                fetchWithAuth("/contacts"),
                fetchWithAuth("/conversations"),
            ]);
            setContacts(contacts);
            setConversations(conversations);
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        handleFetchComplete();

    }, [setContacts, setConversations]);

    return (

        <SidebarProvider className="space-x-1">
            <AppSidebar items={items} index={index} setIndex={setIndex} />
            <main className="w-full flex min-w-[70rem]">

                <ListComponent items={index === 0 ? conversations : contacts} listType={index === 0 ? "chats" : "contacts"} className="flex-1 w-1/3" />
                <Separator orientation="vertical" className="h-full" />
                <ChatComponent className="flex-1 flex flex-col w-2/3" />

            </main>
        </SidebarProvider>


    )
}

export default MainLayout