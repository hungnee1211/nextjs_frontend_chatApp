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
import { Accordion } from "../custom/Accordion"
import { useChatStore } from "@/store/useChatStore"
import AddFriendForm from "../form/AddFriendForm"
import AddGroupForm from "../form/AddGroupForm"


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


  const {openDirect , setOpenDirect , openGroup , setOpenGroup} = useChatStore()

const items = [
  {
    id: 1,
    title: <div className="flex items-center justify-between w-full px-3">
               GROUP CHAT 
               <CreateNewGroup />
            </div>,

    content: <ChatGroupList />
  },
  {
    id: 2,
    title:  <div className="flex items-center justify-between w-full px-3">
               DIRECT CHAT 
               <CreateDirectChat currentUserId={user._id} />
            </div>,
    content:   <ChatDirectList />
             
  }
]

  return (
    <aside className="w-full  flex flex-col bg-white">



      {/* CONTENT */}
      <div className="flex-1 overflow-hidden flex flex-col px-2 py-3 gap-4">

          <Accordion
            items={items}
            title={({ title }) => <>{title}</>}
            content={({ content }) => (
              <div className="px-3 py-2">
                {content}
              </div>
            )}
            multiple
            defaultOpen={[0 , 1]}
          />

          
       

      </div>

      <AddFriendForm
        open={openDirect}
        onClose={() => setOpenDirect(false)}
       
      />


      <AddGroupForm
        open={openGroup}
        onClose={() => setOpenGroup(false)}
      />

     
    </aside>
  )
}