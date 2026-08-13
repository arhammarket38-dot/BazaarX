import React, { useState, useEffect } from 'react';
import { BlogPost, CMSPage } from '../../types';
import { BookOpen, Calendar, User, ArrowRight, ShieldCheck, FileText } from 'lucide-react';

export const BlogSection: React.FC<{ initialType?: 'blog' | 'page'; pageSlug?: string }> = ({
  initialType = 'blog',
  pageSlug = 'about-us',
}) => {
  const [viewType, setViewType] = useState<'blog' | 'page'>(initialType);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const [pages, setPages] = useState<CMSPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<CMSPage | null>(null);

  useEffect(() => {
    fetch('/api/blog')
      .then((res) => res.json())
      .then((data) => {
        setBlogPosts(data);
        if (data.length > 0) setSelectedPost(data[0]);
      });

    fetch('/api/cms/pages')
      .then((res) => res.json())
      .then((data) => {
        setPages(data);
        const match = data.find((p: CMSPage) => p.slug === pageSlug) || data[0];
        setSelectedPage(match);
      });
  }, [pageSlug]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex border-b border-slate-200 pb-4 justify-between items-center">
        <div className="flex gap-4 text-xs font-bold">
          <button
            onClick={() => setViewType('blog')}
            className={`pb-2 border-b-2 ${viewType === 'blog' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400'}`}
          >
            AURA Journal & Audio Insights
          </button>
          <button
            onClick={() => setViewType('page')}
            className={`pb-2 border-b-2 ${viewType === 'page' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400'}`}
          >
            Corporate Policies & Information
          </button>
        </div>
      </div>

      {viewType === 'blog' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {selectedPost ? (
              <div className="space-y-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
                <img src={selectedPost.featuredImage} alt="" className="w-full h-64 object-cover rounded-2xl" />
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="bg-indigo-100 text-indigo-800 font-bold px-2.5 py-0.5 rounded-full">{selectedPost.category}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(selectedPost.publishedAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {selectedPost.author}</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">{selectedPost.title}</h2>
                <div className="text-slate-700 text-xs leading-relaxed space-y-3 font-normal">
                  <p>{selectedPost.content}</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <h4 className="font-extrabold text-slate-900 text-sm">Recent Articles</h4>
            {blogPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedPost?.id === post.id ? 'border-slate-900 bg-slate-50 shadow-xs' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <h5 className="font-bold text-xs text-slate-900">{post.title}</h5>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{post.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewType === 'page' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="space-y-1">
            {pages.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPage(p)}
                className={`w-full text-left p-3 rounded-xl font-bold text-xs flex items-center justify-between ${
                  selectedPage?.id === p.id ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {p.title} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>

          <div className="lg:col-span-3 bg-white p-8 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            {selectedPage && (
              <>
                <h2 className="text-2xl font-black text-slate-900">{selectedPage.title}</h2>
                <p className="text-xs text-slate-400">Last updated: {new Date(selectedPage.updatedAt).toLocaleDateString()}</p>
                <div className="text-xs text-slate-700 leading-relaxed border-t border-slate-100 pt-4 space-y-3">
                  <p>{selectedPage.content}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
