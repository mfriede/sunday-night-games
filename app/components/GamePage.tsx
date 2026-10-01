import Link from "next/link";
import Navbar from "./Navbar";
import { ArrowIcon } from "./ArcadeArt";
import styles from "../styles/InnerPages.module.css";

export default function GamePage({
  title,
  genre,
  instructions,
  children,
}: {
  title: string;
  genre: string;
  instructions: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.gameMain}>
        <Link href="/#games" className={styles.backLink}>
          <ArrowIcon /> All games
        </Link>
        <div className={styles.gameHeading}>
          <div>
            <p className={styles.eyebrow}>Free browser game / {genre}</p>
            <h1>{title}</h1>
          </div>
          <p>{instructions}</p>
        </div>
        <div className={styles.gameFrame}>{children}</div>
        <p className={styles.attribution}>
          Music provided by{" "}
          <a
            href="https://www.fesliyanstudios.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            FesliyanStudios.com
          </a>
        </p>
      </main>
    </div>
  );
}
