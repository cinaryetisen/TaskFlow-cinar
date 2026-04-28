'use client'

import { useState, useTransition } from 'react'
import { inviteMember, removeMember } from '@/app/actions/members'

type Member = { id: string; role: string; user: { id: string; name: string | null; email: string } }

type Props = {
  boardId: string
  initialMembers: Member[]
  isOwner: boolean
  currentUserId: string
}

export default function MembersPanel({ boardId, initialMembers, isOwner, currentUserId }: Props) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [, startTransition] = useTransition()

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setError('')
    const result = await inviteMember(boardId, email.trim())
    if (result?.error) { setError(result.error); return }
    setEmail('')
  }

  function handleRemove(targetUserId: string) {
    setMembers((prev) => prev.filter((m) => m.user.id !== targetUserId))
    startTransition(() => removeMember(boardId, targetUserId))
  }

  const totalCount = members.length + 1

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <span>{totalCount} member{totalCount !== 1 ? 's' : ''}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setOpen(false)}
        >
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Board Members</h2>

            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Owner</p>
            <div className="flex items-center justify-between py-1.5 mb-4">
              <p className="text-sm text-gray-900">You</p>
              <span className="text-xs text-violet-600 font-medium bg-violet-50 px-2 py-0.5 rounded-full">Owner</span>
            </div>

            {members.length > 0 && (
              <>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Members</p>
                <div className="space-y-1 mb-4">
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between py-1.5">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{m.user.name ?? m.user.email}</p>
                        {m.user.name && <p className="text-xs text-gray-400">{m.user.email}</p>}
                      </div>
                      {(isOwner || m.user.id === currentUserId) && (
                        <button
                          onClick={() => handleRemove(m.user.id)}
                          className="text-xs text-red-500 hover:text-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {isOwner && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Invite by email</p>
                <form onSubmit={handleInvite} className="flex gap-2">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="someone@example.com"
                    type="email"
                    className="flex-1 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <button
                    type="submit"
                    disabled={!email.trim()}
                    className="px-3 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
                  >
                    Invite
                  </button>
                </form>
                {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
