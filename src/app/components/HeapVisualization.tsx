'use client';

import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import typescript from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript';
import styles from './HeapVisualization.module.css';
import { MaxHeapWithVisualization } from './MaxHeapWithVisualization';

// Register TypeScript language
SyntaxHighlighter.registerLanguage('typescript', typescript);

interface Node {
  value: number;
  position: [number, number, number];
  isNew?: boolean;
  isImpacted?: boolean;
  isEvaluating?: boolean;
}

function HeapNode({ value, position, isNew, isImpacted, isEvaluating }: { 
  value: number; 
  position: [number, number, number];
  isNew?: boolean;
  isImpacted?: boolean;
  isEvaluating?: boolean;
}) {
  const getNodeColor = () => {
    if (isEvaluating) return '#f59e0b';
    if (isNew) return '#10b981';
    if (isImpacted) return '#0ea5e9';
    return '#8b5cf6';
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
  const [maxHeap] = useState(() => new MaxHeapWithVisualization());
  const [nodes, setNodes] = useState<Node[]>([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [nthValue, setNthValue] = useState<string>('1');
  const [isFindingNth, setIsFindingNth] = useState(false);
  const [algorithmDescription, setAlgorithmDescription] = useState<string>('');
  const [codeContent, setCodeContent] = useState<string>('');

  useEffect(() => {
    // Fetch the code content from our API route
    fetch('/api/code')
      .then(response => response.json())
      .then(data => setCodeContent(data.code))
      .catch(error => console.error('Error loading code:', error));
  }, []);

  const resetHeap = () => {
    maxHeap.clearImpactedNodes();
    setNodes([]);
  };

  useEffect(() => {
    setMounted(true);

    for (let i = 0; i < 5; i++) {
      maxHeap.insert(Math.floor(Math.random() * 100));
    }
    
    const initialNodes = maxHeap.values.map((value, index) => {
      const level = Math.floor(Math.log2(index + 1));
      const positionInLevel = index - Math.pow(2, level) + 1;
      const x = positionInLevel * 2 - Math.pow(2, level) + 1;
      const y = -level * 2 + 4;
      return { 
        value, 
        position: [x, y, 0] as [number, number, number],
        isNew: index === maxHeap.values.length - 1,
        isImpacted: maxHeap.getImpactedNodes().has(index)
      };
    });
    setNodes(initialNodes);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        setScrollOffset(prev => prev + (e.key === 'ArrowUp' ? 0.2 : -0.2));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addRandomValue = () => {
    const newValue = Math.floor(Math.random() * 100);
    maxHeap.insert(newValue);
    
    const newNodes = maxHeap.values.map((value, index) => {
      const level = Math.floor(Math.log2(index + 1));
      const positionInLevel = index - Math.pow(2, level) + 1;
      const x = positionInLevel * 2 - Math.pow(2, level) + 1;
      const y = -level * 2 + 4;
      return { 
        value, 
        position: [x, y, 0] as [number, number, number],
        isNew: index === maxHeap.values.length - 1,
        isImpacted: maxHeap.getImpactedNodes().has(index)
      };
    });
    
    setNodes(newNodes);
  };

  const findNthLargest = async () => {
    if (maxHeap.size === 0) return;
    
    const n = parseInt(nthValue);
    if (isNaN(n) || n < 1 || n > maxHeap.size) {
      setAlgorithmDescription('Please enter a valid number between 1 and ' + maxHeap.size);
      return;
    }

    setIsFindingNth(true);
    setAlgorithmDescription('Starting to find the ' + n + 'th largest element...');
    
    try {
      maxHeap.setStepCallback(setAlgorithmDescription);
      const result = await maxHeap.findNthLargest(n);
      setAlgorithmDescription(`The ${n}th largest element is: ${result}`);
    } catch (error) {
      setAlgorithmDescription(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsFindingNth(false);
      maxHeap.setStepCallback(undefined);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* <h2 className={styles.title}>Max Heap Visualization</h2> */}
      
      <div className={styles.controls}>
        <button className={styles.button} onClick={addRandomValue}>
          Add Random Value
        </button>
        <button className={styles.button} onClick={resetHeap}>
          Reset Heap
        </button>
        <div className={styles.nthControls}>
          <button 
            className={styles.button} 
            onClick={findNthLargest}
            disabled={isFindingNth || maxHeap.size === 0}
          >
            Find Nth Largest
          </button>
          <input
            type="number"
            min="1"
            value={nthValue}
            onChange={(e) => setNthValue(e.target.value)}
            className={styles.input}
            placeholder="N"
            disabled={isFindingNth}
          />
        </div>
        <div className={styles.algorithmDescription}>
          {algorithmDescription}
        </div>
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
            language="typescript" 
            style={atomDark}
            customStyle={{
              margin: 0,
              padding: '20px',
              fontSize: '14px',
              lineHeight: '1.5',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              background: '#282c34',
              borderRadius: '4px',
              height: '100%',
              minHeight: '400px'
            }}
            showLineNumbers={true}
            wrapLines={true}
          >
            {codeContent}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}

export default HeapVisualization; 