import Navbar       from './components/Navbar';
import Hero         from './components/Hero';
import TrustStrip   from './components/TrustStrip';
import Product      from './components/Product';
import Features     from './components/Features';
import Templates    from './components/Templates';
import UseCases     from './components/UseCases';
import HowItWorks   from './components/HowItWorks';
import Pricing      from './components/Pricing';
import Testimonials from './components/Testimonials';
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
        <Product />
        <Features />
        <Templates   onSelectTemplate={handleRegister} onOrder={handleRegister} />
        <UseCases />
        <HowItWorks />
        <Pricing     onOrder={handleRegister} />
        <Testimonials />
        <FAQ />
        <FinalCTA    onOrder={handleRegister} />
      </main>
      <Footer />
    </>
  );
}
