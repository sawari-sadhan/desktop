"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface Node {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  createdAt: number;
}

interface Connection {
  from: number;
  to: number;
  id: string;
}

let nodeIdCounter = 0;

export const AnimatedBackground = () => {
  const [viewData, setViewData] = useState<{ nodes: Node[]; connections: Connection[] }>({
    nodes: [],
    connections: [],
  });
  
  const nodesRef = useRef<Node[]>([]);
  const lastUpdateRef = useRef<number>(0);
  const lastConnectionUpdateRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize nodes
  useEffect(() => {
    const initialNodes: Node[] = Array.from({ length: 15 }, () => ({
      id: nodeIdCounter++,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.015,
      vy: (Math.random() - 0.5) * 0.015,
      createdAt: Date.now(),
    }));
    nodesRef.current = initialNodes;
    setViewData({ nodes: initialNodes, connections: [] });
  }, []);

  useEffect(() => {
    const animate = (time: number) => {
      // 1. Update Positions (60fps internally, but we'll sync state less often if needed)
      // Actually 60fps is fine for smoothness
      if (time - lastUpdateRef.current >= 33) { // ~30fps sync is enough for background
        lastUpdateRef.current = time;

        const connectionDistance = 25;
        const currentNodes = nodesRef.current.map(node => {
          let newX = node.x + node.vx;
          let newY = node.y + node.vy;

          if (newX <= 0 || newX >= 100) {
            newX = Math.max(0, Math.min(100, newX));
            return { ...node, x: newX, vx: -node.vx };
          }
          if (newY <= 0 || newY >= 100) {
            newY = Math.max(0, Math.min(100, newY));
            return { ...node, y: newY, vy: -node.vy };
          }
          return { ...node, x: newX, y: newY };
        });

        nodesRef.current = currentNodes;

        // 2. Update Connections (less often, every 500ms)
        let currentConnections = viewData.connections;
        if (time - lastConnectionUpdateRef.current >= 500) {
          lastConnectionUpdateRef.current = time;
          
          const newConnections: Connection[] = [];
          for (let i = 0; i < currentNodes.length; i++) {
            for (let j = i + 1; j < currentNodes.length; j++) {
              const n1 = currentNodes[i];
              const n2 = currentNodes[j];
              const dist = Math.sqrt(Math.pow(n2.x - n1.x, 2) + Math.pow(n2.y - n1.y, 2));
              if (dist < connectionDistance) {
                newConnections.push({ from: n1.id, to: n2.id, id: `${n1.id}-${n2.id}` });
              }
            }
          }
          currentConnections = newConnections;
        }

        // 3. Batch State Update
        setViewData({ nodes: currentNodes, connections: currentConnections });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [viewData.connections]); // Only re-run if connections count changes or on mount

  // Periodic node churn (Add/Remove)
  useEffect(() => {
    const churnInterval = setInterval(() => {
      const now = Date.now();
      let current = [...nodesRef.current];

      // Remove old or excess nodes
      if (current.length > 10) {
        current = current.filter(n => (now - n.createdAt < 30000) || current.length <= 12);
      }

      // Add new nodes if low
      if (current.length < 20) {
        current.push({
          id: nodeIdCounter++,
          x: Math.random() * 100,
          y: Math.random() * 100,
          vx: (Math.random() - 0.5) * 0.015,
          vy: (Math.random() - 0.5) * 0.015,
          createdAt: now,
        });
      }

      nodesRef.current = current;
    }, 5000);

    return () => clearInterval(churnInterval);
  }, []);

  const { nodes, connections } = viewData;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-[#121218] -z-10">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 -left-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl"
          animate={{
            x: [0, 40, 0],
            y: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <svg className="absolute inset-0 w-full h-full">
        {connections.map((conn) => {
          const n1 = nodes.find((n) => n.id === conn.from);
          const n2 = nodes.find((n) => n.id === conn.to);
          if (!n1 || !n2) return null;

          return (
            <line
              key={conn.id}
              x1={`${n1.x}%`}
              y1={`${n1.y}%`}
              x2={`${n2.x}%`}
              y2={`${n2.y}%`}
              stroke="rgba(147, 197, 253, 0.15)"
              strokeWidth="1"
            />
          );
        })}

        {nodes.map((node) => (
          <g key={node.id}>
            <circle
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r="2"
              fill="rgba(147, 197, 253, 0.5)"
            />
            <circle
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r="1"
              fill="white"
            />
          </g>
        ))}
      </svg>
    </div>
  );
};

export default AnimatedBackground;
