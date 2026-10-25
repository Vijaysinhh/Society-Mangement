'use client'

import { useState } from 'react'
import { Send, Search, X, Clock, Paperclip, Phone, Video, Info, AlertCircle, CheckCircle2, Check } from 'lucide-react'

interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderRole: 'resident' | 'watchman' | 'admin'
  content: string
  timestamp: string
  read: boolean
  attachment?: { name: string; type: string }
}

interface Conversation {
  id: string
  participantName: string
  participantRole: 'watchman' | 'admin'
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  status: 'active' | 'resolved'
  subject: string
}

const mockConversations: Conversation[] = [
  {
    id: 'conv-001',
    participantName: 'Rajesh',
    participantRole: 'watchman',
    subject: 'Visitor Approval - Maid Entry',
    lastMessage: 'Maid arrived at 9:15 AM',
    lastMessageTime: '2024-03-27 09:20',
    unreadCount: 0,
    status: 'active'
  },
  {
    id: 'conv-002',
    participantName: 'Admin Support',
    participantRole: 'admin',
    subject: 'Maintenance Request Update',
    lastMessage: 'Your AC unit will be serviced tomorrow at 10 AM',
    lastMessageTime: '2024-03-27 08:45',
    unreadCount: 1,
    status: 'active'
  },
  {
    id: 'conv-003',
    participantName: 'Ramesh',
    participantRole: 'watchman',
    subject: 'Package Delivery Notification',
    lastMessage: 'Package from Amazon received',
    lastMessageTime: '2024-03-26 15:30',
    unreadCount: 0,
    status: 'resolved'
  }
]

const mockMessages: Record<string, Message[]> = {
  'conv-001': [
    {
      id: 'msg-001',
      conversationId: 'conv-001',
      senderId: 'resident-1',
      senderName: 'You',
      senderRole: 'resident',
      content: 'Can you allow my maid Priya to enter today at 9 AM?',
      timestamp: '2024-03-27 08:30',
      read: true
    },
    {
      id: 'msg-002',
      conversationId: 'conv-001',
      senderId: 'watchman-1',
      senderName: 'Rajesh',
      senderRole: 'watchman',
      content: 'Understood. I will let her in at 9 AM. What is her phone number for verification?',
      timestamp: '2024-03-27 08:35',
      read: true
    },
    {
      id: 'msg-003',
      conversationId: 'conv-001',
      senderId: 'resident-1',
      senderName: 'You',
      senderRole: 'resident',
      content: '+91 97654 32109',
      timestamp: '2024-03-27 08:40',
      read: true
    },
    {
      id: 'msg-004',
      conversationId: 'conv-001',
      senderId: 'watchman-1',
      senderName: 'Rajesh',
      senderRole: 'watchman',
      content: 'Maid arrived at 9:15 AM',
      timestamp: '2024-03-27 09:20',
      read: true
    }
  ],
  'conv-002': [
    {
      id: 'msg-005',
      conversationId: 'conv-002',
      senderId: 'resident-1',
      senderName: 'You',
      senderRole: 'resident',
      content: 'When will the AC be serviced? It is still not cooling properly.',
      timestamp: '2024-03-27 08:00',
      read: true
    },
    {
      id: 'msg-006',
      conversationId: 'conv-002',
      senderId: 'admin-1',
      senderName: 'Admin Support',
      senderRole: 'admin',
      content: 'Your AC unit will be serviced tomorrow at 10 AM. The technician Amit will call you 30 minutes before arrival.',
      timestamp: '2024-03-27 08:45',
      read: false
    }
  ]
}

// export default function InAppMessaging() {
  const [selectedConversation, setSelectedConversation] = useState<string>('conv-001')
  const [searchTerm, setSearchTerm] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [conversations, setConversations] = useState(mockConversations)
  const [messages, setMessages] = useState(mockMessages)

  const currentConversation = conversations.find(c => c.id === selectedConversation)
  const currentMessages = messages[selectedConversation] || []
  const filteredConversations = conversations.filter(c =>
    c.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSendMessage = () => {
    if (!messageInput.trim()) return

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConversation,
      senderId: 'resident-1',
      senderName: 'You',
      senderRole: 'resident',
      content: messageInput,
      timestamp: new Date().toLocaleString(),
      read: true
    }

    if (!messages[selectedConversation]) {
      messages[selectedConversation] = []
    }

    setMessages({
      ...messages,
      [selectedConversation]: [...(messages[selectedConversation] || []), newMessage]
    })

    // Update conversation last message
    setConversations(conversations.map(c =>
      c.id === selectedConversation
        ? { ...c, lastMessage: messageInput, lastMessageTime: new Date().toLocaleString() }
        : c
    ))

    setMessageInput('')
  }

  const unreadCount = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Unread Badge */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Messages</h2>
          <p className="text-sm text-slate-600 mt-1">{unreadCount} unread messages</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Conversations List */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-slate-200 p-4 h-[600px] flex flex-col">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center text-slate-600 py-6">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations found</p>
              </div>
            ) : (
              filteredConversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedConversation === conv.id
                      ? 'bg-blue-100 border-2 border-blue-300'
                      : 'border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900 truncate">{conv.participantName}</h4>
                    {conv.unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-700 mb-1">{conv.subject}</p>
                  <p className="text-xs text-slate-600 truncate">{conv.lastMessage}</p>
                  <p className="text-xs text-slate-500 mt-1">{conv.lastMessageTime}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 flex flex-col h-[600px]">
          {currentConversation ? (
            <>
              {/* Chat Header */}
              <div className="border-b border-slate-200 p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{currentConversation.participantName}</h3>
                  <p className="text-sm text-slate-600">{currentConversation.subject}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentMessages.length === 0 ? (
                  <div className="text-center text-slate-600 py-12">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  currentMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderRole === 'resident' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.senderRole === 'resident'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-slate-100 text-slate-900 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p className="text-xs opacity-75">{msg.timestamp}</p>
                          {msg.senderRole === 'resident' && msg.read && (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="border-t border-slate-200 p-4">
                <div className="flex gap-2">
                  <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-600">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="font-semibold text-slate-900 text-sm mb-2 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          Messaging Tips
        </p>
        <ul className="text-sm text-slate-700 space-y-1">
          <li>• Use messages to quickly communicate with watchmen about visitor approvals</li>
          <li>• Admin can send you important building announcements and maintenance updates</li>
          <li>• All messages are logged for security and record-keeping</li>
          <li>• You can attach documents and photos to messages</li>
        </ul>
      </div>
    </div>
  )
}
