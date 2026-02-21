import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdInstallMobile, MdClose, MdShare } from 'react-icons/md';
import { AiOutlinePlusSquare } from 'react-icons/ai';
import logo from '../assets/Logo.png';

const InstallPWA = () => {
    const [installPrompt, setInstallPrompt] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [platform, setPlatform] = useState('other');

    useEffect(() => {
        // Detect Platform
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent)) {
            setPlatform('ios');
        } else if (/android/.test(userAgent)) {
            setPlatform('android');
        } else if (/windows/.test(userAgent)) {
            setPlatform('windows');
        }

        // Listen for PWA Install Prompt (Android/Windows)
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setInstallPrompt(e);
            // Show modal automatically after 5 seconds of browsing
            setTimeout(() => {
                const isInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
                if (!isInstalled) setShowModal(true);
            }, 5000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // For iOS, show modal manually since there's no native prompt
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const isInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

        if (isIOS && !isInstalled) {
            setTimeout(() => setShowModal(true), 5000);
        }

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
            setInstallPrompt(null);
            setShowModal(false);
        }
    };

    if (!showModal) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="fixed bottom-24 lg:bottom-8 left-4 right-4 z-[100] sm:left-auto sm:right-8 sm:w-[400px]"
            >
                <div className="bg-[#12122a] border border-yellow-400/20 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-yellow-400/10 rounded-full blur-[80px]" />

                    <button
                        onClick={() => setShowModal(false)}
                        className="absolute top-4 left-4 p-2 text-gray-400 hover:text-white transition rounded-full hover:bg-white/5"
                    >
                        <MdClose className="text-xl" />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-0.5 shadow-lg mb-4"
                        >
                            <div className="w-full h-full bg-[#12122a] rounded-[14px] flex items-center justify-center overflow-hidden p-2">
                                <img src={logo} alt="TagFilm" className="w-full h-full object-contain" />
                            </div>
                        </motion.div>

                        <h3 className="text-xl font-black text-white mb-2 font-arabic">تثبيت تطبيق TagFilm</h3>
                        <p className="text-gray-400 font-arabic text-sm leading-relaxed mb-6">
                            استمتع بتجربة أسرع وسهولة أكبر في الوصول لأفلامك المفضلة من خلال تثبيت التطبيق على جهازك
                        </p>

                        {platform === 'ios' ? (
                            <div className="w-full space-y-4">
                                <div className="bg-white/5 rounded-xl p-4 text-right dir-rtl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                            <MdShare className="text-blue-500 text-lg" />
                                        </div>
                                        <span className="text-white text-sm font-arabic font-bold">1. اضغط على أيقونة "مشاركة" بالأسفل</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                            <AiOutlinePlusSquare className="text-green-500 text-lg" />
                                        </div>
                                        <span className="text-white text-sm font-arabic font-bold">2. اختر "إضافة إلى الصفحة الرئيسية"</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleInstallClick}
                                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-yellow-400/20 hover:scale-[1.02] transition-transform font-arabic"
                            >
                                <MdInstallMobile className="text-2xl" />
                                تثبيت الآن
                            </button>
                        )}

                        <button
                            onClick={() => setShowModal(false)}
                            className="mt-4 text-gray-500 text-xs font-arabic hover:text-gray-300 transition"
                        >
                            ليس الآن، ربما لاحقاً
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InstallPWA;
