'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { messages } from '@/lib/placeholder-data';
import { cn } from '@/lib/utils';
import { Search, SendHorizonal } from 'lucide-react';
import React from 'react';

export function MessagingPanel() {
  const [selectedChat, setSelectedChat] = React.useState(messages[0]);

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
            {messages.map((message) => (
              <button
                key={message.id}
                onClick={() => setSelectedChat(message)}
                className={cn(
                  'flex items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50',
                  selectedChat.id === message.id && 'bg-muted'
                )}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={message.avatar} alt={message.name} />
                  <AvatarFallback>{message.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow overflow-hidden">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold truncate">{message.name}</p>
                    {message.unreadCount && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                            {message.unreadCount}
                        </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{message.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
        <div className="flex-grow flex flex-col h-full">
            <div className="flex-shrink-0 border-b p-4 flex items-center gap-3">
                 <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedChat.avatar} alt={selectedChat.name} />
                  <AvatarFallback>{selectedChat.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-semibold">{selectedChat.name}</h3>
                    <p className="text-sm text-muted-foreground">Online</p>
                </div>
            </div>
            <ScrollArea className="flex-grow bg-slate-50 p-4">
                <div className="flex flex-col gap-4">
                   {/* Placeholder chat messages */}
                   <div className="flex items-end gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={selectedChat.avatar} />
                        </Avatar>
                        <div className="max-w-xs rounded-lg bg-muted p-3">
                            <p className="text-sm">Hey, how's the project going?</p>
                        </div>
                    </div>
                     <div className="flex items-end gap-2 justify-end">
                        <div className="max-w-xs rounded-lg bg-primary text-primary-foreground p-3">
                            <p className="text-sm">It's going great! Should have an update for you by EOD.</p>
                        </div>
                        <Avatar className="h-8 w-8">
                           <AvatarImage src="https://i.pravatar.cc/150?u=profile" />
                        </Avatar>
                    </div>
                </div>
            </ScrollArea>
            <div className="flex-shrink-0 border-t p-4">
                <div className="relative">
                    <Input placeholder="Type a message..." className="pr-12" />
                    <Button size="icon" className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2">
                        <SendHorizonal className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
