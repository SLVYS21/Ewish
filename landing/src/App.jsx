import Navbar       from './components/Navbar';
import Hero         from './components/Hero';
import Comparatif   from './components/Comparatif';
import Occasions    from './components/Occasions';
import Templates    from './components/Templates';
import HowItWorks   from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import Pricing      from './components/Pricing';
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
        <Hero         onOrder={handleRegister} />
        <Comparatif   onOrder={handleRegister} />
        <Occasions />
        <Templates    onOrder={handleRegister} />
        <HowItWorks />
        <Testimonials />
        <Pricing      onOrder={handleRegister} />
        <FAQ />
        <FinalCTA     onOrder={handleRegister} />
      </main>
      <Footer />
    </>
  );
}
