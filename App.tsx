
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import EarningCalculator from './components/EarningCalculator';
import Platforms from './components/Platforms';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import Auth, { UserData } from './components/Auth';

export interface ApkInfo {
  url: string;
  version: string;
  size: string;
  updatedAt: string;
  fileName?: string;
  localBlob?: string;
  earningRate: number; // VNĐ/giờ
}

const App: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [view, setView] = useState<'landing' | 'auth' | 'dashboard'>('landing');
  const [showAdmin, setShowAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const isAdmin = currentUser?.username === 'admin';
  
  const [apkInfo, setApkInfo] = useState<ApkInfo>({
    url: '/app.apk',
    version: '2.5.0',
    size: '18.2 MB',
    updatedAt: 'Vừa cập nhật',
    earningRate: 2000 
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    const savedInfo = localStorage.getItem('zenith_config_v5');
    if (savedInfo) {
      setApkInfo(JSON.parse(savedInfo));
    }

    // Check session
    const session = localStorage.getItem('zenith_session');
    if (session) {
      const parsed = JSON.parse(session) as UserData;
      setCurrentUser(parsed);
      setShowAdmin(false);
      setView('dashboard');
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = (user: UserData) => {
    setCurrentUser(user);
    localStorage.setItem('zenith_session', JSON.stringify(user));
    const isAdmin = user.username === 'admin';
    if (isAdmin) {
      localStorage.setItem('zenith_is_admin', 'true');
    } else {
      localStorage.removeItem('zenith_is_admin');
    }
    // Không tự bật AdminPanel, để admin tự bấm nút
    setShowAdmin(false);
    setView('dashboard');
  };

  const handleHome = () => {
    setView('landing');
    // Quay về landing nhưng không tự bật AdminPanel; admin vẫn thấy nút mở thủ công
    setShowAdmin(false);
  };

  const handleOpenAdmin = () => {
    setShowAdmin(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowAdmin(false);
    localStorage.removeItem('zenith_session');
    localStorage.removeItem('zenith_is_admin');
    setView('landing');
  };

  const goToAuth = (mode: 'login' | 'register') => {
    if (currentUser) {
      setView('dashboard');
    } else {
      setAuthMode(mode);
      setView('auth');
    }
  };

  const updateApkInfo = (newInfo: ApkInfo) => {
    setApkInfo(newInfo);
    localStorage.setItem('zenith_config_v5', JSON.stringify(newInfo));
  };

  if (view === 'auth') {
    return <Auth initialMode={authMode} onAuthSuccess={handleLogin} onBack={() => setView('landing')} />;
  }

  if (view === 'dashboard' && currentUser) {
    return (
      <>
        <Dashboard
          onLogout={handleLogout}
          onHome={handleHome}
          onOpenAdmin={handleOpenAdmin}
          earningRate={apkInfo.earningRate}
          user={currentUser}
        />
        {showAdmin && (
          <AdminPanel
            apkInfo={apkInfo}
            onUpdate={updateApkInfo}
            onClose={() => setShowAdmin(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500/30">
      <Header 
        isScrolled={isScrolled} 
        onAuthClick={() => goToAuth('login')} 
        onLogoLongPress={() => setShowAdmin(true)} 
      />
      
      <main className="flex-grow">
        <Hero onStartClick={() => goToAuth('register')} apkInfo={apkInfo} />
        <section id="features" className="py-24 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-3xl -z-10"></div>
          <Features />
        </section>
        <section id="calculator" className="py-24 bg-slate-900/30">
          <EarningCalculator onStartClick={() => goToAuth('register')} />
        </section>
        <section id="download" className="py-24">
          <Platforms apkInfo={apkInfo} />
        </section>
        <section id="faq" className="py-24 bg-slate-900/30">
          <FAQ />
        </section>
      </main>
      
      <Footer onLinkClick={() => goToAuth('register')} onAdminTrigger={() => setShowAdmin(true)} />

      {showAdmin && (
        <AdminPanel 
          apkInfo={apkInfo} 
          onUpdate={updateApkInfo} 
          onClose={() => setShowAdmin(false)} 
        />
      )}
    </div>
  );
};

export default App;
