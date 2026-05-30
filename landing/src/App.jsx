import Navbar       from './components/Navbar';
import Hero         from './components/Hero';
import TrustStrip   from './components/TrustStrip';
import Templates    from './components/Templates';
import HowItWorks   from './components/HowItWorks';
import Features     from './components/Features';
import UseCases     from './components/UseCases';
import Pricing      from './components/Pricing';
import Transparence from './components/Transparence';
import FAQ          from './components/FAQ';
import FinalCTA     from './components/FinalCTA';
import Footer       from './components/Footer';

const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000';

export default function App() {
  const handleRegister = () => {
    window.location.href = `${APP_URL}/ewish-admin/register`;
  };

  return (
    <>
      <Navbar onOrder={handleRegister} />
      <main id="main-content">
        <Hero        onOrder={handleRegister} />
        <TrustStrip />
        <Templates   onOrder={handleRegister} />
        <HowItWorks />
        <Features />
        <UseCases />
        <Pricing     onOrder={handleRegister} />
        <Transparence />
        <FAQ />
        <FinalCTA    onOrder={handleRegister} />
      </main>
      <Footer />
    </>
  );
}
