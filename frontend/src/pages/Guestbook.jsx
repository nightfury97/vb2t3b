import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Heart, Send, Loader2, Lock } from 'lucide-react';
import { AuthContext } from './AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const Guestbook = () => {
  const [wishes, setWishes] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Lấy thông tin người dùng đang đăng nhập
  const { token, user } = useContext(AuthContext);

  // Mảng màu sắc cho các tờ giấy note
  const colors = [
    'bg-yellow-100', 'bg-blue-100', 'bg-green-100', 
    'bg-pink-100', 'bg-purple-100', 'bg-orange-100'
  ];
  
  // Mảng độ nghiêng ngẫu nhiên cho giấy note tự nhiên hơn
  const rotations = ['-rotate-2', 'rotate-2', '-rotate-1', 'rotate-1', '-rotate-3', 'rotate-3'];

  const fetchWishes = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/guestbook`);
      setWishes(res.data);
    } catch (err) {
      console.error("Lỗi tải lưu bút:", err);
    }
  };

  useEffect(() => { fetchWishes(); }, []);

  const sendWish = async (e) => {
    e.preventDefault();
    if (!token) return alert("Bạn cần đăng nhập để gửi lời chúc!");
    if (!msg.trim()) return;

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/guestbook`, 
        { message: msg, sender_name: user.fullname }, // Gửi kèm tên người gửi
        { headers: { 'Authorization': `Bearer ${token}` } } // Gửi kèm thẻ token
      );
      setMsg(""); // Xóa rỗng ô nhập
      fetchWishes(); // Tải lại danh sách
    } catch (err) {
      alert(err.response?.data?.error || "Có lỗi xảy ra khi gửi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-800 flex justify-center items-center gap-2">
          Lưu Bút Kỷ Niệm <Heart className="text-red-500 fill-red-500" />
        </h2>
        <p className="text-slate-500 mt-2 text-sm">Nơi lưu giữ những lời nhắn nhủ chân thành nhất</p>
      </div>

      {/* Cảnh báo chưa đăng nhập */}
      {!token && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-2xl mb-6 text-center text-sm shadow-sm flex items-center justify-center gap-2">
          <Lock size={16} /> Vui lòng <strong>Đăng nhập</strong> để viết lưu bút cho lớp mình nhé!
        </div>
      )}

      {/* Khu vực viết lưu bút mới */}
      <div className={`bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-10 relative overflow-hidden ${!token ? 'opacity-60 pointer-events-none' : ''}`}>
        {/* Nếp gấp trang trí */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 transform rotate-45 translate-x-8 -translate-y-8 border-l border-b border-blue-100"></div>
        
        <form onSubmit={sendWish} className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              {user ? user.fullname.charAt(0).toUpperCase() : '?'}
            </div>
            {user ? `Từ: ${user.fullname}` : 'Bạn đang ẩn danh'}
          </div>

          <textarea 
            placeholder="Hãy viết gì đó thật ý nghĩa để sau này đọc lại còn nhớ nhau..." 
            className="w-full border-none bg-slate-50 rounded-2xl p-4 focus:ring-2 focus:ring-blue-400 outline-none resize-none min-h-[100px] text-slate-700 leading-relaxed"
            value={msg} 
            onChange={(e) => setMsg(e.target.value)}
            disabled={!token}
          />
          
          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={loading || !token || !msg.trim()}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18}/> : <Send size={18}/>}
              Gửi lưu bút
            </button>
          </div>
        </form>
      </div>

      {/* Bảng hiển thị Sticky Notes */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {wishes.map((item, index) => {
          const colorClass = colors[index % colors.length];
          const rotateClass = rotations[index % rotations.length];

          return (
            <div 
              key={item.id} 
              className={`${colorClass} ${rotateClass} p-5 shadow-md hover:rotate-0 hover:scale-105 hover:shadow-lg transition-all duration-300 min-h-[160px] flex flex-col relative group`}
              style={{ borderRadius: '2px 15px 5px 15px' }}
            >
              {/* Đinh ghim trang trí */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-400 shadow-sm opacity-80 border border-red-500/20 z-10"></div>
              
              {/* Nội dung lời chúc */}
              <div className="mt-4 flex-grow">
                <p className="text-slate-800 text-sm italic leading-relaxed whitespace-pre-wrap font-medium">
                  "{item.message}"
                </p>
              </div>
              
              {/* --- PHẦN NGƯỜI VIẾT ĐÃ SỬA: HIỂN THỊ TÊN ĐẦY ĐỦ --- */}
              {/* --- PHẦN NGƯỜI VIẾT --- */}
              <div className="mt-4 pt-3 border-t border-black/10 flex items-start gap-3">
                
                {/* Avatar tròn (Nếu không có tên thì để chữ A - Ẩn danh) */}
                <div className="w-8 h-8 rounded-full bg-white/60 flex-shrink-0 flex items-center justify-center text-xs font-black text-slate-700 shadow-sm border border-white/50">
                  {item.sender_name ? item.sender_name.charAt(0).toUpperCase() : 'A'}
                </div>
                
                {/* Thông tin: Tên (Thêm || 'Ẩn danh') + Ngày tháng */}
                <div className="flex flex-col justify-center">
                  <p className="font-bold text-slate-900 text-xs leading-snug">
                    {item.sender_name || 'Ẩn danh'} 
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5 opacity-50 group-hover:opacity-100 transition-opacity">
                    {new Date(item.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                
              </div>
              {/* ---------------------------------------- */}

            </div>
          )
        })}
      </div>
      
      {wishes.length === 0 && (
        <div className="text-center text-slate-400 py-10 italic">
          Chưa có lưu bút nào. Hãy là người mở bát nhé!
        </div>
      )}
    </div>
  );
};

export default Guestbook;