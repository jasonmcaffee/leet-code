'use client';

import Navigation from '../components/Navigation';
import styles from './page.module.css';

export default function HeapPage() {
  return (
    <div className={styles.container}>
      <Navigation />
      <main className={styles.main}>
        <h1 className={styles.title}>Heap Problems</h1>
        <div>
          <p className={styles.description}>
            Welcome to the Heap problems section. Here you&apos;ll find various problems related to heap data structures.
          </p>
          <div className={styles.comingSoon}>
            <h2 className={styles.comingSoonTitle}>Coming Soon</h2>
            <p>We&apos;re currently working on adding heap-related problems. Check back soon!</p>
          </div>
        </div>
      </main>
    </div>
  );
} 