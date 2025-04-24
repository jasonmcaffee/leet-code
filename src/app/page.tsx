'use client';

import Navigation from './components/Navigation';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Navigation />
      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to Leet Code Practice</h1>
        <div>
          <p className={styles.description}>
            This is a collection of LeetCode-style problems and their solutions. Each section focuses on a different data structure or algorithm concept.
          </p>
          <div className={styles.grid}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Heap Problems</h2>
              <p className={styles.cardDescription}>Practice problems related to heap data structures, including min-heaps and max-heaps.</p>
              <a href="/heap" className={styles.link}>Go to Heap Problems →</a>
            </div>
            {/* Add more problem categories here as we create them */}
          </div>
        </div>
      </main>
    </div>
  );
}
