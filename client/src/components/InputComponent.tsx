import React, { useState, useRef, useEffect, forwardRef, createContext, useContext } from 'react';
import { Smile, Send, Mic } from 'lucide-react';
import { sendMessage } from '@/api/socket';
import { useChatStore } from '@/store/chatStore';
import { fetchWithAuth } from '@/api/client';
import { useConversationsStore } from '@/store/conversationStore';
import useAuthStore from '@/store/authStore';

// --- Primitives & Utilities for Shadcn-like components ---

const cn = (...classes) => classes.filter(Boolean).join(' ');

// Context for Popover
const PopoverContext = createContext(null);

const usePopover = () => {
    const context = useContext(PopoverContext);
    if (!context) throw new Error("usePopover must be used within a PopoverProvider");
    return context;
};

// --- Mock Shadcn UI Components (Self-contained for this file) ---

const Button = forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
        default: "bg-slate-900 text-white hover:bg-slate-800",
        ghost: "hover:bg-slate-100 hover:text-slate-900",
    };
    const sizes = {
        default: "h-10 px-4 py-2",
        icon: "h-12 w-12",
    };
    return (
        <button
            className={cn("inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50", variants[variant], sizes[size], className)}
            ref={ref}
            {...props}
        />
    );
});
Button.displayName = 'Button';


const Textarea = forwardRef(({ className, ...props }, ref) => {
    return (
        <textarea
            className={cn(
                'flex w-full resize-none rounded-md border-none bg-transparent px-3 py-2 text-base placeholder:text-slate-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                'overflow-hidden', // Important for auto-resize
                className
            )}
            ref={ref}
            {...props}
        />
    );
});
Textarea.displayName = 'Textarea';

const Popover = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef(null);

    const toggle = () => setIsOpen(prev => !prev);
    const close = () => setIsOpen(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                close();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <PopoverContext.Provider value={{ isOpen, toggle, close }}>
            <div ref={popoverRef} className="relative inline-block">
                {children}
            </div>
        </PopoverContext.Provider>
    );
};

const PopoverTrigger = ({ children }) => {
    const { toggle } = usePopover();
    // We need to clone the child to attach the onClick handler
    return React.cloneElement(children, {
        onClick: (e) => {
            e.stopPropagation();
            toggle();
            children.props.onClick?.(e);
        }
    });
};

const PopoverContent = ({ children, className }) => {
    const { isOpen } = usePopover();
    if (!isOpen) return null;
    return (
        <div
            className={cn("absolute bottom-full mb-2 w-72 rounded-xl border bg-white p-4 shadow-lg animate-in fade-in-0 zoom-in-95", className)}
        >
            {children}
        </div>
    );
};


// --- The Main WhatsApp Input Component ---

const WhatsappInput = () => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { close: closePopover } = useContext(PopoverContext) || { close: () => { } };

    const { activeContactId, activeConversationId } = useChatStore()
    const { addConversation, addMessage } = useConversationsStore()
    const { user } = useAuthStore()

    const EMOJIS = ['😀', '😂', '😍', '🤔', '👋', '❤️', '👍', '🎉', '🙏', '🔥', '🚀', '💯'];

    // Auto-resize the textarea height based on content
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset height to recalculate
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = `${scrollHeight}px`;
        }
    }, [message]);

    const handleEmojiSelect = (emoji) => {
        setMessage(prev => prev + emoji);
        closePopover(); // Close popover after selection
    };

    const handleSendMessage = async () => {
        if (!message.trim()) {
            // In a real app, you'd start voice recording
            console.log("Start voice recording...");
            return;
        }

        try {
            let conversationId = activeConversationId;

            // No conversation yet, but a contact is selected
            if (!conversationId && activeContactId) {
                const conv = await fetchWithAuth("/conversations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "dm",
                        participants: [activeContactId], // must be an array
                    }),
                });

                conversationId = conv.id; // backend returns conv
                addConversation(conv)
                // update your state/store so UI knows about the new conversation
                // e.g., convStore.addConversation(conv)
            }

            // Now send the message
            if (conversationId) {
                sendMessage(conversationId, message); // your socket.io function
                const tempId = `temp-${Date.now()}`;
                addMessage(conversationId, {
                    id: tempId,
                    content: message,
                    conversation_id: conversationId,
                    created_at: new Date().toISOString(),
                    sender_id: user?.id!,
                    statuses: [{ user_id: user?.id!, status: "sent" }],
                });
            }

            setMessage("");
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    const handleInputChange = (e) => {
        setMessage(e.target.value);
    };

    return (
        <div className="flex items-end w-full p-2 space-x-2 bg-gray-800 rounded-full mb-auto flex-shrink-0">
            {/* Emoji Picker Popover */}
            <Popover>
                <PopoverTrigger>
                    <Button variant="ghost" size="icon" className="flex-shrink-0 text-gray-500 hover:text-gray-900">
                        <Smile className="h-6 w-6" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-2">
                    <p className="text-sm font-medium text-center text-gray-500 mb-2">Select an emoji</p>
                    <div className="grid grid-cols-6 gap-1">
                        {EMOJIS.map((emoji, index) => (
                            <button
                                key={index}
                                onClick={() => handleEmojiSelect(emoji)}
                                className="text-2xl p-1 rounded-lg hover:bg-gray-100 transition-colors"
                                aria-label={`emoji ${emoji}`}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>

            {/* Text Input Area */}
            <div className="flex-1 min-w-0">
                <Textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleInputChange}
                    placeholder="Message"
                    rows={1}
                    className="py-3 px-1 text-base"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                />
            </div>
        </div>
    );
}

export default WhatsappInput
