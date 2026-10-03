import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Sprout, Store, Truck, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';

type CommunityTopic = 'Crop advice' | 'Transport' | 'Market prices' | 'General';
type TopicFilter = 'All topics' | CommunityTopic;

interface CommunityReply {
  id: string;
  author: string;
  body: string;
}

interface CommunityPost {
  id: string;
  author: string;
  location: string;
  postedAt: string;
  topic: CommunityTopic;
  body: string;
  likes: number;
  replies: CommunityReply[];
}

const topicFilters: TopicFilter[] = ['All topics', 'Crop advice', 'Transport', 'Market prices', 'General'];

const starterPosts: CommunityPost[] = [
  {
    id: 'post-1',
    author: 'Sonal Patil',
    location: 'Nashik, Maharashtra',
    postedAt: '18 min ago',
    topic: 'Crop advice',
    body: 'Has anyone found a reliable way to keep table grapes cool during a longer pickup window? Sharing what has worked would help a lot.',
    likes: 12,
    replies: [{ id: 'reply-1', author: 'Vijay Shinde', body: 'Pre-cooling before loading made a big difference for our last route.' }],
  },
  {
    id: 'post-2',
    author: 'Rahul Jadhav',
    location: 'Pune, Maharashtra',
    postedAt: '42 min ago',
    topic: 'Transport',
    body: 'Looking for other farmers coordinating refrigerated loads toward Pune market this week. We may be able to combine space.',
    likes: 8,
    replies: [],
  },
  {
    id: 'post-3',
    author: 'Meena Deshmukh',
    location: 'Satara, Maharashtra',
    postedAt: '1 hr ago',
    topic: 'Market prices',
    body: 'Tomato demand is picking up at the morning auction. What prices are you seeing at your nearest market today?',
    likes: 5,
    replies: [],
  },
];

export const FarmerCommunityView: React.FC = () => {
  const { currentUser } = useApp();
  const [posts, setPosts] = useState(starterPosts);
  const [topic, setTopic] = useState<TopicFilter>('All topics');
  const [draft, setDraft] = useState('');
  const [replyDraft, setReplyDraft] = useState('');
  const [openRepliesFor, setOpenRepliesFor] = useState<string | null>(null);
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);

  const visiblePosts = topic === 'All topics' ? posts : posts.filter((post) => post.topic === topic);

  const submitPost = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;

    setPosts((current) => [{
      id: `post-${Date.now()}`,
      author: currentUser?.fullName?.trim() || 'You',
      location: 'Farmer community',
      postedAt: 'Just now',
      topic: 'General',
      body,
      likes: 0,
      replies: [],
    }, ...current]);
    setDraft('');
    setTopic('All topics');
  };

  const submitReply = (event: React.FormEvent<HTMLFormElement>, postId: string) => {
    event.preventDefault();
    const body = replyDraft.trim();
    if (!body) return;

    setPosts((current) => current.map((post) => post.id === postId
      ? { ...post, replies: [...post.replies, { id: `reply-${Date.now()}`, author: currentUser?.fullName?.trim() || 'You', body }] }
      : post));
    setReplyDraft('');
  };

  const toggleLike = (postId: string) => {
    const alreadyLiked = likedPostIds.includes(postId);
    setLikedPostIds((current) => alreadyLiked ? current.filter((id) => id !== postId) : [...current, postId]);
    setPosts((current) => current.map((post) => post.id === postId
      ? { ...post, likes: post.likes + (alreadyLiked ? -1 : 1) }
      : post));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800"><Users className="h-4 w-4" /> Farmer network</div>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Farmer Community</h2>
          <p className="mt-1 text-sm text-slate-600">Share advice, coordinate transport, and compare market updates.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800"><span className="h-2 w-2 rounded-full bg-emerald-600" />Farmers helping farmers</span>
      </header>

      <form onSubmit={submitPost} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <label htmlFor="community-post" className="mb-2 block text-sm font-semibold text-slate-800">Start a discussion</label>
        <textarea
          id="community-post"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask a question or share an update with other farmers..."
          rows={3}
          maxLength={600}
          className="w-full resize-y rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">Posts are shared with the farmer community.</span>
          <button type="submit" disabled={!draft.trim()} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" />Post</button>
        </div>
      </form>

      <section aria-label="Community discussions">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">Recent discussions</h3>
          <span className="text-xs text-slate-500">{posts.length} posts</span>
        </div>
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter discussions">
          {topicFilters.map((filter) => <button key={filter} type="button" onClick={() => setTopic(filter)} aria-pressed={topic === filter} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${topic === filter ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-800'}`}>{filter}</button>)}
        </div>

        <div className="space-y-3">
          {visiblePosts.map((post) => {
            const isLiked = likedPostIds.includes(post.id);
            const isReplyOpen = openRepliesFor === post.id;
            return <article key={post.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">{post.author.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-semibold text-slate-900">{post.author}</span>
                    <span className="text-xs text-slate-500">{post.location}</span>
                    <span className="text-xs text-slate-400">{post.postedAt}</span>
                  </div>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-800">
                    {post.topic === 'Crop advice' ? <Sprout className="h-3.5 w-3.5" /> : post.topic === 'Transport' ? <Truck className="h-3.5 w-3.5" /> : post.topic === 'Market prices' ? <Store className="h-3.5 w-3.5" /> : <MessageCircle className="h-3.5 w-3.5" />}
                    {post.topic}
                  </span>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{post.body}</p>
                  <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3">
                    <button type="button" onClick={() => toggleLike(post.id)} aria-pressed={isLiked} className={`inline-flex items-center gap-1.5 text-xs font-semibold ${isLiked ? 'text-rose-700' : 'text-slate-500 hover:text-rose-700'}`}><Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />{post.likes}</button>
                    <button type="button" onClick={() => setOpenRepliesFor(isReplyOpen ? null : post.id)} aria-expanded={isReplyOpen} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-800"><MessageCircle className="h-4 w-4" />{post.replies.length} replies</button>
                  </div>
                  {isReplyOpen && <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
                    {post.replies.map((reply) => <div key={reply.id} className="rounded-md bg-slate-50 px-3 py-2"><p className="text-xs font-semibold text-slate-800">{reply.author}</p><p className="mt-1 text-sm text-slate-600">{reply.body}</p></div>)}
                    <form onSubmit={(event) => submitReply(event, post.id)} className="flex items-center gap-2">
                      <input value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} aria-label={`Reply to ${post.author}`} placeholder="Write a reply..." className="h-10 min-w-0 flex-1 rounded-md border border-slate-200 px-3 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-600" />
                      <button type="submit" disabled={!replyDraft.trim()} aria-label="Send reply" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50"><Send className="h-4 w-4" /></button>
                    </form>
                  </div>}
                </div>
              </div>
            </article>;
          })}
          {!visiblePosts.length && <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No discussions in this topic yet.</div>}
        </div>
      </section>
    </div>
  );
};