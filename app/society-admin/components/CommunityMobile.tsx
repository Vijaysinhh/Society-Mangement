'use client'

import { useState } from 'react'
import { Trash2, Plus, Search, Heart, MessageSquare, Share2, Edit2, FileText, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

interface CommunityPost {
  id: string
  type: 'announcement' | 'post'
  author: string
  unit: string
  timestamp: string
  message: string
  likes: number
  replies: number
  shares: number
  liked: boolean
  category?: 'safety' | 'maintenance' | 'event' | 'general'
}

interface Guideline {
  id: string
  version: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

const mockAdminAnnouncements: CommunityPost[] = [
  {
    id: 'ann1',
    type: 'announcement',
    author: 'Management',
    unit: 'Admin',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    message: 'Water Supply Maintenance: Water supply will be shut down from 2 AM to 5 AM on Sunday.',
    likes: 45,
    replies: 8,
    shares: 12,
    liked: false,
    category: 'maintenance',
  },
]

const mockResidentPosts: CommunityPost[] = [
  {
    id: 'post1',
    type: 'post',
    author: 'Ajay Sharma',
    unit: '201',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    message: 'Is the gym booking system working? I cannot book slots.',
    likes: 12,
    replies: 3,
    shares: 0,
    liked: false,
  },
]

const mockGuidelines: Guideline[] = [
  {
    id: 'guide-1',
    version: 'v1.0',
    title: 'Community Living Guidelines',
    content: 'Please maintain quiet hours from 10 PM to 7 AM. Keep common areas clean. Park vehicles in designated areas only.',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
  },
]

export default function CommunityMobile() {
  const [activeTab, setActiveTab] = useState<'board' | 'guidelines'>('board')
  const [posts, setPosts] = useState<CommunityPost[]>([...mockAdminAnnouncements, ...mockResidentPosts])
  const [guidelines, setGuidelines] = useState<Guideline[]>(mockGuidelines)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPostForm, setShowPostForm] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'safety' | 'maintenance' | 'event' | 'general'>('general')
  const [showGuidelineForm, setShowGuidelineForm] = useState(false)
  const [editingGuidelineId, setEditingGuidelineId] = useState<string | null>(null)
  const [newGuidelineTitle, setNewGuidelineTitle] = useState('')
  const [newGuidelineContent, setNewGuidelineContent] = useState('')

  const filteredPosts = posts.filter(post =>
    post.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlePostAnnouncement = () => {
    if (!newAnnouncement.trim()) {
      toast.error('Please enter an announcement')
      return
    }
    const announcement: CommunityPost = {
      id: `ann-${Date.now()}`,
      type: 'announcement',
      author: 'Management',
      unit: 'Admin',
      timestamp: new Date().toLocaleDateString(),
      message: newAnnouncement,
      likes: 0,
      replies: 0,
      shares: 0,
      liked: false,
      category: selectedCategory,
    }
    setPosts([announcement, ...posts])
    setNewAnnouncement('')
    setShowPostForm(false)
    toast.success('Announcement posted!')
  }

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId))
    toast.success('Post deleted')
  }

  const handleSaveGuideline = () => {
    if (!newGuidelineTitle.trim() || !newGuidelineContent.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    if (editingGuidelineId) {
      setGuidelines(guidelines.map(g =>
        g.id === editingGuidelineId
          ? { ...g, title: newGuidelineTitle, content: newGuidelineContent, updatedAt: new Date().toLocaleDateString() }
          : g
      ))
      toast.success('Guideline updated!')
    } else {
      const lastVersion = guidelines.length > 0 ? guidelines[0].version : 'v0.0'
      const [major, minor] = lastVersion.substring(1).split('.').map(Number)
      const newVersion = `v${major}.${minor + 1}`
      const newGuideline: Guideline = {
        id: `guide-${Date.now()}`,
        version: newVersion,
        title: newGuidelineTitle,
        content: newGuidelineContent,
        createdAt: new Date().toLocaleDateString(),
        updatedAt: new Date().toLocaleDateString(),
      }
      setGuidelines([newGuideline, ...guidelines])
      toast.success(`Guideline created version ${newVersion}`)
    }
    setNewGuidelineTitle('')
    setNewGuidelineContent('')
    setShowGuidelineForm(false)
    setEditingGuidelineId(null)
  }

  const handleDeleteGuideline = (guidelineId: string) => {
    if (confirm('Delete this guideline version?')) {
      setGuidelines(guidelines.filter(g => g.id !== guidelineId))
      toast.success('Guideline deleted')
    }
  }

  const handleEditGuideline = (guideline: Guideline) => {
    setEditingGuidelineId(guideline.id)
    setNewGuidelineTitle(guideline.title)
    setNewGuidelineContent(guideline.content)
    setShowGuidelineForm(true)
  }

  const stats = {
    totalPosts: posts.length,
    announcements: posts.filter(p => p.type === 'announcement').length,
    residentPosts: posts.filter(p => p.type === 'post').length,
    totalEngagement: posts.reduce((sum, p) => sum + p.likes + p.replies + p.shares, 0),
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-20">
      {/* Header Stats */}
      <div className="px-4 py-4 bg-white border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Community Management</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">{stats.announcements}</div>
            <div className="text-xs text-blue-700 font-medium">Announcements</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">{stats.residentPosts}</div>
            <div className="text-xs text-green-700 font-medium">Resident Posts</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-600">{stats.totalPosts}</div>
            <div className="text-xs text-purple-700 font-medium">Total Posts</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">{stats.totalEngagement}</div>
            </div>
            <div className="text-xs text-orange-700 font-medium">Engagement</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 flex gap-4">
        <button
          onClick={() => setActiveTab('board')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${activeTab === 'board' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600'}`}
        >
          Community Board
        </button>
        <button
          onClick={() => setActiveTab('guidelines')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${activeTab === 'guidelines' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600'}`}
        >
          Guidelines
        </button>
      </div>

      {/* Community Board Tab */}
      {activeTab === 'board' && (
        <div className="px-4 py-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Post Button */}
          <button
            onClick={() => setShowPostForm(!showPostForm)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Post Announcement
          </button>

          {/* Post Form */}
          {showPostForm && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="general">General</option>
                <option value="safety">Safety</option>
                <option value="maintenance">Maintenance</option>
                <option value="event">Event</option>
              </select>
              <textarea
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
                placeholder="Write announcement..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none text-sm"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowPostForm(false)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 text-sm font-medium">Cancel</button>
                <button onClick={handlePostAnnouncement} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">Post</button>
              </div>
            </div>
          )}

          {/* Feed */}
          <div className="space-y-3">
            {filteredPosts.map(post => (
              <div
                key={post.id}
                className={`rounded-lg p-4 border transition-all ${post.type === 'announcement' ? 'bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200' : 'bg-white border-slate-200'} hover:shadow-md`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    {post.type === 'announcement' && <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-600 text-white text-xs font-bold rounded mb-1">📢 Admin</span>}
                    {post.type === 'post' && <p className="font-semibold text-slate-900">{post.author}</p>}
                    <p className={`text-xs ${post.type === 'announcement' ? 'text-indigo-600' : 'text-slate-500'}`}>
                      {post.type === 'post' ? `Unit ${post.unit}` : 'Management'} • {post.timestamp}
                    </p>
                  </div>
                  <button onClick={() => handleDeletePost(post.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                </div>
                <p className={post.type === 'announcement' ? 'text-slate-800 font-medium mb-3' : 'text-slate-700 mb-3'}>{post.message}</p>
                {post.category && <span className={`text-xs font-semibold px-2 py-1 rounded-full mb-3 inline-block ${post.category === 'safety' ? 'bg-red-100 text-red-700' : post.category === 'maintenance' ? 'bg-orange-100 text-orange-700' : post.category === 'event' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>{post.category}</span>}
                <div className="flex gap-4 text-sm text-slate-600 pt-3 border-t border-slate-200 mt-3">
                  <button className="flex items-center gap-2 hover:text-red-600"><Heart className="w-4 h-4" /> <span>{post.likes}</span></button>
                  <button className="flex items-center gap-2 hover:text-blue-600"><MessageSquare className="w-4 h-4" /> <span>{post.replies}</span></button>
                  <button className="flex items-center gap-2 hover:text-blue-600"><Share2 className="w-4 h-4" /> <span>{post.shares}</span></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guidelines Tab */}
      {activeTab === 'guidelines' && (
        <div className="px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><FileText className="w-5 h-5" /> Community Guidelines</h3>
            <button
              onClick={() => { setEditingGuidelineId(null); setNewGuidelineTitle(''); setNewGuidelineContent(''); setShowGuidelineForm(!showGuidelineForm) }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-sm"
            >
              <Plus className="w-4 h-4" /> New
            </button>
          </div>

          {showGuidelineForm && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-3">
              <input
                type="text"
                placeholder="Guideline Title"
                value={newGuidelineTitle}
                onChange={(e) => setNewGuidelineTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <textarea
                placeholder="Guideline Content"
                value={newGuidelineContent}
                onChange={(e) => setNewGuidelineContent(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none text-sm"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setShowGuidelineForm(false); setEditingGuidelineId(null); setNewGuidelineTitle(''); setNewGuidelineContent('') }} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 text-sm font-medium">Cancel</button>
                <button onClick={handleSaveGuideline} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">{editingGuidelineId ? 'Update' : 'Create'}</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {guidelines.map(guideline => (
              <div key={guideline.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{guideline.title} <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full ml-2">{guideline.version}</span></h4>
                    <p className="text-xs text-slate-500 mt-1">Created: {guideline.createdAt}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditGuideline(guideline)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteGuideline(guideline.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded border border-slate-100 whitespace-pre-wrap">{guideline.content}</p>
                {guideline.createdAt !== guideline.updatedAt && <p className="text-xs text-slate-500 mt-2">Updated: {guideline.updatedAt}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
