import Link from "next/link";
import Navbar from "./components/Navbar";
import MailingListSignup from "./components/MailingListSignup";
import ArcadeHero from "./components/ArcadeHero";
import { MotionProvider } from "./components/MotionProvider";
import { ArrowIcon, DonutArt, SparkIcon } from "./components/ArcadeArt";
import styles from "./styles/Home.module.css";

export default function Home() {
  return (
    <MotionProvider>
      <a className={styles.skipLink} href="#main">
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span className={styles.liveDot} /> Independent games. Made by
              friends.
            </p>
            <h1 id="hero-title">
              One more
              <br /> game.
              <br /> <span>Then bed.</span>
              <SparkIcon className={styles.titleSpark} />
            </h1>
            <p className={styles.heroDescription}>
              A little chaos. A lot of fun. We make games for the nights you
              wish would last a little longer.
            </p>
            <div className={styles.heroActions}>
              <Link href="#games" className={styles.primaryButton}>
                Find your next game <ArrowIcon />
              </Link>
              <Link href="#studio" className={styles.textLink}>
                Meet the studio <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <p className={styles.heroNote}>
              <span aria-hidden="true">↳</span> Free to play. Right here in your
              browser.
            </p>
          </div>
          <ArcadeHero />
        </section>
        <div
          className={styles.ribbon}
          aria-label="Made by friends. Played by everyone. Just good games."
        >
          <div className={styles.ribbonInner} aria-hidden="true">
            {[0, 1].map((copy) => (
              <span className={styles.ribbonGroup} key={copy}>
                Made by friends <SparkIcon /> Played by everyone <SparkIcon />{" "}
                Just good games <SparkIcon />
              </span>
            ))}
          </div>
        </div>
        <section
          id="games"
          className={styles.games}
          aria-labelledby="games-title"
        >
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>The good stuff</p>
              <h2 id="games-title">Pick your kind of chaos.</h2>
            </div>
            <p>
              Small games. Big &quot;one more try&quot; energy.
              <br /> Your next high score is waiting.
            </p>
          </div>
          <div className={styles.gameGrid}>
            <Link href="/donut-survivor" className={styles.gameCard}>
              <div
                className={`${styles.gameScene} ${styles.survivorScene}`}
                aria-hidden="true"
              >
                <span className={styles.playBadge}>
                  <span /> Play now
                </span>
                <span className={styles.sceneSun} />
                <span className={`${styles.cloud} ${styles.cloudOne}`} />
                <span className={`${styles.cloud} ${styles.cloudTwo}`} />
                <span className={`${styles.coin} ${styles.coinOne}`}>✦</span>
                <span className={`${styles.coin} ${styles.coinTwo}`}>✦</span>
                <span className={`${styles.coin} ${styles.coinThree}`}>✦</span>
                <span className={styles.sceneDonut}>
                  <DonutArt />
                </span>
                <span className={styles.platformOne} />
                <span className={styles.platformTwo} />
                <span className={styles.sceneGround} />
                <span className={styles.sceneCaption}>
                  Run. Jump. Sprinkle.
                </span>
              </div>
              <div className={styles.gameInfo}>
                <div className={styles.gameMeta}>
                  <span>01 / Platformer</span>
                  <span>Browser game</span>
                </div>
                <div className={styles.gameTitle}>
                  <h3>Donut Survivor</h3>
                  <span className={styles.cardArrow}>
                    <ArrowIcon />
                  </span>
                </div>
                <p>
                  A donut with places to be. Jump through the bakery, dodge
                  trouble, and scoop up every coin you can.
                </p>
                <span className={styles.gameCta}>
                  Let&apos;s play <span aria-hidden="true">↗</span>
                </span>
              </div>
            </Link>
            <Link href="/flappy-donut" className={styles.gameCard}>
              <div
                className={`${styles.gameScene} ${styles.flappyScene}`}
                aria-hidden="true"
              >
                <span className={styles.playBadge}>
                  <span /> Play now
                </span>
                <span className={`${styles.cloud} ${styles.cloudOne}`} />
                <span className={`${styles.cloud} ${styles.cloudTwo}`} />
                <span className={styles.flappyTrail}>· · ·</span>
                <span className={styles.flappyDonut}>
                  <DonutArt />
                </span>
                <span className={`${styles.pipe} ${styles.pipeTop}`} />
                <span className={`${styles.pipe} ${styles.pipeBottom}`} />
                <span className={styles.flappyHills} />
                <span className={styles.sceneCaption}>
                  Stay sweet. Stay airborne.
                </span>
              </div>
              <div className={styles.gameInfo}>
                <div className={styles.gameMeta}>
                  <span>02 / Arcade</span>
                  <span>Browser game</span>
                </div>
                <div className={styles.gameTitle}>
                  <h3>Flappy Donut</h3>
                  <span className={styles.cardArrow}>
                    <ArrowIcon />
                  </span>
                </div>
                <p>
                  One tap. One tiny gap. Keep your donut flying and see how far
                  &quot;just one more try&quot; takes you.
                </p>
                <span className={styles.gameCta}>
                  Let&apos;s play <span aria-hidden="true">↗</span>
                </span>
              </div>
            </Link>
          </div>
        </section>
        <section
          id="studio"
          className={styles.studio}
          aria-labelledby="studio-title"
        >
          <div className={styles.studioSticker} aria-hidden="true">
            <svg className={styles.studioBubble} viewBox="0 0 280 230" fill="none">
              <path
                d="M34 8H236Q264 8 264 36V150Q264 178 236 178H82L40 214L46 178H34Q8 178 8 150V36Q8 8 34 8Z"
                fill="currentColor"
                transform="translate(7 7)"
              />
              <path
                d="M34 8H236Q264 8 264 36V150Q264 178 236 178H82L40 214L46 178H34Q8 178 8 150V36Q8 8 34 8Z"
                fill="#c6d5f6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <SparkIcon className={styles.studioSpark} />
            <span>
              Good friends.
              <br />
              Good games.
            </span>
            <DonutArt className={styles.studioDonut} />
          </div>
          <div className={styles.studioCopy}>
            <p className={styles.eyebrow}>Hey, we&apos;re Sunday Night Games</p>
            <h2 id="studio-title">
              Built on friendship.
              <br /> Fueled by <span>&quot;what if?&quot;</span>
            </h2>
            <p>
              We&apos;re three lifelong gamers turning our Sunday night ideas
              into games you can actually play. A tiny studio with a soft spot
              for strange ideas, silly characters, and a really good game night.
            </p>
            <Link href="/contact" className={styles.textLink}>
              Say hello <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>
        <MailingListSignup />
      </main>
      <footer className={styles.footer}>
        <Link href="/" className={styles.footerBrand}>
          Sunday Night Games<span>See you next Sunday.</span>
        </Link>
        <div>
          <Link href="#games">Our games</Link>
          <Link href="/contact">Contact</Link>
          <a
            href="https://buymeacoffee.com/sundaynightgames"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.coffeeLink}
          >
            Buy us a coffee <span aria-hidden="true">↗</span>
          </a>
          <p>© {new Date().getFullYear()} Sunday Night Games</p>
        </div>
      </footer>
    </MotionProvider>
  );
}
