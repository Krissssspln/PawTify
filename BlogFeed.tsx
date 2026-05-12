import { useState, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, UserPlus, Image, Video, Send, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { BlogPost, BlogComment } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export default function BlogFeed() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({
    content: '',
    image_url: '',
    video_url: '',
  });
  const [posting, setPosting] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, BlogComment[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});

  const handleImageUpload = async (file: File) => {
    if (!user) return '';

    const extension = file.name.split('.').pop();
    const path = `${user.id}/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from('blog-media')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      alert('No se pudo subir la imagen.');
      return '';
    }

    const { data } = supabase.storage
      .from('blog-media')
      .getPublicUrl(path);

    return data.publicUrl;
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);

    const { data } = await supabase
      .from('blog_posts')
      .select('*, profile:profiles(*)')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      if (user) {
        const { data: likes } = await supabase
          .from('blog_likes')
          .select('post_id')
          .eq('user_id', user.id);

        const likedIds = new Set(likes?.map((l) => l.post_id) || []);

        setPosts(
          data.map((p) => ({
            ...p,
            liked: likedIds.has(p.id),
          }))
        );
      } else {
        setPosts(
          data.map((p) => ({
            ...p,
            liked: false,
          }))
        );
      }
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePost = async () => {
    if (!user || !profile || (!newPost.content && !newPost.image_url)) return;

    setPosting(true);

    await supabase.from('blog_posts').insert({
      user_id: user.id,
      content: newPost.content,
      image_url: newPost.image_url,
      video_url: newPost.video_url,
    });

    setNewPost({
      content: '',
      image_url: '',
      video_url: '',
    });

    await fetchPosts();
    setPosting(false);
  };

  const handleLike = async (post: BlogPost) => {
    if (!user) return;

    if (post.liked) {
      await supabase
        .from('blog_likes')
        .delete()
        .match({
          post_id: post.id,
          user_id: user.id,
        });

      await supabase
        .from('blog_posts')
        .update({
          like_count: post.like_count - 1,
        })
        .eq('id', post.id);
    } else {
      await supabase.from('blog_likes').insert({
        post_id: post.id,
        user_id: user.id,
      });

      await supabase
        .from('blog_posts')
        .update({
          like_count: post.like_count + 1,
        })
        .eq('id', post.id);
    }

    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              liked: !p.liked,
              like_count: p.like_count + (post.liked ? -1 : 1),
            }
          : p
      )
    );
  };

  const loadComments = async (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
      return;
    }

    const { data } = await supabase
      .from('blog_comments')
      .select('*, profile:profiles(*)')
      .eq('post_id', postId)
      .order('created_at');

    setComments((prev) => ({
      ...prev,
      [postId]: data || [],
    }));

    setExpandedPost(postId);
  };

  const handleComment = async (postId: string) => {
    if (!user || !newComment[postId]?.trim()) return;

    await supabase.from('blog_comments').insert({
      post_id: postId,
      user_id: user.id,
      content: newComment[postId],
    });

    await supabase
      .from('blog_posts')
      .update({
        comment_count:
          (posts.find((p) => p.id === postId)?.comment_count || 0) + 1,
      })
      .eq('id', postId);

    setNewComment((prev) => ({
      ...prev,
      [postId]: '',
    }));

    await loadComments(postId);

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comment_count: p.comment_count + 1,
            }
          : p
      )
    );
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-CR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Create post */}
      {user && profile && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
              style={{ background: '#5DADE2' }}
            >
              {profile.full_name[0].toUpperCase()}
            </div>

            <textarea
              value={newPost.content}
              onChange={(e) =>
                setNewPost((p) => ({
                  ...p,
                  content: e.target.value,
                }))
              }
              placeholder="¿Qué hay de nuevo con tu mascota?"
              rows={3}
              className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#5DADE2] transition-colors"
            />
          </div>

          {(newPost.image_url || newPost.video_url) && (
            <div className="mb-3 space-y-2">
              {newPost.image_url && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-xl">
                  <Image size={16} style={{ color: '#5DADE2' }} />
                  <span className="flex-1 truncate">
                    {newPost.image_url}
                  </span>

                  <button
                    onClick={() =>
                      setNewPost((p) => ({
                        ...p,
                        image_url: '',
                      }))
                    }
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {newPost.video_url && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-orange-50 px-3 py-2 rounded-xl">
                  <Video size={16} style={{ color: '#FFA726' }} />
                  <span className="flex-1 truncate">
                    {newPost.video_url}
                  </span>

                  <button
                    onClick={() =>
                      setNewPost((p) => ({
                        ...p,
                        video_url: '',
                      }))
                    }
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {/* SUBIR IMAGEN DESDE DISPOSITIVO */}
            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors border border-gray-200 cursor-pointer">
              <Image size={16} style={{ color: '#5DADE2' }} />
              Foto

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const url = await handleImageUpload(file);

                  if (url) {
                    setNewPost((prev) => ({
                      ...prev,
                      image_url: url,
                    }));
                  }
                }}
              />
            </label>

            <button
              onClick={() => {
                const url = prompt('URL del video:');
                if (url) {
                  setNewPost((p) => ({
                    ...p,
                    video_url: url,
                  }));
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <Video size={16} style={{ color: '#FFA726' }} />
              Video
            </button>

            <div className="flex-1" />

            <button
              onClick={handlePost}
              disabled={posting || (!newPost.content && !newPost.image_url)}
              className="px-5 py-2 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: '#5DADE2' }}
            >
              {posting ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>
      )}

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl h-48 animate-pulse border border-gray-100"
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <MessageCircle
            size={48}
            className="mx-auto mb-4 opacity-30"
          />
          <p>Sé el primero en publicar algo</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                    style={{ background: '#FFA726' }}
                  >
                    {post.profile?.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>

                  <div>
                    <p className="font-semibold text-sm text-gray-800">
                      {post.profile?.full_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      @{post.profile?.username} ·{' '}
                      {formatDate(post.created_at)}
                    </p>
                  </div>
                </div>

                {user && user.id !== post.user_id && (
                  <button
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors"
                    style={{
                      color: '#5DADE2',
                      borderColor: '#5DADE2',
                    }}
                  >
                    <UserPlus size={13} />
                    Seguir
                  </button>
                )}
              </div>

              {post.content && (
                <p className="px-4 pb-3 text-sm text-gray-700 leading-relaxed">
                  {post.content}
                </p>
              )}

              {post.image_url && (
                <img
                  src={post.image_url}
                  alt="post"
                  className="w-full max-h-80 object-cover"
                  loading="lazy"
                />
              )}

              {post.video_url && (
                <video
                  src={post.video_url}
                  controls
                  className="w-full max-h-80"
                />
              )}

              <div className="flex items-center gap-4 px-4 py-3 border-t border-gray-50">
                <button
                  onClick={() => handleLike(post)}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    post.liked
                      ? 'text-red-500'
                      : 'text-gray-500 hover:text-red-400'
                  }`}
                >
                  <Heart
                    size={18}
                    fill={post.liked ? 'currentColor' : 'none'}
                  />
                  {post.like_count}
                </button>

                <button
                  onClick={() => loadComments(post.id)}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#5DADE2] transition-colors"
                >
                  <MessageCircle size={18} />
                  {post.comment_count}
                </button>
              </div>

              {expandedPost === post.id && (
                <div className="border-t border-gray-50 px-4 pb-4 pt-3">
                  <div className="space-y-3 mb-3">
                    {(comments[post.id] || []).map((c) => (
                      <div key={c.id} className="flex gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: '#5DADE2' }}
                        >
                          {c.profile?.full_name?.[0]?.toUpperCase() || 'U'}
                        </div>

                        <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
                          <p className="text-xs font-semibold text-gray-700">
                            {c.profile?.full_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {c.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {user && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComment[post.id] || ''}
                        onChange={(e) =>
                          setNewComment((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) =>
                          e.key === 'Enter' &&
                          handleComment(post.id)
                        }
                        placeholder="Escribe un comentario..."
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DADE2]"
                      />

                      <button
                        onClick={() => handleComment(post.id)}
                        className="p-2 rounded-xl text-white"
                        style={{ background: '#5DADE2' }}
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}