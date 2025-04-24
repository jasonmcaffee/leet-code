'use client';

import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import styles from './HeapVisualization.module.css';

interface Node {
  value: number;
  position: [number, number, number];
}

function HeapNode({ value, position }: { value: number; position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color="#2563eb"
          metalness={0.3}
          roughness={0.4}
          envMapIntensity={1}
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
        <HeapNode key={index} value={node.value} position={node.position} />
      ))}
    </group>
  );
}

function HeapVisualization() {
  const [mounted, setMounted] = useState(false);
  const [heap, setHeap] = useState<number[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [scrollOffset, setScrollOffset] = useState(0);

  useEffect(() => {
    setMounted(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault(); // Prevent page scrolling
        setScrollOffset(prev => prev + (e.key === 'ArrowUp' ? 0.2 : -0.2));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const heapifyUp = (heap: number[], index: number) => {
    const parent = Math.floor((index - 1) / 2);
    if (index > 0 && heap[index] < heap[parent]) {
      [heap[index], heap[parent]] = [heap[parent], heap[index]];
      heapifyUp(heap, parent);
    }
  };

  const addRandomValue = () => {
    const newValue = Math.floor(Math.random() * 100);
    const newHeap = [...heap, newValue];
    heapifyUp(newHeap, newHeap.length - 1);
    setHeap(newHeap);
    
    // Recalculate all node positions
    const newNodes = newHeap.map((value, index) => {
      const level = Math.floor(Math.log2(index + 1));
      const positionInLevel = index - Math.pow(2, level) + 1;
      const x = positionInLevel * 2 - Math.pow(2, level) + 1;
      const y = -level * 2; // Negative Y to make tree grow downward from top
      return { value, position: [x, y, 0] as [number, number, number] };
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
      </div>

      <div className={styles.visualization}>
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
          <color attach="background" args={['#f0f0f0']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-5, 5, -5]} intensity={0.5} />
          <pointLight position={[0, 0, 5]} intensity={0.5} />
          <TreeContainer nodes={nodes} scrollOffset={scrollOffset} />
          <OrbitControls 
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI * 3/4}
          />
        </Canvas>
      </div>

      <div className={styles.code}>
        {`// Min Heap Implementation
class MinHeap {
  constructor() {
    this.heap = [];
  }

  parent(i) {
    return Math.floor((i - 1) / 2);
  }

  leftChild(i) {
    return 2 * i + 1;
  }

  rightChild(i) {
    return 2 * i + 2;
  }

  swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  insert(value) {
    this.heap.push(value);
    this.heapifyUp(this.heap.length - 1);
  }

  heapifyUp(i) {
    const parent = this.parent(i);
    if (i > 0 && this.heap[i] < this.heap[parent]) {
      this.swap(i, parent);
      this.heapifyUp(parent);
    }
  }

  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.heapifyDown(0);
    return min;
  }

  heapifyDown(i) {
    const left = this.leftChild(i);
    const right = this.rightChild(i);
    let smallest = i;

    if (left < this.heap.length && this.heap[left] < this.heap[smallest]) {
      smallest = left;
    }

    if (right < this.heap.length && this.heap[right] < this.heap[smallest]) {
      smallest = right;
    }

    if (smallest !== i) {
      this.swap(i, smallest);
      this.heapifyDown(smallest);
    }
  }
}`}
      </div>
    </div>
  );
}

export default HeapVisualization; 