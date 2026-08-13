import Navbar     from './components/Navbar';
import Hero       from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Pricing    from './components/Pricing';
import FinalCTA   from './components/FinalCTA';
import Footer     from './components/Footer';
import Inspirations from './components/Inspirations';

const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000';

export default function App() {
  const handleCreate = (target) => {
    if (typeof target === 'string' && target.startsWith('/')) {
      window.location.href = `${APP_URL}${target}`;
    } else if (typeof target === 'string' && target.trim()) {
      window.location.href = `${APP_URL}/ewish-admin/ewish/new?name=${encodeURIComponent(target.trim())}`;
    } else {
      window.location.href = `${APP_URL}/ewish-admin/ewish/new`;
    }
  };

  const handleLogin = () => {
    window.location.href = `${APP_URL}/ewish-admin/login`;
  };

  return (
    <>
      <a href="#main" className="sr-only">Aller au contenu</a>
      <Navbar onCreate={() => handleCreate('/ewish-admin/ewish/new')} onLogin={handleLogin} />
      <main id="main">
        <Hero       onCreate={() => handleCreate('/ewish-admin/ewish/new')} />
        <Inspirations onStartCreate={handleCreate} />
        <HowItWorks onCreate={() => handleCreate('/ewish-admin/ewish/new')} />
        <Pricing    onCreate={() => handleCreate('/ewish-admin/ewish/new')} />
        <FinalCTA   onOrder={(name) => handleCreate(name ? `/ewish-admin/ewish/new?name=${encodeURIComponent(name)}` : '/ewish-admin/ewish/new')} />
      </main>
      <Footer />
    </>
  );
}
