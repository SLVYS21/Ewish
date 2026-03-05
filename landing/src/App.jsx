import { useState, useEffect } from 'react';
import Navbar       from './components/Navbar';
import Hero         from './components/Hero';
import Templates    from './components/Templates';
import HowItWorks   from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import Footer       from './components/Footer';
import OrderModal   from './components/OrderModal';

export default function App() {
  const [orderTemplate, setOrderTemplate] = useState(null); // opens modal

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = orderTemplate ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [orderTemplate]);

  return (
    <>
      <Navbar onOrder={() => setOrderTemplate('birthday')} />
      <main>
        <Hero        onOrder={() => setOrderTemplate('birthday')} />
        <Templates   onSelectTemplate={setOrderTemplate} />
        <HowItWorks />
        <Testimonials />
      </main>
      <Footer />
      {orderTemplate && (
        <OrderModal
          templateName={orderTemplate}
          onClose={() => setOrderTemplate(null)}
        />
      )}
    </>
  );
}