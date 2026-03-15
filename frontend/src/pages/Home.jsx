
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Heart, Users, Sparkles, MapPin } from 'lucide-react';

const Home = () => {
  return (
    <div className="animate-fadeIn">
      {/* Hero Section: Ấn tượng đầu tiên */}
      <section className="relative h-[80vh] flex items-center justify-center text-white overflow-hidden rounded-3xl mx-2 mt-2">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1523050853064-8035655880f9?auto=format&fit=crop&q=80" 
            className="w-full h-full object-cover brightness-[0.4]"
            alt="Class background"
          />
        </div>
        
        <div className="relative z-10 text-center px-4">
          <span className="bg-blue-600/30 backdrop-blur-md border border-white/20 px-4 py-1 rounded-full text-sm font-medium mb-4 inline-block">
            Niên khóa 2024 - 2026
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            Kỷ Niệm <span className="text-blue-400">Chúng Ta</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-8 font-light leading-relaxed">
            Nơi thời gian dừng lại, nơi những nụ cười được lưu giữ mãi mãi trong từng khung hình.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/activities" className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
              Xem hoạt động <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Thông tin nhanh (Stats) */}
      <section className="py-12 px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {/* <StatCard icon={<Users className="text-blue-500" />} count="40" label="Thành viên" /> */}
          <StatCard icon={<Heart className="text-red-500" />} count="1000+" label="Kỷ niệm" />
          <StatCard icon={<Sparkles className="text-yellow-500" />} count="03" label="Năm gắn bó" />
          <StatCard icon={<MapPin className="text-green-500" />} count="A1" label="Phòng học" />
        </div>
      </section>

      {/* Thông điệp từ Lớp trưởng/Tập thể */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-8">Về Lớp Chúng Mình</h2>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 italic text-slate-600 leading-loose">
          "Có những người không phải là gia đình, nhưng lại cùng ta trải qua những ngày tháng rực rỡ nhất. 
          Lớp chúng mình không chỉ là một tập thể, đó là một phần thanh xuân không thể thay thế."
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ icon, count, label }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-50 text-center hover:translate-y-[-5px] transition-transform">
    <div className="flex justify-center mb-2">{icon}</div>
    <div className="text-2xl font-black text-slate-800">{count}</div>
    <div className="text-slate-500 text-sm">{label}</div>
  </div>
);

export default Home;