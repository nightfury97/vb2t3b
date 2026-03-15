import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Send, Image as ImageIcon, MessageCircle, Clock, Loader2, Heart } from 'lucide-react';
import { AuthContext } from './AuthContext'; // Nhớ sửa lại đường dẫn cho đúng thư mục của bạn

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// ==========================================
// COMPONENT: BÌNH LUẬN
// ==========================================
const CommentSection = ({ activityId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Gọi token và user ở ĐÂY (bên trong component)
  const { token, user } = useContext(AuthContext);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/activities/${activityId}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error("Lỗi tải bình luận:", err);
    }
  };

  useEffect(() => { fetchComments(); }, [activityId]);

  const handleSend = async () => {
    if (!token) return alert("Bạn cần đăng nhập để bình luận!");
    if (!newComment.trim() || loading) return;
    
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/activities/${activityId}/comments`, 
        {
          content: newComment,
          author_name: user?.fullname || "Bạn học" // Lấy tên thật của người dùng
        }, 
        {
          headers: { 'Authorization': `Bearer ${token}` } // Gửi thẻ Token
        }
      );
      setNewComment("");
      await fetchComments();
    } catch (err) {
      alert("Không thể gửi bình luận");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2 bg-slate-50 p-4 rounded-b-2xl border-t border-slate-100">
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        {comments.map(c => (
          <div key={c.id} className="text-sm bg-white p-2 rounded-lg shadow-sm">
            <span className="font-bold text-blue-600 mr-2">{c.author_name}:</span>
            <span className="text-slate-600">{c.content}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={token ? "Viết bình luận..." : "Đăng nhập để bình luận"}
          disabled={!token} // Khóa ô nhập nếu chưa đăng nhập
          className="flex-grow text-xs p-2 rounded-full border border-slate-200 focus:ring-2 focus:ring-blue-400 outline-none px-4 disabled:bg-slate-200"
        />
        <button 
          onClick={handleSend} 
          disabled={loading || !token}
          className="text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENT: TRANG HOẠT ĐỘNG CHÍNH
// ==========================================
const Activities = () => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openComments, setOpenComments] = useState({});

  // Gọi token và user ở ĐÂY
  const { token, user } = useContext(AuthContext);

  const fetchPosts = async () => {
    const res = await axios.get(`${API_BASE}/api/activities`);
    setPosts(res.data);
  };

  useEffect(() => { fetchPosts(); }, []);

  const toggleComments = (postId) => {
    setOpenComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Hàm Đăng bài
  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!token) return alert("Vui lòng đăng nhập để đăng bài!");
  if (!content && files.length === 0) return;

  const formData = new FormData();
  formData.append('content', content);
  
  // Vòng lặp nhét tất cả các file vào key 'images'
  files.forEach(file => {
      formData.append('images', file);
  });

  setLoading(true);
  try {
    await axios.post(`${API_BASE}/api/activities`, formData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setContent("");
    setFiles([]); // Xóa rỗng danh sách file sau khi đăng
    fetchPosts();
  } catch (err) { 
    alert(err.response?.data?.error || "Lỗi đăng bài!"); 
  } finally { 
    setLoading(false); 
  }
};
// 3. Hàm phụ trợ để phân tích chuỗi JSON ảnh từ DB trả về
const parseImages = (urls) => {
  if (!urls) return [];
  try { return typeof urls === 'string' ? JSON.parse(urls) : urls; } 
  catch { return []; }
};

  // Hàm Thả tim
  const handleLike = async (postId) => {
    if (!token) return alert("Vui lòng đăng nhập để thả tim!");

    try {
      // Với post request không có body, gửi tham số thứ 2 là {} (object rỗng)
      const res = await axios.post(`${API_BASE}/api/activities/${postId}/like`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.data.success) {
        setPosts(posts.map(post => 
          post.id === postId ? { ...post, likes_count: res.data.likes_count } : post
        ));
      }
    } catch (err) {
      console.error("Không thể thả tim:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 px-4">
      
      {/* Cảnh báo nếu chưa đăng nhập */}
      {!token && (
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-2xl mb-6 text-center text-sm border border-yellow-200 shadow-sm">
          Bạn đang xem dưới tư cách khách. Vui lòng <strong>Đăng nhập</strong> để đăng bài, thả tim và bình luận nhé!
        </div>
      )}

      {/* Form Đăng bài */}
      <div className={`bg-white rounded-2xl shadow-sm p-4 mb-6 border border-slate-200 ${!token ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex-shrink-0 flex items-center justify-center text-white font-bold">
            {user ? user.fullname.charAt(0).toUpperCase() : 'L'}
          </div>
          <textarea
            placeholder="Hôm nay lớp mình có gì vui?"
            className="w-full bg-slate-50 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none border-none"
            rows="3"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-slate-50">
          <label className="flex items-center gap-2 text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-xl cursor-pointer transition-all">
  <ImageIcon size={20} className="text-green-500" />
  <span className="text-sm font-semibold">Ảnh kỷ niệm</span>
  <input 
    type="file" 
    multiple // Thêm chữ này để cho phép quét đen chọn nhiều ảnh
    className="hidden" 
    onChange={(e) => setFiles(Array.from(e.target.files))} // Chuyển FileList thành Array
    accept="image/*, video/*" 
  />
</label>

          <button
            onClick={handleSubmit}
            disabled={loading || !token}
            className="bg-blue-600 text-white px-8 py-2 rounded-full font-bold text-sm hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} Đăng ngay
          </button>
        </div>
        {files.length > 0 && (
  <p className="text-xs text-blue-500 mt-3 px-2 flex items-center gap-1 font-medium">
    📎 Đã chọn {files.length} tệp
  </p>
)}
      </div>

      {/* Danh sách bài đăng */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:shadow-md">
            <div className="p-4 flex items-center gap-3">
              <div className="p-4 flex items-center gap-3">
        {/* Avatar: Lấy chữ cái đầu tiên của người đăng */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 uppercase font-bold text-sm">
          {post.author_name ? post.author_name.charAt(0) : 'A1'}
        </div>
        
        <div>
          {/* Tên người đăng bài */}
          <h4 className="font-bold text-slate-800 text-sm">
            {post.author_name || "Thành viên lớp"}
          </h4>
          <div className="flex items-center gap-1 text-slate-400 text-[10px] font-medium uppercase tracking-wider mt-0.5">
            <Clock size={10} /> {new Date(post.created_at).toLocaleString('vi-VN')}
          </div>
        </div>
      </div>
            </div>
            
            <div className="px-5 pb-4 text-slate-700 text-[15px] leading-relaxed">
              {post.content}
            </div>

            {(() => {
  const images = parseImages(post.image_urls);
  if (images.length === 0) return null;

  return (
    <div className={`px-2 pb-2 grid gap-1 mt-3 ${
      images.length === 1 ? 'grid-cols-1' : 
      images.length === 2 ? 'grid-cols-2' : 
      'grid-cols-2 md:grid-cols-3' // Nếu 3 ảnh trở lên thì chia 3 cột
    }`}>
      {images.map((img, idx) => (
        <img 
          key={idx} 
          src={img} 
          className={`w-full object-cover rounded-xl border border-slate-100 ${
            images.length === 1 ? 'max-h-[600px]' : 'h-48'
          }`} 
          alt={`Activity ${idx + 1}`} 
        />
      ))}
    </div>
  );
})()}

            {/* Phần tương tác: Thích & Bình luận */}
            <div className="px-5 py-3 flex gap-6 text-slate-500 border-t border-slate-50">
              <button 
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-2 text-xs font-bold transition-colors group ${post.likes_count > 0 ? 'text-red-500' : 'hover:text-red-500'}`}
              >
                <Heart 
                  size={18} 
                  className={`${post.likes_count > 0 ? 'fill-red-500' : 'group-hover:scale-110 transition-transform'}`} 
                /> 
                <span>{post.likes_count || 0} Thích</span>
              </button>
              
              <button 
                onClick={() => toggleComments(post.id)}
                className={`flex items-center gap-2 text-xs font-bold transition-colors ${openComments[post.id] ? 'text-blue-600' : 'hover:text-blue-600'}`}
              >
                <MessageCircle size={18} className={`${openComments[post.id] ? 'fill-blue-100' : ''}`} /> 
                <span>Bình luận</span>
              </button>
            </div>

            {/* Chỉ hiện comment khi nhấn nút */}
            {openComments[post.id] && (
              <CommentSection activityId={post.id} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Activities;