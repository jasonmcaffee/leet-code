/**
 * MaxHeap Implementation
 * A MaxHeap is a complete binary tree where each node is larger than its children.
 * This ensures the largest element is always at the root.
 * 
 * Example heap with 5 elements [19, 17, 13, 11, 7]:
 * 
 *       19 (0)
 *      /    \
 *   17(1)   13(2)
 *   /   \
 * 11(3) 7(4)
 * 
 * Index calculations:
 * - Parent of index i: Math.floor((i-1)/2)
 *   Example: Parent of 3 is Math.floor((3-1)/2) = 1
 * - Left child of index i: 2i+1
 *   Example: Left child of 1 is 2*1+1 = 3
 * - Right child of index i: 2i+2
 *   Example: Right child of 1 is 2*1+2 = 4
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
   * 
   * Example:
   * For heap [19, 17, 13, 11, 7]
   * parent(3) = Math.floor((3-1)/2) = 1
   * parent(4) = Math.floor((4-1)/2) = 1
   */
  private parent(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  /**
   * Get the index of the left child.
   * For any node at index i, its left child is at index 2i+1
   * 
   * Example:
   * For heap [19, 17, 13, 11, 7]
   * leftChild(1) = 2*1+1 = 3
   * leftChild(0) = 2*0+1 = 1
   */
  private leftChild(i: number): number {
    return 2 * i + 1;
  }

  /**
   * Get the index of the right child.
   * For any node at index i, its right child is at index 2i+2
   * 
   * Example:
   * For heap [19, 17, 13, 11, 7]
   * rightChild(1) = 2*1+2 = 4
   * rightChild(0) = 2*0+2 = 2
   */
  private rightChild(i: number): number {
    return 2 * i + 2;
  }

  /**
   * Swap two elements in the heap.
   * This is a helper function to maintain the heap property.
   * 
   * Example:
   * Before swap(1, 3): [19, 17, 13, 11, 7]
   * After swap(1, 3):  [19, 11, 13, 17, 7]
   * 
   *       19         19
   *      /  \       /  \
   *    17   13    11   13
   *   /  \       /  \
   * 11    7    17    7
   */
  protected swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  /**
   * Insert a new value into the heap.
   * Time Complexity: O(log n) where n is the number of nodes
   * 
   * Example:
   * Initial heap: [19, 17, 13, 11, 7]
   * Insert(23):
   * 
   * Step 1: Add 23 at end
   *       19
   *      /  \
   *    17   13
   *   /  \
   * 11    7
   * /
   *23
   * 
   * Step 2: Heapify up
   *       23
   *      /  \
   *    19   13
   *   /  \
   * 11    7
   * /
   *17
   */
  insert(value: number): void {
    this.heap.push(value);
    this.heapifyUp(this.heap.length - 1);
  }

  /**
   * Maintain heap property by moving a node up if it's larger than its parent.
   * This is used after insertion to ensure the max heap property.
   * 
   * Example:
   * Initial: [19, 17, 13, 11, 7, 23]
   * After heapifyUp(5):
   * [23, 19, 13, 11, 7, 17]
   * 
   * Step 1: Initial state
   *       19
   *      /  \
   *    17   13
   *   /  \
   * 11    7
   * /
   *23
   * 
   * Step 2: Compare 23 with parent 11
   *       19
   *      /  \
   *    17   13
   *   /  \
   * 23    7
   * /
   *11
   * 
   * Step 3: Compare 23 with parent 17
   *       19
   *      /  \
   *    23   13
   *   /  \
   * 11    7
   * /
   *17
   * 
   * Step 4: Compare 23 with parent 19
   *       23
   *      /  \
   *    19   13
   *   /  \
   * 11    7
   * /
   *17
   */
  protected heapifyUp(i: number): void {
    // Get the parent index of the current node
    const parent = this.parent(i);
    
    // Continue if:
    // 1. We haven't reached the root (i > 0)
    // 2. The current node is larger than its parent
    if (i > 0 && this.heap[i] > this.heap[parent]) {
      // Swap the current node with its parent
      // This moves the larger value up the tree
      this.swap(i, parent);
      
      // Recursively continue heapifying up from the parent's position
      // This ensures the heap property is maintained all the way to the root
      this.heapifyUp(parent);
    }
  }

  /**
   * Remove and return the maximum value from the heap.
   * Time Complexity: O(log n) where n is the number of nodes
   * 
   * Example:
   * Initial heap: [23, 19, 13, 11, 7, 17]
   * After extractMax():
   * 
   * Step 1: Remove root (23) and move last element (17) to root
   *       17
   *      /  \
   *    19   13
   *   /  \
   * 11    7
   * 
   * Step 2: Heapify down
   *       19
   *      /  \
   *    17   13
   *   /  \
   * 11    7
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
   * 
   * Example:
   * Initial: [17, 19, 13, 11, 7]
   * After heapifyDown(0):
   * [19, 17, 13, 11, 7]
   * 
   *       19
   *      /  \
   *    17   13
   *   /  \
   * 11    7
   */
  protected heapifyDown(i: number): void {
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
   * 
   * Example:
   * Initial heap: [19, 17, 13, 11, 7]
   * findNthLargest(2) returns 17
   * 
   * After finding 2nd largest:
   *       17
   *      /  \
   *    11   13
   *   /  \
   * 7    19
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
   * 
   * Example:
   * For heap [19, 17, 13, 11, 7]
   * size = 5
   */
  get size(): number {
    return this.heap.length;
  }

  /**
   * Get a copy of the current heap array
   * 
   * Example:
   * For heap [19, 17, 13, 11, 7]
   * values returns [19, 17, 13, 11, 7]
   */
  get values(): number[] {
    return [...this.heap];
  }
} 