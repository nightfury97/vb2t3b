import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { KeyRound, User, UserPlus, LogIn } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', fullname: '' });
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        // Đăng nhập
        const res = await axios.post(`${API_BASE}/api/auth/login`, {
          username: formData.username,
          password: formData.password
        });
        login(res.data.token, res.data.user);
        navigate('/'); // Chuyển về trang chủ
      } else {
        // Đăng ký
        await axios.post(`${API_BASE}/api/auth/register`, formData);
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        setIsLogin(true); // Chuyển về tab đăng nhập
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-800">
            {isLogin ? 'Chào mừng trở lại!' : 'Tham gia lớp mình'}
          </h2>
          <p className="text-slate-500 mt-2">
            {isLogin ? 'Đăng nhập để xem ảnh lớp nhé' : 'Tạo tài khoản để đăng bài và bình luận'}
          </p>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-4 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" name="fullname" placeholder="Họ và tên thật của bạn" required={!isLogin}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 border border-slate-200"
              />
            </div>
          )}
          
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" name="username" placeholder="Tên đăng nhập" required
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 border border-slate-200"
            />
          </div>

          <div className="relative">
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="password" name="password" placeholder="Mật khẩu" required
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 border border-slate-200"
            />
          </div>

          <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            {isLogin ? <><LogIn size={20}/> Đăng nhập</> : <><UserPlus size={20}/> Đăng ký</>}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-blue-600 font-bold hover:underline"
          >
            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;