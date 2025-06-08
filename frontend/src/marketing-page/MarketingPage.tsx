import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import AppTheme from '../shared-theme/AppTheme';
import AppAppBar from './components/AppAppBar';
import Hero from './components/Hero';
import Highlights from './components/Highlights';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

export default function MarketingPage(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />

      <AppAppBar />
      <Hero />
      <div>
        {/*<Features />*/}
        <Divider />
        {/*<Testimonials />*/}
        {/*<Divider />*/}
        <Highlights />
        <Divider />
        {/*<Pricing />*/}
        {/*<Divider />*/}
        <FAQ />
        <Divider />
        <Footer />
      </div>
    </AppTheme>
  );
}
