import { useChatStore } from '@/store/chatStore';
import { useEffect, useRef } from 'react'
import WhatsappInput from './InputComponent';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useContactsStore } from '@/store/contactStore';
import useAuthStore from '@/store/authStore';
import { useConversationsStore } from '@/store/conversationStore';
import { groupMessagesByDate } from '@/lib/groupMessages';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Plus, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ChatComponentProps {
  // Define any props if needed
  className?: string;
  displayName?: string
}

const ChatComponent = ({ className }: ChatComponentProps) => {

  const { activeContactId, activeConversationId } = useChatStore()
  const { contacts } = useContactsStore()
  const { messages } = useChatStore()
  const { user } = useAuthStore()
  const { conversations } = useConversationsStore()

  const sortedMessages = messages.sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  console.log(sortedMessages)
  // const groupedMessages = groupMessagesByDate(sortedMessages)

  // let messagesByUser = sortedMessages.filter((m) => m.sender_id === user?.id)
  // let messagesByReceiver = sortedMessages.filter((m) => m.sender_id !== user?.id)

  const activeContact = contacts.filter((c) => c.id === activeContactId)

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }

  }, [sortedMessages]);

  if (activeConversationId === null && activeContactId === null) {
    return (
      <div className='flex-1 flex p-2 text-gray-600'>
        <h2 className='text-center m-auto'>Tap on a Chat/Contact to start a chat</h2>
      </div>
    )
  }


  const userDisplayData = conversations.find((c) => c.id === activeConversationId)



  console.log(userDisplayData)

  return (
    <div className={`p-2 h-full ${className}`}>
      <div className='bg-gray-700 h-16 shadow-md shadow-gray-600 rounded-lg flex flex-row items-center py-1 px-2 w-full space-x-4'>
        {<Avatar>
          <AvatarFallback className='text-lg'>{activeContact.length === 0 ? userDisplayData!.other_participants[0].display_name.charAt(0).toUpperCase() : activeContact[0].saved_name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>}
        <div className="flex flex-col justify-center flex-1">
          <h2 className="capitalize text-lg">{activeContact.length === 0 ? userDisplayData!.other_participants[0].display_name : activeContact && activeContact[0].saved_name}</h2>
          {/* <p className="text-gray-400 text-sm">{lastMessage}</p> */}
        </div>
        {
          activeContact.length === 0 &&
          <Link to={`/add/${userDisplayData.other_participants[0].id}`} >
          <Button className='text-white rounded-full'>
            <Plus />
          </Button>
          </Link>
        }
      </div>
      {
        (activeConversationId === null && activeContactId !== null) &&
        <div className="flex-1 text-center p-2 justify-center text-gray-500 mb-auto">
          Start a new chat...
        </div>
      }

      <section className="flex flex-1 flex-col my-2">
        <ScrollArea className="max-h-[500px]">
          <div className="flex flex-col">
            {sortedMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex min-w-10 bg-purple-900 py-2 px-4 my-1 rounded-xl ${msg.sender_id === user?.id
                  ? "justify-end ms-auto"
                  : "justify-start w-fit"
                  }`}
              >
                {msg.content}
                {/* <span className="text-xs mb-auto">
                  {new Date(msg.created_at).getTime()}
                </span> */}
              </div>
            ))}

            <div ref={scrollRef} />
          </div>
        </ScrollArea>

      </section>

      <WhatsappInput />
    </div>
  )
}

export default ChatComponent