"use client";

import React, { useEffect, useRef } from 'react';

export default function AIBrainBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    canvas.width = width;
    canvas.height = height;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', resize);

    const nodes: { x: number; y: number; vx: number; vy: number; radius: number, baseRadius: number }[] = [];
    // Increase density for a more "brain-like" web
    const numNodes = 120;

    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 1.5 + 0.5,
        baseRadius: Math.random() * 1.5 + 0.5
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      const centerX = width / 2;
      const centerY = height / 2;

      for (let i = 0; i < numNodes; i++) {
        const node = nodes[i];
        
        // Gentle pull towards center to form a "brain" cluster
        const dxCenter = centerX - node.x;
        const dyCenter = centerY - node.y;
        const distCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
        
        node.vx += dxCenter * 0.00001;
        node.vy += dyCenter * 0.00001;
        
        // Add some friction
        node.vx *= 0.99;
        node.vy *= 0.99;

        // Keep a minimum speed
        const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        if (speed < 0.2) {
            node.vx *= 1.1;
            node.vy *= 1.1;
        }

        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Pulse radius
        node.radius = node.baseRadius + Math.sin(Date.now() * 0.002 + i) * 0.5;

        ctx.beginPath();
        ctx.arc(node.x, node.y, Math.max(0.1, node.radius), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.8)';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(99, 102, 241, 1)';
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        let connections = 0;
        for (let j = i + 1; j < numNodes; j++) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180 && connections < 5) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            // Stronger opacity for shorter distances, colored cyan and indigo
            const opacity = (1 - dist / 180) * 0.5;
            
            // Create gradient line
            const grad = ctx.createLinearGradient(node.x, node.y, other.x, other.y);
            grad.addColorStop(0, `rgba(99, 102, 241, ${opacity})`);
            grad.addColorStop(1, `rgba(34, 211, 238, ${opacity})`);
            
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            connections++;
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full opacity-60 mix-blend-screen pointer-events-none"
    />
  );
}
