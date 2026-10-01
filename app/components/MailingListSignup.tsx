"use client";

import { useState } from "react";
import { sanitizeEmail, isValidEmail } from "../utils/validation";
import { ArrowIcon, SparkIcon } from "./ArcadeArt";
import styles from "../styles/Home.module.css";

export default function MailingListSignup() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | "";
    message: string;
  }>({ type: "", message: "" });
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const sanitizedEmail = sanitizeEmail(email);
    if (!isValidEmail(sanitizedEmail)) {
      setStatus({
        type: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }
    setSubmitting(true);
    setStatus({ type: "", message: "" });
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sanitizedEmail }),
      });
      const data = await response.json();
      if (response.ok) {
        setStatus({
          type: "success",
          message: data.message || "You're on the list. See you next Sunday!",
        });
        setEmail("");
      } else
        setStatus({
          type: "error",
          message:
            data.error || "We couldn't add you just yet. Please try again.",
        });
    } catch {
      setStatus({
        type: "error",
        message: "We couldn't connect. Please try again in a moment.",
      });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <section
      id="newsletter"
      className={styles.newsletter}
      aria-labelledby="newsletter-title"
    >
      <div>
        <p className={styles.eyebrow}>A little something to look forward to</p>
        <h2 id="newsletter-title">
          Keep your
          <br />
          Sunday nights <span>open.</span>
          <SparkIcon />
        </h2>
        <p>
          New games, little updates, and the occasional donut.
          <br />
          Get the good stuff straight from our studio.
        </p>
      </div>
      <div className={styles.signup}>
        <form onSubmit={handleSubmit}>
          <label htmlFor="signup-email">Your email address</label>
          <div className={styles.emailField}>
            <input
              id="signup-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={submitting}
              aria-describedby="signup-privacy signup-status"
            />
            <button type="submit" disabled={submitting}>
              {submitting ? "Joining…" : "Count me in"}
              <ArrowIcon />
            </button>
          </div>
          <p id="signup-privacy" className={styles.privacy}>
            Just studio news. We won&apos;t sell your email.
          </p>
          <p
            id="signup-status"
            role="status"
            aria-live="polite"
            className={
              status.type === "error" ? styles.formError : styles.formSuccess
            }
          >
            {status.message}
          </p>
        </form>
      </div>
    </section>
  );
}
