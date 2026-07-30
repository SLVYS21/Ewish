import Navbar     from './components/Navbar';
import Hero       from './components/Hero';
import WhyMyKado  from './components/WhyMyKado';
import Briques    from './components/Briques';
import TrustAndCredibility from './components/TrustAndCredibility';
import HowItWorks from './components/HowItWorks';
import Pricing    from './components/Pricing';
import Business   from './components/Business';
import FinalCTA   from './components/FinalCTA';
import Footer     from './components/Footer';

const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000';

export default function App() {
  const handleRegister = () => {
    window.location.href = `${APP_URL}/ewish-admin/register`;
  };
  const handleLogin = () => {
    window.location.href = `${APP_URL}/ewish-admin/login`;
  };

  return (
    <>
      <a href="#main" className="sr-only">Aller au contenu</a>
      <Navbar onCreate={handleRegister} onLogin={handleLogin} />
      <main id="main">
        <Hero       onCreate={handleRegister} />
        <WhyMyKado  />
        <HowItWorks />
        <Briques    onCreate={handleRegister} />
        <TrustAndCredibility />
        <Pricing    onCreate={handleRegister} />
        <Business   onCreate={handleRegister} />
        <FinalCTA   onOrder={handleRegister} />
      </main>
      <Footer />
    </>
  );
}
