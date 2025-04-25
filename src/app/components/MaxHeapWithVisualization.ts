import { MaxHeap } from './MaxHeap';

/**
 * MaxHeapWithVisualization extends MaxHeap to add visualization capabilities.
 * 
 * State Management:
 * - Each operation (insert) creates a new state
 * - State includes: values array, impacted nodes, and newly added value
 * - Undo/redo simply restores the exact state without rebuilding
 * 
 * Impacted Nodes:
 * - Only nodes involved in swaps during heapify are marked as impacted
 * - Impacted nodes are tracked during the operation and saved with the state
 * - No need to track impacts during undo/redo since we restore the exact state
 */
export class MaxHeapWithVisualization extends MaxHeap {
  private onStep?: (description: string) => void;
  private undoStack: { values: number[], impactedNodes: Set<number>, newValue?: number }[] = [];
  private redoStack: { values: number[], impactedNodes: Set<number>, newValue?: number }[] = [];
  private impactedNodes: Set<number> = new Set();
  private newValue?: number;

  constructor() {
    super();
  }

  /**
   * Set a callback function to be called for each step in the visualization
   */
  setStepCallback(callback: ((description: string) => void) | undefined) {
    this.onStep = callback;
  }

  /**
   * Get the current state of the heap
   */
  getCurrentState() {
    return {
      values: this.values,
      impactedNodes: this.impactedNodes,
      newValue: this.newValue
    };
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Undo the last operation
   */
  undo(): void {
    if (!this.canUndo()) return;
    
    // Save current state to redo stack
    this.redoStack.push({
      values: [...this.values],
      impactedNodes: new Set(this.impactedNodes),
      newValue: this.newValue
    });
    
    // Restore previous state
    const state = this.undoStack.pop()!;
    this.setValues(state.values);
    this.impactedNodes = new Set(state.impactedNodes);
    this.newValue = state.newValue;
  }

  /**
   * Redo the last undone operation
   */
  redo(): void {
    if (!this.canRedo()) return;
    
    // Save current state to undo stack
    this.undoStack.push({
      values: [...this.values],
      impactedNodes: new Set(this.impactedNodes),
      newValue: this.newValue
    });
    
    // Restore next state
    const state = this.redoStack.pop()!;
    this.setValues(state.values);
    this.impactedNodes = new Set(state.impactedNodes);
    this.newValue = state.newValue;
  }

  /**
   * Override insert to add visualization tracking
   */
  insert(value: number): void {
    // Save current state to undo stack
    this.undoStack.push({
      values: [...this.values],
      impactedNodes: new Set(this.impactedNodes),
      newValue: this.newValue
    });
    
    // Clear redo stack and impacted nodes
    this.redoStack = [];
    this.impactedNodes.clear();
    this.newValue = value;
    
    // Perform insertion
    super.insert(value);
  }

  /**
   * Override heapifyUp to track impacted nodes
   */
  protected heapifyUp(i: number): void {
    const parent = Math.floor((i - 1) / 2);
    if (i > 0 && this.values[i] > this.values[parent]) {
      this.impactedNodes.add(i);
      this.impactedNodes.add(parent);
      this.swap(i, parent);
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
      this.impactedNodes.add(i);
      this.impactedNodes.add(largest);
      this.swap(i, largest);
      this.heapifyDown(largest);
    }
  }

  /**
   * Override findNthLargest to add step-by-step visualization
   * Uses base class's heap operations but adds visualization steps
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