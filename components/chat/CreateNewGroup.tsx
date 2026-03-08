"use client"
import { Users } from 'lucide-react'
import { useState } from 'react'
import AddFriendForm from '../form/AddFriendForm'
import AddGroupForm from '../form/AddGroupForm'

const CreateNewGroup = () => {

  const [open, setOpen] = useState(false)

  return (
    <>
      <Users
        size={16}
        className='left-0 flex cursor-pointer'
        onClick={() => setOpen(true)}
      />

      <AddGroupForm
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}

export default CreateNewGroup