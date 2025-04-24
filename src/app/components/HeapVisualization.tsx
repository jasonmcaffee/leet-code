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
}

function HeapNode({ value, position, isNew, isImpacted }: { 
  value: number; 
  position: [number, number, number];
  isNew?: boolean;
  isImpacted?: boolean;
}) {
  // Determine node color based on state
  const getNodeColor = () => {
    if (isNew) return '#059669'; // Darker emerald green
    if (isImpacted) return '#0284c7'; // Bright cyan blue
    return '#4f46e5'; // Deep indigo
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
        <HeapNode key={index} value={node.value} position={node.position} isNew={node.isNew} isImpacted={node.isImpacted} />
      ))}
    </group>
  );
}

function HeapVisualization() {
  const [mounted, setMounted] = useState(false);
  const [heap, setHeap] = useState<number[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [scrollOffset, setScrollOffset] = useState(0);

  // Reset the heap and nodes to empty state
  const resetHeap = () => {
    setHeap([]);
    setNodes([]);
  };

  useEffect(() => {
    setMounted(true);

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
      if (index > 0 && heap[index] < heap[parent]) {
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

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Min Heap Visualization</h2>
      
      <div className={styles.controls}>
        <button className={styles.button} onClick={addRandomValue}>
          Add Random Value
        </button>
        <button className={styles.button} onClick={resetHeap}>
          Reset Heap
        </button>
      </div>

      <div className={styles.visualization}>
        <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
          <color attach="background" args={['#f0f0f0']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[3, 3, 3]} intensity={1.2} />
          <directionalLight position={[-3, 3, -3]} intensity={0.8} />
          <pointLight position={[0, 0, 3]} intensity={0.6} />
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
            {`// MinHeap Implementation
// A MinHeap is a complete binary tree where each node is smaller than its children
class MinHeap {
  constructor() {
    // Initialize an empty array to store the heap
    this.heap = [];
  }

  // Get the index of the parent node
  parent(i) {
    return Math.floor((i - 1) / 2);
  }

  // Get the index of the left child
  leftChild(i) {
    return 2 * i + 1;
  }

  // Get the index of the right child
  rightChild(i) {
    return 2 * i + 2;
  }

  // Swap two elements in the heap
  swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  // Insert a new value into the heap
  insert(value) {
    // Add the new value to the end of the array
    this.heap.push(value);
    // Maintain heap property by moving the new value up if needed
    this.heapifyUp(this.heap.length - 1);
  }

  // Maintain heap property by moving a node up if it's smaller than its parent
  heapifyUp(i) {
    const parent = this.parent(i);
    // If the current node is smaller than its parent, swap them
    if (i > 0 && this.heap[i] < this.heap[parent]) {
      this.swap(i, parent);
      // Continue heapifying up from the parent's position
      this.heapifyUp(parent);
    }
  }

  // Remove and return the minimum value from the heap
  extractMin() {
    // Handle empty heap case
    if (this.heap.length === 0) return null;
    // Handle single element case
    if (this.heap.length === 1) return this.heap.pop();

    // Store the minimum value (root)
    const min = this.heap[0];
    // Replace root with the last element
    this.heap[0] = this.heap.pop();
    // Maintain heap property by moving the new root down if needed
    this.heapifyDown(0);
    return min;
  }

  // Maintain heap property by moving a node down if it's larger than its children
  heapifyDown(i) {
    const left = this.leftChild(i);
    const right = this.rightChild(i);
    let smallest = i;

    // Check if left child exists and is smaller than current node
    if (left < this.heap.length && this.heap[left] < this.heap[smallest]) {
      smallest = left;
    }

    // Check if right child exists and is smaller than current smallest
    if (right < this.heap.length && this.heap[right] < this.heap[smallest]) {
      smallest = right;
    }

    // If the smallest value is not the current node, swap and continue heapifying down
    if (smallest !== i) {
      this.swap(i, smallest);
      this.heapifyDown(smallest);
    }
  }
}`}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}

export default HeapVisualization; 