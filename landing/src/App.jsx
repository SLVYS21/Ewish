import Navbar     from './components/Navbar';
import Hero       from './components/Hero';
import Analogy    from './components/Analogy';
import HowItWorks from './components/HowItWorks';
import Pricing    from './components/Pricing';
import FAQ        from './components/FAQ';
import FinalCTA   from './components/FinalCTA';
import Footer     from './components/Footer';
import Inspirations from './components/Inspirations';
import QrStories   from './components/QrStories';

const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000';

export default function App() {
  const handleCreate = (target) => {
    if (typeof target === 'string' && target.startsWith('/')) {
      window.location.href = `${APP_URL}${target}`;
    } else if (typeof target === 'string' && target.trim()) {
      window.location.href = `${APP_URL}/create?name=${encodeURIComponent(target.trim())}`;
    } else {
      window.location.href = `${APP_URL}/create`;
    }
  };

  const handleLogin = () => {
    window.location.href = `${APP_URL}/ewish-admin/login`;
  };

  return (
    <>
      <a href="#main" className="sr-only">Aller au contenu</a>
      <Navbar onCreate={() => handleCreate('/create')} onLogin={handleLogin} />
      <main id="main">
        <Hero       onCreate={() => handleCreate('/create')} />
        <Inspirations onStartCreate={handleCreate} />
        <Analogy />
        <QrStories />
        <HowItWorks onCreate={() => handleCreate('/create')} />
        <Pricing    onCreate={() => handleCreate('/create')} />
        <FinalCTA   onOrder={(name) => handleCreate(name ? `/create?name=${encodeURIComponent(name)}` : '/create')} />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
