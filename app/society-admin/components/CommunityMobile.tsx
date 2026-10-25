'use client'

import { useEffect, useState } from 'react'
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
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [guidelines, setGuidelines] = useState<Guideline[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showPostForm, setShowPostForm] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'safety' | 'maintenance' | 'event' | 'general'>('general')
  const [showGuidelineForm, setShowGuidelineForm] = useState(false)
  const [editingGuidelineId, setEditingGuidelineId] = useState<string | null>(null)
  const [newGuidelineTitle, setNewGuidelineTitle] = useState('')
  const [newGuidelineContent, setNewGuidelineContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function loadCommunity() {
      try {
        const [postsResponse, guidelinesResponse] = await Promise.all([fetch('/api/community/posts'), fetch('/api/community/guidelines')])
        const [postsResult, guidelinesResult] = await Promise.all([postsResponse.json(), guidelinesResponse.json()])
        if (!postsResponse.ok) throw new Error(postsResult.error || 'Could not load community posts')
        if (!guidelinesResponse.ok) throw new Error(guidelinesResult.error || 'Could not load guidelines')
        if (!cancelled) {
          setPosts((postsResult.data || []).map((post: CommunityPost & { timestamp: string }) => ({ ...post, timestamp: new Date(post.timestamp).toLocaleDateString() })))
          setGuidelines((guidelinesResult.data || []).map((guideline: Guideline) => ({ ...guideline, createdAt: new Date(guideline.createdAt).toLocaleDateString(), updatedAt: new Date(guideline.updatedAt).toLocaleDateString() })))
        }
      } catch (error) {
        if (!cancelled) toast.error('Could not load community', { description: error instanceof Error ? error.message : 'Try again.' })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void loadCommunity()
    return () => { cancelled = true }
  }, [])

  const filteredPosts = posts.filter(post =>
    post.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlePostAnnouncement = async () => {
    if (!newAnnouncement.trim()) {
      toast.error('Please enter an announcement')
      return
    }
    try {
      const response = await fetch('/api/community/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: newAnnouncement, category: selectedCategory }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not post announcement')
      setPosts([{ ...result.data, timestamp: new Date(result.data.timestamp).toLocaleDateString() }, ...posts])
      setNewAnnouncement('')
      setShowPostForm(false)
      toast.success('Announcement posted!')
    } catch (error) {
      toast.error('Could not post announcement', { description: error instanceof Error ? error.message : 'Try again.' })
    }
  }

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/community/posts/${postId}`, { method: 'DELETE' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not delete post')
      setPosts(posts.filter(p => p.id !== postId))
      toast.success('Post deleted')
    } catch (error) {
      toast.error('Could not delete post', { description: error instanceof Error ? error.message : 'Try again.' })
    }
  }

  const handleSaveGuideline = async () => {
    if (!newGuidelineTitle.trim() || !newGuidelineContent.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    try {
      const response = await fetch(editingGuidelineId ? `/api/community/guidelines/${editingGuidelineId}` : '/api/community/guidelines', { method: editingGuidelineId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newGuidelineTitle, content: newGuidelineContent }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not save guideline')
      const saved = { ...result.data, createdAt: new Date(result.data.createdAt).toLocaleDateString(), updatedAt: new Date(result.data.updatedAt).toLocaleDateString() }
      setGuidelines(editingGuidelineId ? guidelines.map(g => g.id === editingGuidelineId ? saved : g) : [saved, ...guidelines])
      toast.success(editingGuidelineId ? 'Guideline updated!' : `Guideline created version ${saved.version}`)
      setNewGuidelineTitle('')
      setNewGuidelineContent('')
      setShowGuidelineForm(false)
      setEditingGuidelineId(null)
    } catch (error) {
      toast.error('Could not save guideline', { description: error instanceof Error ? error.message : 'Try again.' })
    }
  }

  const handleDeleteGuideline = async (guidelineId: string) => {
    if (confirm('Delete this guideline version?')) {
      try {
        const response = await fetch(`/api/community/guidelines/${guidelineId}`, { method: 'DELETE' })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Could not delete guideline')
        setGuidelines(guidelines.filter(g => g.id !== guidelineId))
        toast.success('Guideline deleted')
      } catch (error) {
        toast.error('Could not delete guideline', { description: error instanceof Error ? error.message : 'Try again.' })
      }
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
            {loading && <p role="status" className="py-6 text-center text-sm text-slate-600">Loading community posts...</p>}
            {!loading && filteredPosts.length === 0 && <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">No community posts yet.</p>}
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
            {loading && <p role="status" className="py-6 text-center text-sm text-slate-600">Loading guidelines...</p>}
            {!loading && guidelines.length === 0 && <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">No community guidelines yet.</p>}
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
