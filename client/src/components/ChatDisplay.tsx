import { Avatar, AvatarFallback } from "./ui/avatar";

interface ChatDisplayProps {
    // Define any props if needed
    name: string;
    lastMessage?: string;
    timestamp?: string;
}

const ChatDisplay = ({ name, lastMessage, timestamp }: ChatDisplayProps) => {

    return (
        <div className="flex flex-row p-1 w-full space-x-2">
            <Avatar>
                <AvatarFallback>{name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col justify-center flex-1">
                <h2 className="capitalize">{name}</h2>
                <p className="text-gray-400 text-sm">{lastMessage}</p>
            </div>
            <span className="text-purple-600">{timestamp}</span>
        </div>
    )
}

export default ChatDisplay