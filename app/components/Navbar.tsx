"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowIcon, DonutArt } from "./ArcadeArt";
import styles from "../styles/Navbar.module.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link href="/" className={styles.brand} onClick={() => setOpen(false)}>
          <DonutArt />
          <span>
            Sunday Night
            <span>
              Games
              <span className={styles.brandStar} aria-hidden="true">
                ✳
              </span>
            </span>
          </span>
        </Link>
        <button
          ref={menuRef}
          className={styles.menuToggle}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="main-menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
        <div
          id="main-menu"
          className={`${styles.links} ${open ? styles.open : ""}`}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              menuRef.current?.focus();
            }
          }}
        >
          <Link href="/#games" onClick={() => setOpen(false)}>
            Our games
          </Link>
          <Link href="/#studio" onClick={() => setOpen(false)}>
            The studio
          </Link>
          {pathname !== "/" && (
            <Link
              href="/flappy-donut"
              aria-current={pathname === "/flappy-donut" ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              Flappy Donut
            </Link>
          )}
          <Link
            href="/contact"
            aria-current={pathname === "/contact" ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            Say hello
          </Link>
          <Link
            href="/donut-survivor"
            className={styles.playLink}
            aria-current={pathname === "/donut-survivor" ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            Let&apos;s play <ArrowIcon />
          </Link>
        </div>
      </nav>
    </header>
  );
}
