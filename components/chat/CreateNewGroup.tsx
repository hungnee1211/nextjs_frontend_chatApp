"use client"
import { Users } from 'lucide-react'
import { useState } from 'react'
import AddFriendForm from '../form/AddFriendForm'
import AddGroupForm from '../form/AddGroupForm'
import { useChatContext } from '@/store/context'
import { useChatStore } from '@/store/useChatStore'

const CreateNewGroup = () => {

 const { setOpenGroup} = useChatStore()

 const handleOpen = (e:any) => {
    e.preventDefault()
    e.stopPropagation();
    
    setOpenGroup(true)
 }

  return (
    <>
      <Users
        size={16}
        className='left-0 flex cursor-pointer'
        onClick={handleOpen}
      />

      
    </>
  )
}

export default CreateNewGroup