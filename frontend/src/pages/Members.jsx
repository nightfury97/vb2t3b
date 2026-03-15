import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, UserCircle2, Loader2 } from 'lucide-react';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
          const res = await axios.get(`${API_BASE}/api/members`);
          setMembers(res.data);
      } catch (err) {
        console.error("Lỗi lấy danh sách lớp:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const filteredMembers = members.filter(m => 
    m.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Tiêu đề & Tìm kiếm */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-widest mb-4">
            Danh sách Thành viên <span className="text-blue-600">(80)</span>
          </h2>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Nhập tên bạn muốn tìm..."
              className="w-full pl-12 pr-4 py-3 rounded-full border-none shadow-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : (
          /* Grid 8 cột trên Desktop, 4 cột trên Tablet, 3 cột trên Mobile */
          /* 10 hàng x 8 cột = 80 người trên màn hình lớn */
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
            {filteredMembers.map((member) => (
              <div 
                key={member.id} 
                className="group relative flex flex-col items-center bg-white p-2 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100"
              >
                {/* Khung ảnh */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100">
                  {member.avatar_url ? (
                    <img 
                      src={member.avatar_url} 
                      alt={member.fullname}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <UserCircle2 size={40} />
                    </div>
                  )}
                  
                  {/* Overlay khi di chuột vào (Chỉ hiện trên Desktop) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-2">
                    <span className="text-[10px] text-white font-bold truncate">{member.nickname}</span>
                  </div>
                </div>

                {/* Tên hiển thị bên dưới ảnh */}
                <div className="mt-2 w-full text-center">
                  <p className="text-[11px] md:text-xs font-bold text-slate-700 truncate px-1">
                    {member.fullname.split(' ').pop()} {/* Chỉ hiện Tên để tiết kiệm diện tích */}
                  </p>
                  <p className="hidden md:block text-[9px] text-slate-400 truncate uppercase tracking-tighter">
                    {member.fullname}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredMembers.length === 0 && !loading && (
          <div className="text-center py-20 text-slate-400 italic">
            Không tìm thấy bạn học nào tên là "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;