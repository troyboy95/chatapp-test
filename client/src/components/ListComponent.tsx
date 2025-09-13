import React, { useEffect, useState } from 'react'
import { Separator } from './ui/separator';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import ChatDisplay from './ChatDisplay';
import { useConversationsStore } from '@/store/conversationStore';
import { fetchWithAuth, openChat } from '@/api/client';
import { useChatStore } from '@/store/chatStore';
import { Input } from './ui/input';
import { useContactsStore } from '@/store/contactStore';
import { initSocket, socket } from '@/api/socket';

interface ListComponentProps {
  items: any[];
  listType?: 'chats' | 'contacts';
  className?: string;
}

const ListComponent = ({ items, listType, className }: ListComponentProps) => {

  const [searchedItem, setSearchedItem] = useState("")
  const { contacts } = useContactsStore()
  const { setMessages } = useChatStore()
  // const {  } = useConversationsStore()

  const displayItems =
    listType === 'chats' &&
    items.map((conv) => {
      const other = conv.other_participants?.[0]; // may be undefined
      if (!other) {
        // fallback: no other participant found (maybe group chat or bad data)
        return {
          ...conv,
          displayName: "(unknown)",
        };
      }

      const contact = contacts.find((c) => c.id === other.id);

      return {
        ...conv,
        displayName: contact?.saved_name || other.display_name || "(no name)",
      };
    })

  const filteredItems = items.filter(item => {
    if (listType === 'chats') {
      // Apply chat-specific filtering logic
      // return displayItems
      
    } else if (listType === 'contacts') {
      if (searchedItem.length > 0)
        return item.saved_name.toLowerCase().includes(searchedItem.toLowerCase());
    }
    return true
  });

  const handleClick = async (id: string, conId?: string) => {
    if (listType === 'contacts') {
      openChat(id)
    } else {
      const res = await fetchWithAuth(`/conversations/${id}/messages`)
      // console.log(res)
      initSocket()
      socket.emit("join:conversation", id)
      setMessages(res)
      openChat(conId!)
      // setActiveChat(id, conId!)
      // console.log(res)
    }
  }

  const iterableItems = listType !== 'chats' ? filteredItems : displayItems
  // console.log(iterableItems)

  return (
    <div className={`p-2 ${className}`}>
      <div className="p-2 border-b border-gray-300">
        <h2 className="text-xl font-semibold capitalize">{listType}</h2>
      </div>
      <Input
        value={searchedItem}
        onChange={(e) => setSearchedItem(e.target.value)}
        className='my-3'
        placeholder={`Search your ${listType}`}
      />
      <ScrollArea className={`flex-1 rounded-md border my-2`}>
        {(iterableItems.length > 0 ) ? iterableItems.map((item, index) => (
          <div key={index}
            className="p-2"
            onClick={() => handleClick(item.id, listType === 'chats' && item.other_participants[0].id)}
          >
            <ChatDisplay
              name={ listType === 'contacts' ? item.saved_name : item.displayName }
            // lastMessage={"test message"}
            // timestamp={"9 pm"}
            />
            {
              index < items.length - 1 &&
              <Separator className="my-2" />
            }
          </div>
        ))
          : <span className='p-5'>No matching {listType} found</span>
        }
       
      </ScrollArea>
    </div>
  )
}

export default ListComponent