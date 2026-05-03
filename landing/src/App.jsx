import Navbar       from './components/Navbar';
import Hero         from './components/Hero';
import Templates    from './components/Templates';
import HowItWorks   from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import Footer       from './components/Footer';

const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000';

export default function App() {
  const handleRegister = () => {
    window.location.href = `${APP_URL}/ewish-admin/register`;
  };

  return (
    <>
      <Navbar onOrder={handleRegister} />
      <main>
        <Hero        onOrder={handleRegister} />
        <Templates   onSelectTemplate={handleRegister} />
        <HowItWorks />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}