import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

export default function AccountManagement() {
    const { user, profile, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#050514] text-white font-arabic" dir="rtl">
            <Header />

            <main className="container mx-auto px-6 pt-32 pb-20 max-w-4xl">
                <h1 className="text-4xl font-bold mb-10 pb-4 border-b border-white/10">الحساب</h1>

                <div className="space-y-12">
                    {/* Membership & Billing */}
                    <section className="grid md:grid-cols-3 gap-8">
                        <div className="text-gray-400 text-lg">العضوية والفواتير</div>
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                                <div>
                                    <p className="text-white font-bold">{user.email}</p>
                                    <p className="text-gray-500 text-sm">كلمة المرور: ••••••••</p>
                                </div>
                                <button className="text-blue-400 hover:text-blue-300 text-sm">تغيير البيانات</button>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full bg-red-600/10 text-red-500 hover:bg-red-600/20 py-3 rounded-xl transition-all border border-red-500/20"
                            >
                                تسجيل الخروج من جميع الأجهزة
                            </button>
                        </div>
                    </section>

                    <hr className="border-white/5" />

                    {/* Plan Details */}
                    <section className="grid md:grid-cols-3 gap-8">
                        <div className="text-gray-400 text-lg">تفاصيل الخطة</div>
                        <div className="md:col-span-2 flex justify-between items-center bg-white/5 p-4 rounded-xl">
                            <div>
                                <span className="bg-blue-600 text-[10px] px-2 py-0.5 rounded mr-2 align-middle">PREMIUM</span>
                                <span className="font-bold">خطة الترا HD</span>
                            </div>
                            <button className="text-blue-400 hover:text-blue-300 text-sm">تغيير الخطة</button>
                        </div>
                    </section>

                    <hr className="border-white/5" />

                    {/* Profile Details */}
                    <section className="grid md:grid-cols-3 gap-8">
                        <div className="text-gray-400 text-lg">الملف الشخصي</div>
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl">
                                <div className="w-12 h-12 rounded bg-blue-600 flex items-center justify-center font-bold">
                                    {profile?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <p className="font-bold">{profile?.name || 'مستخدم'}</p>
                                    <p className="text-gray-500 text-sm">تم الإنضمام في {profile?.createdAt?.toDate().toLocaleDateString('ar-EG') || '2026'}</p>
                                </div>
                                <button
                                    onClick={() => navigate('/profile-setup')}
                                    className="mr-auto text-blue-400 hover:text-blue-300 text-sm"
                                >
                                    تعديل الملف
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
