'use client';

import Link from 'next/link';
import styles from './Navigation.module.css';

export default function Navigation() {
  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.link}>
        Home
      </Link>
      <Link href="/heap" className={styles.link}>
        Heap
      </Link>
    </nav>
  );
} 