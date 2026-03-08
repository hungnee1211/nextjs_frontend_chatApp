"use client"
import { UserPlus } from "lucide-react"
import { useState } from "react"
import AddFriendForm from "../form/AddFriendForm"

const CreateDirectChat = ({ currentUserId }: { currentUserId: string }) => {

  const [open, setOpen] = useState(false)

  return (
    <>
      <UserPlus
        size={18}
        className='cursor-pointer'
        onClick={() => setOpen(true)}
      />

      <AddFriendForm
        open={open}
        onClose={() => setOpen(false)}
       
      />
    </>
  )
}

export default CreateDirectChat