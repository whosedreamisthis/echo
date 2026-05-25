// components/create-echo-modal.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { X, Image, Paperclip, BarChart2, Smile } from 'lucide-react'
import { createEcho } from '@/lib/actions'

interface CreateEchoModalProps {
    isOpen: boolean
    onClose: () => void
}

export function CreateEchoModal({ isOpen, onClose }: CreateEchoModalProps) {
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const maxChars = 280
    const charsLeft = maxChars - content.length
    const isOverLimit = charsLeft < 0
    const canPost = content.trim().length > 0 && !isOverLimit && !isSubmitting

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        if (!canPost) return

        setIsSubmitting(true)
        setError(null)

        try {
            const result = await createEcho(content)
            if (result.success) {
                setContent('')
                onClose()
                // Optional: Trigger a feed refresh here via TanStack Query later!
            } else {
                setError(result.error || 'Something went wrong.')
            }
        } catch (err) {
            setError('Failed to post Echo. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* 🌑 BACKDROP OVERLAY */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* 🧊 MODAL BOX */}
            <div className="relative w-full max-w-xl rounded-2xl border bg-card text-card-foreground shadow-2xl p-6 transition-all animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between border-b pb-3 mb-4">
                    <h2 className="text-xl font-bold tracking-tight">New Echo</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Text Area Frame */}
                    <div className="flex gap-3 items-start">
                        {/* Dummy Avatar */}
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-sm select-none border">
                            ME
                        </div>

                        <div className="flex-1">
              <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's spinning on your mind?..."
                  rows={4}
                  className="w-full resize-none bg-transparent text-lg focus:outline-none placeholder:text-muted-foreground"
                  disabled={isSubmitting}
                  autoFocus
              />

                            {/* Media & Input Attachments (Threads-style aesthetic) */}
                            <div className="flex items-center gap-4 text-muted-foreground mt-2">
                                <button type="button" className="hover:text-foreground transition-colors">button</button>
                                <button type="button" className="hover:text-foreground transition-colors"><Paperclip className="h-5 w-5" /></button>
                                <button type="button" className="hover:text-foreground transition-colors"><BarChart2 className="h-5 w-5" /></button>
                                <button type="button" className="hover:text-foreground transition-colors"><Smile className="h-5 w-5" /></button>
                            </div>
                        </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="flex items-center justify-between border-t pt-4 mt-2">
                        {/* Character Counter */}
                        <span className={`text-sm select-none font-medium ${
                            isOverLimit ? 'text-destructive font-bold' : charsLeft <= 20 ? 'text-amber-500' : 'text-muted-foreground'
                        }`}>
              {charsLeft} characters remaining
            </span>

                        {/* Action Trigger */}
                        <button
                            type="submit"
                            disabled={!canPost}
                            className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-full shadow hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none transition-all duration-150"
                        >
                            {isSubmitting ? 'Posting...' : 'Post Echo'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    )
}