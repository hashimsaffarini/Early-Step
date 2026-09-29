import { CallToActionSection } from '../components/CallToActionSection';
import { HeroSection } from '../components/HeroSection';
import { LandingFooter } from '../components/LandingFooter';
import { LandingNavbar } from '../components/LandingNavbar';

import styles from './LandingPage.module.css';

const CTA_SECTION_ID = 'start';

/** Public landing page — rebuilt from the Replit landing (navbar, hero, CTA, footer). */
export function LandingPage() {
  return (
    <div className={styles.page}>
      <LandingNavbar />
      <main className={styles.main}>
        <HeroSection nextSectionId={CTA_SECTION_ID} />
        <CallToActionSection id={CTA_SECTION_ID} />
      </main>
      <LandingFooter />
    </div>
  );
}
