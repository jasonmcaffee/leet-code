/**
 * MaxHeap Implementation
 * A MaxHeap is a complete binary tree where each node is larger than its children.
 * This ensures the largest element is always at the root.
 * 
 * Time Complexities:
 * - Insert: O(log n)
 * - Extract Max: O(log n)
 * - Find Nth Largest: O(n log n)
 */
export class MaxHeap {
  private heap: number[];

  constructor() {
    this.heap = [];
  }

  /**
   * Get the index of the parent node.
   * For any node at index i, its parent is at index (i-1)/2
   */
  private parent(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  /**
   * Get the index of the left child.
   * For any node at index i, its left child is at index 2i+1
   */
  private leftChild(i: number): number {
    return 2 * i + 1;
  }

  /**
   * Get the index of the right child.
   * For any node at index i, its right child is at index 2i+2
   */
  private rightChild(i: number): number {
    return 2 * i + 2;
  }

  /**
   * Swap two elements in the heap.
   * This is a helper function to maintain the heap property.
   */
  protected swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  /**
   * Insert a new value into the heap.
   * Time Complexity: O(log n) where n is the number of nodes
   */
  insert(value: number): void {
    this.heap.push(value);
    this.heapifyUp(this.heap.length - 1);
  }

  /**
   * Maintain heap property by moving a node up if it's larger than its parent.
   * This is used after insertion to ensure the max heap property.
   */
  private heapifyUp(i: number): void {
    const parent = this.parent(i);
    if (i > 0 && this.heap[i] > this.heap[parent]) {
      this.swap(i, parent);
      this.heapifyUp(parent);
    }
  }

  /**
   * Remove and return the maximum value from the heap.
   * Time Complexity: O(log n) where n is the number of nodes
   */
  extractMax(): number | null {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop()!;

    const max = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.heapifyDown(0);
    return max;
  }

  /**
   * Maintain heap property by moving a node down if it's smaller than its children.
   * This is used after extraction to ensure the max heap property.
   */
  private heapifyDown(i: number): void {
    const left = this.leftChild(i);
    const right = this.rightChild(i);
    let largest = i;

    if (left < this.heap.length && this.heap[left] > this.heap[largest]) {
      largest = left;
    }

    if (right < this.heap.length && this.heap[right] > this.heap[largest]) {
      largest = right;
    }

    if (largest !== i) {
      this.swap(i, largest);
      this.heapifyDown(largest);
    }
  }

  /**
   * Find the Nth largest element in the heap.
   * Time Complexity: O(n log n) where n is the number of nodes
   */
  findNthLargest(n: number): number | Promise<number> {
    if (n < 1 || n > this.heap.length) {
      throw new Error('Invalid value for n');
    }

    const heapCopy = [...this.heap];
    
    for (let i = 0; i < n - 1; i++) {
      heapCopy[0] = heapCopy.pop()!;
      
      let current = 0;
      while (true) {
        const left = 2 * current + 1;
        const right = 2 * current + 2;
        let largest = current;
        
        if (left < heapCopy.length && heapCopy[left] > heapCopy[largest]) {
          largest = left;
        }
        
        if (right < heapCopy.length && heapCopy[right] > heapCopy[largest]) {
          largest = right;
        }
        
        if (largest === current) break;
        
        [heapCopy[current], heapCopy[largest]] = [heapCopy[largest], heapCopy[current]];
        current = largest;
      }
    }
    
    return heapCopy[0];
  }

  /**
   * Get the current size of the heap
   */
  get size(): number {
    return this.heap.length;
  }

  /**
   * Get a copy of the current heap array
   */
  get values(): number[] {
    return [...this.heap];
  }
} 