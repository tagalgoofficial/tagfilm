import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import MobileNav from './components/MobileNav';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Carousel from './components/Carousel';
import HeroBanner from './components/HeroBanner';
import MovieDetails from './pages/MovieDetails';
import CategoryPage from './pages/CategoryPage';
import SeriesPage from './pages/SeriesPage';
import Favorites from './pages/Favorites';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfileSetup from './pages/ProfileSetup';
import AccountManagement from './pages/AccountManagement';
import ProfilesManagement from './pages/ProfilesManagement';
import Profile from './pages/Profile';
import ContinueWatching from './components/ContinueWatching';
import Recommendations from './components/Recommendations';
import Search from './pages/Search';
import ComingSoon from './components/ComingSoon';
import SplashScreen from './components/SplashScreen';
import InstallPWA from './components/InstallPWA';
import { SectionSkeleton } from './components/Skeleton';
import { FavoritesProvider } from './context/FavoritesContext';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import MoviesManager from './admin/pages/MoviesManager';
import SeriesManager from './admin/pages/SeriesManager';
import CategoriesManager from './admin/pages/CategoriesManager';
import MovieCategoriesManager from './admin/pages/MovieCategoriesManager';
import SectionsManager from './admin/pages/SectionsManager';
import FeaturedManager from './admin/pages/FeaturedManager';
import { getSections, initDefaultSections } from './firebase/sectionsService';
import { initDefaultCategories } from './firebase/categoriesService';
import { getFeatured } from './firebase/featuredService';
import logo from './assets/Logo.png';
import './index.css';

function HomePage() {
  const [sections, setSections] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroLoading, setHeroLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await Promise.all([initDefaultCategories(), initDefaultSections()]);
      const [s, f] = await Promise.all([getSections(), getFeatured()]);
      // تصفية الأقسام النشطة فقط
      const activeSections = s.filter(section => section.isActive !== false);
      setSections(activeSections);
      setFeatured(f);
      setLoading(false);
      setHeroLoading(false);
    };
    init();
  }, []);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden" style={{ background: 'var(--bg-site)' }} lang="ar">
      {/* Fixed Header overlays the hero */}
      <Header />

      {/* Hero Banner — full screen */}
      {heroLoading ? (
        <div className="w-full animate-pulse" style={{ height: '100vh', background: 'linear-gradient(135deg, #0a0a1f, #1a1a3e)' }} />
      ) : (
        <HeroBanner items={featured} />
      )}

      {/* Sections Carousels */}
      <div className="space-y-24 py-20 pb-40">
        <ContinueWatching />
        <Recommendations />
        <ComingSoon />
        {loading ? (
          <>
            <SectionSkeleton />
            <SectionSkeleton />
          </>
        ) : sections.length > 0 ? (
          sections.map(section => (
            <Carousel
              key={section.id}
              title={section.title}
              titleAr={section.titleEn}
              movies={section.items || []}
              loading={false}
            />
          ))
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 font-arabic text-lg">جارٍ إضافة المزيد من المحتوى قريباً، ابقَ متيقظاً!</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }} className="py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="flex items-center gap-2.5">
              <img src={logo} alt="TagFilm Logo" className="h-[140px] w-auto object-contain" />
            </div>
            <p className="text-gray-500 max-w-md font-arabic text-sm">وجهتك المفضلة لمشاهدة أحدث الأفلام والمسلسلات بجودة عالية</p>
            <p className="text-gray-600 text-xs">© 2026 TagFilm. جميع الحقوق محفوظة</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  return (
    <AuthProvider>
      <FavoritesProvider>
        {!isSplashFinished && <SplashScreen onFinish={() => setIsSplashFinished(true)} />}

        <div
          className={`min-h-screen flex flex-col pb-24 lg:pb-0 bg-[#050514] text-white overflow-x-hidden transition-opacity duration-1000 ${isSplashFinished ? 'opacity-100' : 'opacity-0'}`}
          style={{ fontFamily: 'Inter, Tajawal, sans-serif' }}
          dir="rtl"
        >
          <div className="flex-grow w-full max-w-full">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="/series/:id" element={<SeriesPage />} />
              <Route path="/category/:categoryId" element={<CategoryPage />} />
              <Route path="/category/:categoryId/:subcategory" element={<CategoryPage />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile-setup" element={<ProfileSetup />} />
              <Route path="/account" element={<AccountManagement />} />
              <Route path="/profiles" element={<ProfilesManagement />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/search" element={<Search />} />

              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="movies" element={<MoviesManager />} />
                <Route path="series" element={<SeriesManager />} />
                <Route path="categories" element={<CategoriesManager />} />
                <Route path="movie-categories" element={<MovieCategoriesManager />} />
                <Route path="sections" element={<SectionsManager />} />
                <Route path="featured" element={<FeaturedManager />} />
              </Route>
            </Routes>
          </div>
          <MobileNav />
          <InstallPWA />
        </div>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;
