import Link from "next/link";
import Navbar from "../components/Navbar";
import ContactSection from "../components/ContactSection";
import { ArrowIcon, DonutArt } from "../components/ArcadeArt";
import styles from "../styles/InnerPages.module.css";

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.contactMain}>
        <Link href="/" className={styles.backLink}>
          <ArrowIcon /> Back to the studio
        </Link>
        <div className={styles.contactGrid}>
          <div className={styles.contactCopy}>
            <p className={styles.eyebrow}>Our inbox is open</p>
            <h1>
              Hey there,
              <br /> <span>player.</span>
            </h1>
            <p>
              A game idea, a pesky bug, or just a hello. We&apos;d love to hear
              what&apos;s on your mind.
            </p>
            <DonutArt />
          </div>
          <div className={styles.contactForm}>
            <ContactSection />
          </div>
        </div>
      </main>
    </div>
  );
}
