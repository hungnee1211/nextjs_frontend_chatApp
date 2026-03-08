"use client"

import * as React from "react"
import { Command } from "lucide-react"

import CreateNewGroup from "../chat/CreateNewGroup"
import ChatGroupList from "../chat/ChatGroupList"
import CreateDirectChat from "../chat/CreateDirectChat"
import ChatDirectList from "../chat/ChatDirectList"
import { NavUser } from "./nav-user"

import { Conversation } from "@/lib/types/chat"
import { User } from "@/lib/types/user"
import { Button } from "../ui/button"
import { useSocketStore } from "@/store/useSocketStore"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"

interface Props {
  conversations: Conversation[]
  currentUserId: string
  user: User
}

export function AppSidebar({
  conversations,
  currentUserId,
  user
}: Props) {




  return (
    <aside className="w-full  flex flex-col bg-white">



      {/* CONTENT */}
      <div className="flex-1 overflow-hidden flex flex-col px-2 py-3 gap-4">
      <Accordion type="multiple" defaultValue={["item-1"]}>
        <AccordionItem value="item-1"> 
          <AccordionTrigger>
            <div className="flex items-center justify-between w-full px-3">
               GROUP CHAT 
               <CreateNewGroup />
            </div>
          
            </AccordionTrigger> 
          <AccordionContent>

            <ChatGroupList />

          </AccordionContent>
        </AccordionItem>


         <AccordionItem value="item-2">
          <AccordionTrigger>   
            <div className="flex items-center justify-between w-full px-3">
               DIRECT CHAT 
               <CreateDirectChat currentUserId={user._id} />
            </div>
           </AccordionTrigger>
           
          <AccordionContent>

             <ChatDirectList />
             
          </AccordionContent>
        </AccordionItem>


      </Accordion>

      </div>

     
    </aside>
  )
}