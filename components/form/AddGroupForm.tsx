"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface AddGroupFormProps {
  open: boolean
  onClose: () => void
}

export default function AddGroupForm({ open, onClose }: AddGroupFormProps) {

  const handleCreateGroup = () => {
    // call API create group here
    console.log("Create group...")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Create New Group
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">

          {/* Group Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Group Name</label>
            <Input placeholder="Enter group name..." />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Group description..."
              className="resize-none"
            />
          </div>

          {/* Add Members */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Members</label>
            <Input placeholder="Enter usernames (comma separated)" />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button onClick={handleCreateGroup}>
              Create Group
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}