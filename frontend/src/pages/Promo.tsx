import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import MarketingPage from "../marketing-page/MarketingPage.tsx";


export default function Promo() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

  return (
    <MarketingPage/>
  );
}