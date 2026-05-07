"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface Node {
  id: number;
  x: number;
  y: number;
  vx: number; // velocity x
  vy: number; // velocity y
  createdAt: number;
}

interface Connection {
  from: number;
  to: number;
  id: string;
  createdAt: number;
}

let nodeIdCounter = 0;

export const AnimatedBackground = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const nodesRef = useRef<Node[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const isAnimatingRef = useRef<boolean>(false);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    connectionsRef.current = connections;
  }, [connections]);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Initialize nodes on mount
  useEffect(() => {
    const initialNodeCount = 15;
    const newNodes: Node[] = Array.from({ length: initialNodeCount }, () => ({
      id: nodeIdCounter++,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.02, // slow velocity
      vy: (Math.random() - 0.5) * 0.02,
      createdAt: Date.now(),
    }));
    setNodes(newNodes);
  }, [dimensions]);

  // Add new nodes randomly
  useEffect(() => {
    if (dimensions.width === 0) return;

    const addNodeInterval = setInterval(() => {
      setNodes((prev) => {
        // Limit max nodes
        if (prev.length >= 25) return prev;

        const newNode: Node = {
          id: nodeIdCounter++,
          x: Math.random() * 100,
          y: Math.random() * 100,
          vx: (Math.random() - 0.5) * 0.02,
          vy: (Math.random() - 0.5) * 0.02,
          createdAt: Date.now(),
        };

        return [...prev, newNode];
      });
    }, 3000 + Math.random() * 2000); // Random interval between 3-5 seconds

    return () => clearInterval(addNodeInterval);
  }, [dimensions]);

  // Remove old nodes randomly
  useEffect(() => {
    if (nodes.length < 10) return; // Keep minimum nodes

    const removeNodeInterval = setInterval(() => {
      setNodes((prev) => {
        if (prev.length <= 10) return prev;

        // Remove a random node that's been around for a while
        const oldNodes = prev.filter(
          (node) => Date.now() - node.createdAt > 15000
        );

        if (oldNodes.length > 0) {
          const nodeToRemove = oldNodes[Math.floor(Math.random() * oldNodes.length)];
          return prev.filter((node) => node.id !== nodeToRemove.id);
        }

        return prev;
      });
    }, 4000 + Math.random() * 3000); // Random interval between 4-7 seconds

    return () => clearInterval(removeNodeInterval);
  }, [nodes.length]);

  // Animate node positions (slow motion)
  useEffect(() => {
    if (isAnimatingRef.current) return;
    
    isAnimatingRef.current = true;
    let lastUpdateTime = 0;
    const updateInterval = 50; // Update every 50ms

    const animate = (currentTime: number) => {
      if (!isAnimatingRef.current) return;
      
      if (currentTime - lastUpdateTime >= updateInterval) {
        lastUpdateTime = currentTime;
        
        setNodes((prev) => {
          if (prev.length === 0) return prev;
          
          return prev.map((node) => {
            let newX = node.x + node.vx;
            let newY = node.y + node.vy;

            // Bounce off edges
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
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      isAnimatingRef.current = false;
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  // Calculate and update connections dynamically
  useEffect(() => {
    const updateConnections = () => {
      const currentNodes = nodesRef.current;
      if (currentNodes.length === 0) return;

      const newConnections: Connection[] = [];
      const connectionDistance = 25;

      for (let i = 0; i < currentNodes.length; i++) {
        for (let j = i + 1; j < currentNodes.length; j++) {
          const node1 = currentNodes[i];
          const node2 = currentNodes[j];
          const distance = Math.sqrt(
            Math.pow(node2.x - node1.x, 2) + Math.pow(node2.y - node1.y, 2)
          );

          if (distance < connectionDistance) {
            const connId = `${node1.id}-${node2.id}`;
            const existingConn = connectionsRef.current.find(
              (c) => c.id === connId
            );

            if (!existingConn) {
              newConnections.push({
                from: node1.id,
                to: node2.id,
                id: connId,
                createdAt: Date.now(),
              });
            } else {
              newConnections.push(existingConn);
            }
          }
        }
      }

      // Remove connections that are too far apart or nodes are gone
      const validConnections = newConnections.filter((conn) => {
        const node1 = currentNodes.find((n) => n.id === conn.from);
        const node2 = currentNodes.find((n) => n.id === conn.to);

        if (!node1 || !node2) return false;

        const distance = Math.sqrt(
          Math.pow(node2.x - node1.x, 2) + Math.pow(node2.y - node1.y, 2)
        );

        return distance < connectionDistance * 1.2; // Slight buffer before disconnecting
      });

      setConnections(validConnections);
    };

    const connectionInterval = setInterval(updateConnections, 500);
    updateConnections(); // Initial update

    return () => clearInterval(connectionInterval);
  }, []);

  // Remove old connections
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setConnections((prev) => {
        const now = Date.now();
        return prev.filter((conn) => {
          // Keep connections that are recent or still valid
          const age = now - conn.createdAt;
          return age < 20000; // Remove connections older than 20 seconds
        });
      });
    }, 2000);

    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-[#121218] -z-10">
      {/* Visible grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      {/* Animated gradient orbs with subtle motion */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 -left-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl"
          animate={{
            x: [0, 60, 40, 0],
            y: [0, 30, 20, 0],
            scale: [1, 1.15, 1.05, 1],
            opacity: [0.15, 0.2, 0.18, 0.15],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/3 -right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl"
          animate={{
            x: [0, -60, -40, 0],
            y: [0, -30, -20, 0],
            scale: [1, 1.2, 1.1, 1],
            opacity: [0.15, 0.2, 0.18, 0.15],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-96 h-96 bg-cyan-500/12 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 30, 0],
            y: [0, -50, -30, 0],
            scale: [1, 1.1, 1.05, 1],
            opacity: [0.12, 0.17, 0.15, 0.12],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Tech-style connecting nodes and lines */}
      <svg className="absolute inset-0 w-full h-full">
        {/* Draw connections */}
        {connections.map((conn) => {
          const node1 = nodes.find((n) => n.id === conn.from);
          const node2 = nodes.find((n) => n.id === conn.to);
          if (!node1 || !node2) return null;

          return (
            <motion.line
              key={conn.id}
              x1={`${node1.x}%`}
              y1={`${node1.y}%`}
              x2={`${node2.x}%`}
              y2={`${node2.y}%`}
              stroke="rgba(147, 197, 253, 0.25)"
              strokeWidth="1.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: [0.15, 0.35, 0.25],
              }}
              exit={{ pathLength: 0, opacity: 0 }}
              transition={{
                pathLength: { duration: 1.2, ease: "easeOut" },
                opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              }}
            />
          );
        })}

        {/* Draw nodes */}
        {nodes.map((node) => (
          <motion.g key={node.id}>
            {/* Outer glow */}
            <motion.circle
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r="5"
              fill="rgba(147, 197, 253, 0.4)"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Middle ring */}
            <motion.circle
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r="3.5"
              fill="rgba(147, 197, 253, 0.5)"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.1,
              }}
            />
            {/* Core */}
            <motion.circle
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r="2"
              fill="rgba(255, 255, 255, 0.95)"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
            />
          </motion.g>
        ))}
      </svg>
    </div>
  );
};

export default AnimatedBackground;
