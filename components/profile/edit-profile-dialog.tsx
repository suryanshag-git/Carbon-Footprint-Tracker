"use client"

import React, { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Loader2, User, X } from "lucide-react"
import { toast } from "sonner"
import { updateProfileAction } from "@/app/profile/actions"

interface EditProfileDialogProps {
  currentUsername: string
  currentFullName: string
  currentAvatarUrl: string | null
}

export default function EditProfileDialog({
  currentUsername,
  currentFullName,
  currentAvatarUrl
}: EditProfileDialogProps) {
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState(currentUsername)
  const [fullName, setFullName] = useState(currentFullName)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle avatar image selection & convert to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be smaller than 2MB.")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Clear selected avatar image
  const handleRemoveAvatar = () => {
    setAvatarUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const cleanUsername = username.trim().toLowerCase()
    if (cleanUsername.length < 3) {
      toast.error("Username must be at least 3 characters.")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await updateProfileAction({
        username: cleanUsername,
        fullName: fullName.trim(),
        avatarUrl
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Profile updated successfully!")
        setOpen(false)
      }
    } catch (err) {
      console.error(err)
      toast.error("Something went wrong.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="outline" className="border-emerald-600/35 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-50/50">
          Edit Profile
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px] border-emerald-100 dark:border-emerald-950/50">
        <DialogHeader>
          <DialogTitle className="text-emerald-800 dark:text-emerald-400">Edit Profile Details</DialogTitle>
          <DialogDescription>
            Update your Jagrati profile details and upload a custom avatar. Click save when done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Avatar Uploader Section */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative group">
              <div className="size-24 rounded-full overflow-hidden border-2 border-emerald-500/20 bg-muted flex items-center justify-center relative">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="size-full object-cover" />
                ) : (
                  <User className="size-10 text-muted-foreground/60" />
                )}
                
                {/* Upload Hover Overlay */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200"
                >
                  <Camera className="size-6 text-white" />
                </div>
              </div>

              {/* Remove Avatar Button */}
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute -top-1 -right-1 p-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full shadow-sm"
                  title="Remove Profile Picture"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs border-emerald-100 dark:border-emerald-900/60"
            >
              Change Photo
            </Button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-semibold">
                Username
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground/75 text-sm font-semibold">@</span>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-7 focus-visible:ring-emerald-500 focus-visible:ring-offset-0"
                  placeholder="username"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-semibold">
                Full Name
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="focus-visible:ring-emerald-500 focus-visible:ring-offset-0"
                placeholder="Full name"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
