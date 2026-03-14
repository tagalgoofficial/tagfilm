import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/Logo.png';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('كلمات المرور غير متطابقة');
        }

        try {
            setError('');
            setLoading(true);
            await signup(email, password);
            navigate('/profile-setup');
        } catch (err) {
            setError('فشل إنشاء الحساب. ' + err.message);
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#050514]">
            {/* Background decoration */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>

            <div className="z-10 w-full max-w-md p-8 sm:p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl mx-4">
                <div className="flex flex-col items-center mb-8">
                    <img src={logo} alt="TagFilm Logo" className="h-20 mb-6 drop-shadow-2xl" />
                    <h1 className="text-3xl font-bold text-white mb-2 font-arabic">إنشاء حساب جديد</h1>
                    <p className="text-gray-400 text-sm font-arabic">انضم إلينا اليوم واستمتع بأفضل تجربة مشاهدة</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-sm font-arabic text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-gray-400 text-sm mb-2 mr-1 font-arabic">البريد الإلكتروني</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-arabic text-left"
                            placeholder="example@mail.com"
                            dir="ltr"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-2 mr-1 font-arabic">كلمة المرور</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-arabic text-left"
                            placeholder="••••••••"
                            dir="ltr"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-2 mr-1 font-arabic">تأكيد كلمة المرور</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-arabic text-left"
                            placeholder="••••••••"
                            dir="ltr"
                        />
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-arabic text-lg mt-4"
                    >
                        {loading ? 'جاري التحميل...' : 'إنشاء الحساب'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-gray-400 font-arabic">
                        لديك حساب بالفعل؟{' '}
                        <Link to="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                            تسجيل الدخول
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
