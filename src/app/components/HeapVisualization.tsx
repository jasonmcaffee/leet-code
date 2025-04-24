'use client';

import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import styles from './HeapVisualization.module.css';

interface Node {
  value: number;
  position: [number, number, number];
  isNew?: boolean;
  isImpacted?: boolean;
  isEvaluating?: boolean;  // New property for visualization
}

function HeapNode({ value, position, isNew, isImpacted, isEvaluating }: { 
  value: number; 
  position: [number, number, number];
  isNew?: boolean;
  isImpacted?: boolean;
  isEvaluating?: boolean;
}) {
  // Determine node color based on state
  const getNodeColor = () => {
    if (isEvaluating) return '#f59e0b'; // Amber color for evaluating nodes
    if (isNew) return '#10b981'; // Bright emerald green
    if (isImpacted) return '#0ea5e9'; // Bright sky blue
    return '#8b5cf6'; // Bright purple
  };

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={getNodeColor()}
          metalness={0.4}
          roughness={0.3}
          envMapIntensity={1.2}
        />
      </mesh>
      <Text
        position={[0, 0, 0.6]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {value.toString()}
      </Text>
    </group>
  );
}

function HeapConnections({ nodes }: { nodes: Node[] }) {
  return (
    <>
      {nodes.map((node, index) => {
        const parentIndex = Math.floor((index - 1) / 2);
        if (parentIndex >= 0) {
          return (
            <Line
              key={`line-${index}`}
              points={[nodes[parentIndex].position, node.position]}
              color="#666"
              lineWidth={2}
            />
          );
        }
        return null;
      })}
    </>
  );
}

function TreeContainer({ nodes, scrollOffset }: { nodes: Node[]; scrollOffset: number }) {
  return (
    <group position={[0, -scrollOffset, 0]}>
      <HeapConnections nodes={nodes} />
      {nodes.map((node, index) => (
        <HeapNode key={index} value={node.value} position={node.position} isNew={node.isNew} isImpacted={node.isImpacted} isEvaluating={node.isEvaluating} />
      ))}
    </group>
  );
}

