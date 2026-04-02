import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiUserPlus, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,50,1)_0%,rgba(5,5,20,1)_100%)]"></div>
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1],
                }}
                transition={{ duration: 12, repeat: Infinity }}
                className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-orange-500/10 blur-[120px] rounded-full"
            ></motion.div>
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.05, 0.15, 0.05],
                }}
                transition={{ duration: 18, repeat: Infinity, delay: 1 }}
                className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-yellow-600/10 blur-[150px] rounded-full"
            ></motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="z-10 w-full max-w-sm sm:max-w-md p-8 sm:p-12 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] mx-4 relative group hover:border-yellow-400/20 transition-colors duration-500"
            >
                <div className="flex flex-col items-center mb-10">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="relative"
                    >
                        <img src={logo} alt="TagFilm Logo" className="h-20 mb-8 drop-shadow-[0_0_20px_rgba(255,215,0,0.3)]" />
                    </motion.div>
                    <h1 className="text-4xl font-black text-white mb-3 font-arabic text-center tracking-tight">إنشاء حساب</h1>
                    <p className="text-gray-400 text-sm font-arabic font-medium opacity-80 text-center">انضم لعالم من الترفيه اللامحدود</p>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-2xl mb-6 text-sm font-arabic text-center font-bold"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-gray-300 text-xs font-bold uppercase tracking-widest mr-1 font-arabic opacity-60">البريد الإلكتروني</label>
                        <div className="relative group/field">
                            <FiMail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/field:text-yellow-400 transition-colors" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pr-12 pl-4 py-4 text-white focus:outline-none focus:border-yellow-400/50 focus:bg-white/[0.06] transition-all font-arabic text-left text-sm"
                                placeholder="name@email.com"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-gray-300 text-xs font-bold uppercase tracking-widest mr-1 font-arabic opacity-60">كلمة المرور</label>
                        <div className="relative group/field">
                            <FiLock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/field:text-yellow-400 transition-colors" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pr-12 pl-12 py-4 text-white focus:outline-none focus:border-yellow-400/50 focus:bg-white/[0.06] transition-all font-arabic text-left text-sm"
                                placeholder="••••••••"
                                dir="ltr"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-gray-300 text-xs font-bold uppercase tracking-widest mr-1 font-arabic opacity-60">تأكيد كلمة المرور</label>
                        <div className="relative group/field">
                            <FiLock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/field:text-yellow-400 transition-colors" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pr-12 pl-4 py-4 text-white focus:outline-none focus:border-yellow-400/50 focus:bg-white/[0.06] transition-all font-arabic text-left text-sm"
                                placeholder="••••••••"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        type="submit"
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black py-4.5 rounded-2xl shadow-[0_10px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_15px_30px_rgba(245,158,11,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-arabic text-lg mt-6 flex items-center justify-center gap-3 relative overflow-hidden group/btn"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                        <span className="relative z-10">{loading ? 'جاري التحميل...' : 'إنشاء حساب'}</span>
                        {!loading && <FiUserPlus className="relative z-10 text-xl" />}
                    </motion.button>
                </form>

                <div className="mt-10 pt-8 border-t border-white/5 text-center">
                    <p className="text-gray-400 font-arabic text-sm">
                        لديك حساب بالفعل؟{' '}
                        <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-black transition-colors ml-1 border-b border-yellow-400/30">
                            تسجيل الدخول
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
