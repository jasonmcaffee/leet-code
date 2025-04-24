import { MaxHeap } from './MaxHeap';

/**
 * MaxHeapWithVisualization extends MaxHeap to add visualization capabilities.
 * This class tracks impacted nodes and provides step-by-step visualization of operations.
 */
export class MaxHeapWithVisualization extends MaxHeap {
  private impactedNodes: Set<number>;
  private onStep?: (description: string) => void;

  constructor() {
    super();
    this.impactedNodes = new Set();
  }

  /**
   * Set a callback function to be called for each step in the visualization
   */
  setStepCallback(callback: ((description: string) => void) | undefined) {
    this.onStep = callback;
  }

  /**
   * Clear the set of impacted nodes
   */
  clearImpactedNodes() {
    this.impactedNodes.clear();
  }

  /**
   * Get the set of impacted nodes
   */
  getImpactedNodes(): Set<number> {
    return new Set(this.impactedNodes);
  }

  /**
   * Override insert to track impacted nodes
   */
  insert(value: number): void {
    this.clearImpactedNodes();
    super.insert(value);
  }

  /**
   * Override heapifyUp to track impacted nodes
   */
  protected heapifyUp(i: number): void {
    const parent = Math.floor((i - 1) / 2);
    if (i > 0 && this.values[i] > this.values[parent]) {
      this.swap(i, parent);
      this.impactedNodes.add(parent);
      this.heapifyUp(parent);
    }
  }

  /**
   * Override heapifyDown to track impacted nodes
   */
  protected heapifyDown(i: number): void {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    let largest = i;

    if (left < this.size && this.values[left] > this.values[largest]) {
      largest = left;
    }

    if (right < this.size && this.values[right] > this.values[largest]) {
      largest = right;
    }

    if (largest !== i) {
      this.swap(i, largest);
      this.impactedNodes.add(largest);
      this.heapifyDown(largest);
    }
  }

  /**
   * Override findNthLargest to provide step-by-step visualization
   * Uses a more efficient algorithm that leverages the heap property
   */
  async findNthLargest(n: number): Promise<number> {
    if (n < 1 || n > this.size) {
      throw new Error('Invalid value for n');
    }

    // Create a temporary heap to work with
    const tempHeap = new MaxHeap();
    const originalValues = [...this.values];
    let operations = 0;

    // Insert all values into the temporary heap
    for (const value of originalValues) {
      tempHeap.insert(value);
    }

    // Extract the nth largest element
    let result = 0;
    for (let i = 0; i < n; i++) {
      const max = tempHeap.extractMax();
      if (max === null) break;
      
      if (i === n - 1) {
        result = max;
        this.onStep?.(`Found ${n}th largest element: ${result}`);
      } else {
        this.onStep?.(`Removing ${i + 1}th largest element: ${max}`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      operations++;
    }

    this.onStep?.(`Completed in ${operations} operations`);
    return result;
  }
} 