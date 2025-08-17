'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Search, SendHorizonal, Loader2 } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import type { Chat, ChatMessage } from '@/lib/types';
import { getChatsForUser, getMessagesForChat, sendMessage } from '@/lib/services';
import { useAuth } from '@/hooks/use-auth';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from './ui/skeleton';

function ChatBubble({ message, isOwnMessage }: { message: ChatMessage; isOwnMessage: boolean }) {
    return (
        <div className={cn("flex items-end gap-2", isOwnMessage && "justify-end")}>
            {!isOwnMessage && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${message.senderId}`} />
                    <AvatarFallback>{'U'}</AvatarFallback>
                </Avatar>
            )}
            <div
                className={cn(
                    "max-w-xs rounded-lg p-3",
                    isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
            >
                <p className="text-sm">{message.text}</p>
            </div>
            {isOwnMessage && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${message.senderId}`} />
                    <AvatarFallback>Me</AvatarFallback>
                </Avatar>
            )}
        </div>
    );
}


export function MessagingPanel() {
  const { userId } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;

    setIsLoading(true);
    const unsubscribe = getChatsForUser(userId, (loadedChats) => {
        setChats(loadedChats);
        if (!selectedChat && loadedChats.length > 0) {
            setSelectedChat(loadedChats[0]);
        }
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId, selectedChat]);


  useEffect(() => {
    if (!selectedChat) return;

    const unsubscribe = getMessagesForChat(selectedChat.id, (loadedMessages) => {
        setMessages(loadedMessages);
    });

    return () => unsubscribe();
  }, [selectedChat]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !selectedChat || !newMessage.trim()) return;

    const textToSend = newMessage;
    setNewMessage('');
    await sendMessage(selectedChat.id, userId, textToSend);
  };
  
  const getOtherParticipant = (chat: Chat) => {
      return chat.participants.find(p => p.id !== userId);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-shrink-0 border-b p-4">
        <h2 className="text-xl font-semibold">Messages</h2>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search messages..." className="pl-10" />
        </div>
      </div>
      <div className="flex flex-grow overflow-hidden">
        <ScrollArea className="h-full w-1/3 border-r">
          <div className="flex flex-col">
            {isLoading ? (
                 <div className="p-4 space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            ) : chats.length > 0 ? (
                chats.map((chat) => {
                    const otherParticipant = getOtherParticipant(chat);
                    return (
                        <button
                            key={chat.id}
                            onClick={() => setSelectedChat(chat)}
                            className={cn(
                            'flex items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50',
                            selectedChat?.id === chat.id && 'bg-muted'
                            )}
                        >
                            <Avatar className="h-10 w-10">
                            <AvatarImage src={otherParticipant?.avatar} alt={otherParticipant?.name} />
                            <AvatarFallback>{otherParticipant?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow overflow-hidden">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold truncate">{otherParticipant?.name}</p>
                                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(chat.lastMessageTimestamp, { addSuffix: true })}</p>
                                </div>
                                <p className={cn("text-sm truncate", chat.lastMessageSenderId !== userId ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                                    {chat.lastMessage}
                                </p>
                            </div>
                        </button>
                    )
                })
            ) : (
                <p className="p-4 text-center text-muted-foreground">No conversations yet.</p>
            )}
          </div>
        </ScrollArea>
        <div className="flex-grow flex flex-col h-full bg-slate-50">
            {selectedChat ? (
                <>
                <div className="flex-shrink-0 border-b p-4 flex items-center gap-3 bg-background">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={getOtherParticipant(selectedChat)?.avatar} alt={getOtherParticipant(selectedChat)?.name} />
                        <AvatarFallback>{getOtherParticipant(selectedChat)?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold">{getOtherParticipant(selectedChat)?.name}</h3>
                        <p className="text-sm text-muted-foreground">Online</p>
                    </div>
                </div>
                <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
                    <div className="flex flex-col gap-4">
                    {messages.map((message) => (
                        <ChatBubble key={message.id} message={message} isOwnMessage={message.senderId === userId} />
                    ))}
                    </div>
                </ScrollArea>
                <div className="flex-shrink-0 border-t p-4 bg-background">
                    <form onSubmit={handleSendMessage} className="relative">
                        <Input 
                            placeholder="Type a message..." 
                            className="pr-12"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                         />
                        <Button type="submit" size="icon" className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2">
                            <SendHorizonal className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : <p>Select a chat to start messaging.</p>}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
