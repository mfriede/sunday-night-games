import Image from "next/image";
import styles from "../styles/Home.module.css";

export default function DonutMascotFallback() {
  return (
    <div className={styles.staticMascot}>
      <Image
        src="/animations/donut-mascot.svg"
        width={440}
        height={440}
        alt=""
      />
    </div>
  );
}