function HeapVisualization() {
  const [mounted, setMounted] = useState(false);
  const [heap, setHeap] = useState<number[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [nthValue, setNthValue] = useState<string>('1');
  const [isFindingNth, setIsFindingNth] = useState(false);
  const [algorithmDescription, setAlgorithmDescription] = useState<string>('');

  // Reset the heap and nodes to empty state
  const resetHeap = () => {
    setHeap([]);
    setNodes([]);
  };

  useEffect(() => {
    setMounted(true);

    // Initialize heap with 5 random values
    const initialHeap: number[] = [];
    for (let i = 0; i < 5; i++) {
      initialHeap.push(Math.floor(Math.random() * 100));
    }
    
    // Convert to max heap
    for (let i = Math.floor(initialHeap.length / 2) - 1; i >= 0; i--) {
      heapifyDown(initialHeap, i);
    }
    
    setHeap(initialHeap);

    // Calculate initial node positions
    const initialNodes = initialHeap.map((value, index) => {
      const level = Math.floor(Math.log2(index + 1));
      const positionInLevel = index - Math.pow(2, level) + 1;
      const x = positionInLevel * 2 - Math.pow(2, level) + 1;
      const y = -level * 2 + 4;
      return { 
        value, 
        position: [x, y, 0] as [number, number, number],
        isNew: index === initialHeap.length - 1  // Only mark the last node as new
      };
    });
    setNodes(initialNodes);

    // Handle keyboard navigation for scrolling
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault(); // Prevent page scrolling
        setScrollOffset(prev => prev + (e.key === 'ArrowUp' ? 0.2 : -0.2));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helper function to maintain max heap property
  const heapifyDown = (heap: number[], i: number) => {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    let largest = i;

    if (left < heap.length && heap[left] > heap[largest]) {
      largest = left;
    }

    if (right < heap.length && heap[right] > heap[largest]) {
      largest = right;
    }

    if (largest !== i) {
      [heap[i], heap[largest]] = [heap[largest], heap[i]];
      heapifyDown(heap, largest);
    }
  };

  // Add a random value to the heap and update visualization
  const addRandomValue = () => {
    // Generate random value between 0 and 99
    const newValue = Math.floor(Math.random() * 100);
    // Add to heap and maintain heap property
    const newHeap = [...heap, newValue];
    
    // Track impacted nodes during heapify
    const impactedNodes = new Set<number>();
    const heapifyUpWithTracking = (heap: number[], index: number) => {
      const parent = Math.floor((index - 1) / 2);
      if (index > 0 && heap[index] > heap[parent]) {
        [heap[index], heap[parent]] = [heap[parent], heap[index]];
        impactedNodes.add(parent);
        heapifyUpWithTracking(heap, parent);
      }
    };
    
    heapifyUpWithTracking(newHeap, newHeap.length - 1);
    setHeap(newHeap);
    
    // Calculate positions for all nodes in the tree
    const newNodes = newHeap.map((value, index) => {
      const level = Math.floor(Math.log2(index + 1));
      const positionInLevel = index - Math.pow(2, level) + 1;
      const x = positionInLevel * 2 - Math.pow(2, level) + 1;
      const y = -level * 2 + 4;
      return { 
        value, 
        position: [x, y, 0] as [number, number, number],
        isNew: index === newHeap.length - 1,
        isImpacted: impactedNodes.has(index)
      };
    });
    
    setNodes(newNodes);
  };

  // Function to find Nth largest element with visualization
  const findNthLargest = async () => {
    if (heap.length === 0) return;
    
    const n = parseInt(nthValue);
    if (isNaN(n) || n < 1 || n > heap.length) {
      setAlgorithmDescription('Please enter a valid number between 1 and ' + heap.length);
      return;
    }

    setIsFindingNth(true);
    setAlgorithmDescription('Starting to find the ' + n + 'th largest element...');
    
    // Create a copy of the heap to work with
    const heapCopy = [...heap];
    const nodesCopy = [...nodes];
    let operations = 0;
    
    // Function to update node visualization
    const updateNodeVisualization = (index: number, isEvaluating: boolean) => {
      setNodes(prevNodes => prevNodes.map((node, i) => ({
        ...node,
        isEvaluating: i === index ? isEvaluating : false
      })));
    };

    // Function to simulate heapify down with visualization
    const heapifyDownWithVisualization = async (heap: number[], nodes: Node[], i: number) => {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let largest = i;

      // Visualize current node being evaluated
      updateNodeVisualization(i, true);
      setAlgorithmDescription(`Evaluating node ${heap[i]} at position ${i}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      operations++; // Count node visit

      if (left < heap.length) {
        setAlgorithmDescription(`Comparing ${heap[i]} with left child ${heap[left]}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        operations++; // Count comparison
        if (heap[left] > heap[largest]) {
          largest = left;
          setAlgorithmDescription(`${heap[left]} is greater than ${heap[i]}, updating largest`);
        }
      }

      if (right < heap.length) {
        setAlgorithmDescription(`Comparing ${heap[largest]} with right child ${heap[right]}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        operations++; // Count comparison
        if (heap[right] > heap[largest]) {
          largest = right;
          setAlgorithmDescription(`${heap[right]} is greater than ${heap[largest]}, updating largest`);
        }
      }

      if (largest !== i) {
        // Visualize swap
        updateNodeVisualization(largest, true);
        setAlgorithmDescription(`Swapping ${heap[i]} with ${heap[largest]}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        operations++; // Count swap

        [heap[i], heap[largest]] = [heap[largest], heap[i]];
        await heapifyDownWithVisualization(heap, nodes, largest);
      }
      
      updateNodeVisualization(i, false);
    };

    // Extract n-1 elements to get to the nth largest
    setAlgorithmDescription(`Extracting ${n-1} elements to find the ${n}th largest...`);
    for (let i = 0; i < n - 1; i++) {
      // Visualize root node
      updateNodeVisualization(0, true);
      setAlgorithmDescription(`Removing root element ${heapCopy[0]}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      operations++; // Count pop

      // Move last element to root
      const lastElement = heapCopy.pop()!;
      heapCopy[0] = lastElement;
      setAlgorithmDescription(`Moving last element ${lastElement} to root position`);
      await heapifyDownWithVisualization(heapCopy, nodesCopy, 0);
    }

    // The root is now the nth largest element
    updateNodeVisualization(0, true);
    setAlgorithmDescription(`The ${n}th largest element is: ${heapCopy[0]} (Found in ${operations} operations)`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reset visualization
    setNodes(prevNodes => prevNodes.map(node => ({
      ...node,
      isEvaluating: false
    })));
    
    setIsFindingNth(false);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Max Heap Visualization</h2>
      
      <div className={styles.controls}>
        <button className={styles.button} onClick={addRandomValue}>
          Add Random Value
        </button>
        <button className={styles.button} onClick={resetHeap}>
          Reset Heap
        </button>
        <div className={styles.nthControls}>
          <input
            type="number"
            min="1"
            value={nthValue}
            onChange={(e) => setNthValue(e.target.value)}
            className={styles.input}
            placeholder="Enter N"
            disabled={isFindingNth}
          />
          <button 
            className={styles.button} 
            onClick={findNthLargest}
            disabled={isFindingNth || heap.length === 0}
          >
            Find Nth Largest
          </button>
        </div>
      </div>

      <div className={styles.algorithmDescription}>
        {algorithmDescription}
      </div>

      <div className={styles.visualization}>
        <Canvas camera={{ position: [0, 0, 15], fov: 35 }}>
          <color attach="background" args={['#f0f0f0']} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[4, 4, 4]} intensity={1.5} />
          <directionalLight position={[-4, 4, -4]} intensity={1} />
          <pointLight position={[0, 0, 4]} intensity={0.8} />
          <TreeContainer nodes={nodes} scrollOffset={scrollOffset} />
          <OrbitControls 
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI * 3/4}
          />
        </Canvas>
      </div>

      <div className={styles.code}>
        <div className={styles.codeWrapper}>
          <SyntaxHighlighter 
            language="javascript" 
            style={atomDark}
            customStyle={{
              margin: 0,
              padding: '20px',
              fontSize: '14px',
              lineHeight: '1.5',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              background: '#282c34',
            }}
          >
            {`// MaxHeap Implementation
// A MaxHeap is a complete binary tree where each node is larger than its children
// This ensures the largest element is always at the root
class MaxHeap {
  constructor() {
    // Initialize an empty array to store the heap
    this.heap = [];
  }

  // Get the index of the parent node
  // For any node at index i, its parent is at index (i-1)/2
  parent(i) {
    return Math.floor((i - 1) / 2);
  }

  // Get the index of the left child
  // For any node at index i, its left child is at index 2i+1
  leftChild(i) {
    return 2 * i + 1;
  }

  // Get the index of the right child
  // For any node at index i, its right child is at index 2i+2
  rightChild(i) {
    return 2 * i + 2;
  }

  // Swap two elements in the heap
  // This is a helper function to maintain the heap property
  swap(i, j) {
    // Store the value at index i in a temporary variable
    const temp = this.heap[i];
    // Move the value from index j to index i
    this.heap[i] = this.heap[j];
    // Move the stored value to index j
    this.heap[j] = temp;
  }

  // Insert a new value into the heap
  // Time Complexity: O(log n) where n is the number of nodes
  insert(value) {
    // Add the new value to the end of the array
    this.heap.push(value);
    // Maintain heap property by moving the new value up if needed
    this.heapifyUp(this.heap.length - 1);
  }

  // Maintain heap property by moving a node up if it's larger than its parent
  // This is used after insertion to ensure the max heap property
  heapifyUp(i) {
    const parent = this.parent(i);
    // If the current node is larger than its parent, swap them
    // This ensures the larger value moves up in the tree
    if (i > 0 && this.heap[i] > this.heap[parent]) {
      this.swap(i, parent);
      // Continue heapifying up from the parent's position
      this.heapifyUp(parent);
    }
  }

  // Remove and return the maximum value from the heap
  // Time Complexity: O(log n) where n is the number of nodes
  extractMax() {
    // Handle empty heap case
    if (this.heap.length === 0) return null;
    // Handle single element case
    if (this.heap.length === 1) return this.heap.pop();

    // Store the maximum value (root)
    const max = this.heap[0];
    // Replace root with the last element
    this.heap[0] = this.heap.pop();
    // Maintain heap property by moving the new root down if needed
    this.heapifyDown(0);
    return max;
  }

  // Maintain heap property by moving a node down if it's smaller than its children
  // This is used after extraction to ensure the max heap property
  heapifyDown(i) {
    const left = this.leftChild(i);
    const right = this.rightChild(i);
    let largest = i;

    // Check if left child exists and is larger than current node
    if (left < this.heap.length && this.heap[left] > this.heap[largest]) {
      largest = left;
    }

    // Check if right child exists and is larger than current largest
    if (right < this.heap.length && this.heap[right] > this.heap[largest]) {
      largest = right;
    }

    // If the largest value is not the current node, swap and continue heapifying down
    if (largest !== i) {
      this.swap(i, largest);
      this.heapifyDown(largest);
    }
  }

  // Find the Nth largest element in the heap
  // Time Complexity: O(n log n) where n is the number of nodes
  findNthLargest(n) {
    if (n < 1 || n > this.heap.length) {
      throw new Error('Invalid value for n');
    }

    // Create a copy of the heap to work with
    const heapCopy = [...this.heap];
    let operations = 0;
    
    // Extract n-1 elements to get to the nth largest
    for (let i = 0; i < n - 1; i++) {
      // Move last element to root
      heapCopy[0] = heapCopy.pop();
      operations++; // Count pop
      
      // Heapify down to maintain max heap property
      let current = 0;
      while (true) {
        const left = 2 * current + 1;
        const right = 2 * current + 2;
        let largest = current;
        
        operations++; // Count comparison
        if (left < heapCopy.length && heapCopy[left] > heapCopy[largest]) {
          largest = left;
        }
        
        operations++; // Count comparison
        if (right < heapCopy.length && heapCopy[right] > heapCopy[largest]) {
          largest = right;
        }
        
        if (largest === current) break;
        
        // Swap and continue
        [heapCopy[current], heapCopy[largest]] = [heapCopy[largest], heapCopy[current]];
        operations++; // Count swap
        current = largest;
      }
    }
    
    console.log('Found ' + n + 'th largest element in ' + operations + ' operations');
    return heapCopy[0]; // The root is now the nth largest element
  }
}`}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}

export default HeapVisualization; 