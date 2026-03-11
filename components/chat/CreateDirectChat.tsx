"use client"
import { UserPlus } from "lucide-react"
import { useState } from "react"
import AddFriendForm from "../form/AddFriendForm"
import { useChatStore } from "@/store/useChatStore"

const CreateDirectChat = ({ currentUserId }: { currentUserId: string }) => {

  const {setOpenDirect} = useChatStore()

  const handleOpen = (e:any) => {
     e.preventDefault()
     e.stopPropagation();
      setOpenDirect(true)

  }

  return (
    <>
      <UserPlus
        size={18}
        className='cursor-pointer'
        onClick={handleOpen}
      />

      
    </>

  )
}

export default CreateDirectChat