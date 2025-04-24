'use client';

import styles from './KthLargestElement.module.css';
import HeapVisualization from './HeapVisualization';

export default function KthLargestElement() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Kth Largest Element in an Array</h2>
      
      <div className={styles.description}>
        <p>Given an integer array nums and an integer k, return the kth largest element in the array.</p>
        <p>Note that it is the kth largest element in the sorted order, not the kth distinct element.</p>
        <p>Can you solve it without sorting?</p>
      </div>

      <div className={styles.example}>
        <h3 className={styles.exampleTitle}>Example 1:</h3>
        <div className={styles.code}>
          Input: nums = [3,2,1,5,6,4], k = 2<br />
          Output: 5
        </div>
      </div>

      <div className={styles.example}>
        <h3 className={styles.exampleTitle}>Example 2:</h3>
        <div className={styles.code}>
          Input: nums = [3,2,3,1,2,4,5,5,6], k = 4<br />
          Output: 4
        </div>
      </div>

      <div className={styles.constraints}>
        <h3 className={styles.constraintsTitle}>Constraints:</h3>
        <ul className={styles.constraintsList}>
          <li>1 &lt;= k &lt;= nums.length &lt;= 10^5</li>
          <li>-10^4 &lt;= nums[i] &lt;= 10^4</li>
        </ul>
      </div>

      <div className={styles.solution}>
        <h2 className={styles.solutionTitle}>Solution</h2>
        <HeapVisualization />
      </div>
    </div>
  );
} 