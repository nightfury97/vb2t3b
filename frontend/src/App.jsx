import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Users, LayoutDashboard, MessageSquare, LogIn, LogOut } from 'lucide-react';

import Members from './pages/Members';
import Activities from './pages/Activities';
import Guestbook from './pages/Guestbook';
import Home from './pages/Home';
import Login from './pages/Login';
import { AuthProvider, AuthContext } from './pages/AuthContext'; // Đảm bảo đường dẫn đúng

// Tách phần giao diện chính ra một Component riêng để có thể dùng được AuthContext
const AppContent = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Xóa token cũ
    navigate('/login'); // Đẩy về trang đăng nhập
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 md:pt-16">
      {/* Navbar cho Máy tính */}
      <nav className="hidden md:flex fixed top-0 w-full bg-white shadow-sm z-50 justify-between items-center px-8 py-3">
        {/* Logo hoặc Tên lớp */}
        <div className="font-black text-blue-600 text-xl tracking-tight">
          VB2-T3B-T04
        </div>

        {/* Menu giữa */}
        <div className="flex gap-8">
          {/* <NavLink to="/members" icon={<Users size={20}/>} text="Thành viên" /> */}
          <NavLink to="/activities" icon={<LayoutDashboard size={20}/>} text="Hoạt động" />
          <NavLink to="/guestbook" icon={<MessageSquare size={20}/>} text="Lưu bút" />
        </div>
        
        {/* Góc phải: Đăng nhập / User Profile */}
        <div className="flex items-center">
          {user ? (
            <div className="flex items-center gap-4 border-l pl-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {user.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-bold text-slate-700">{user.fullname}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-500 transition-colors"
                title="Đăng xuất"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors">
              <LogIn size={18}/> Đăng nhập
            </Link>
          )}
        </div>
      </nav>

      {/* Nội dung các trang */}
      <div className="max-w-md mx-auto md:max-w-4xl px-4 py-6 mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/members" element={<Members />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/guestbook" element={<Guestbook />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>

      {/* Navbar cho Điện thoại */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t flex justify-around py-3 z-50 pb-safe">
        {/* <MobileLink to="/members" icon={<Users size={24}/>} label="Lớp" /> */}
        <MobileLink to="/activities" icon={<LayoutDashboard size={24}/>} label="Tường" />
        <MobileLink to="/guestbook" icon={<MessageSquare size={24}/>} label="Lưu bút" />
        
        {user ? (
           <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-slate-500 hover:text-red-500">
             <LogOut size={24}/> <span className="text-[10px] uppercase font-bold">Thoát</span>
           </button>
        ) : (
          <MobileLink to="/login" icon={<LogIn size={24}/>} label="Login" />
        )}
      </nav>
    </div>
  );
};

// Component Gốc
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

// Component phụ cho Menu
const NavLink = ({ to, icon, text }) => (
  <Link to={to} className="flex items-center gap-2 font-medium text-slate-600 hover:text-blue-600 transition-colors">
    {icon} {text}
  </Link>
);

const MobileLink = ({ to, icon, label }) => (
  <Link to={to} className="flex flex-col items-center gap-1 text-slate-500 hover:text-blue-600">
    {icon} <span className="text-[10px] uppercase font-bold">{label}</span>
  </Link>
);

export default App;