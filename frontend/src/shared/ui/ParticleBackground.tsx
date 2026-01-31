'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticlesProps {
  count?: number
  mouse: React.MutableRefObject<{ x: number; y: number }>
}

function Particles({ count = 2000, mouse }: ParticlesProps) {
  const mesh = useRef<THREE.Points>(null)
  const { viewport } = useThree()

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    const colorPalette = [
      new THREE.Color('#8b5cf6'),
      new THREE.Color('#a78bfa'),
      new THREE.Color('#6366f1'),
      new THREE.Color('#818cf8'),
      new THREE.Color('#c4b5fd'),
    ]

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      
      const radius = 15 + Math.random() * 10
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi) - 15

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)]
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
    }

    return [positions, colors]
  }, [count])

  const originalPositions = useRef<Float32Array>(new Float32Array(positions))

  useEffect(() => {
    originalPositions.current = new Float32Array(positions)
  }, [positions])

  useFrame((state) => {
    if (!mesh.current) return

    const time = state.clock.getElapsedTime()
    const positionAttribute = mesh.current.geometry.getAttribute('position') as THREE.BufferAttribute
    const posArray = positionAttribute.array as Float32Array

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      const originalX = originalPositions.current[i3]
      const originalY = originalPositions.current[i3 + 1]
      const originalZ = originalPositions.current[i3 + 2]

      posArray[i3] = originalX + Math.sin(time * 0.3 + i * 0.01) * 0.3
      posArray[i3 + 1] = originalY + Math.cos(time * 0.2 + i * 0.01) * 0.3
      posArray[i3 + 2] = originalZ + Math.sin(time * 0.1 + i * 0.01) * 0.2

      const mouseX = (mouse.current.x * viewport.width) / 2
      const mouseY = (mouse.current.y * viewport.height) / 2
      
      const dx = posArray[i3] - mouseX
      const dy = posArray[i3 + 1] - mouseY
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      if (dist < 3) {
        const force = (3 - dist) / 3
        posArray[i3] += dx * force * 0.1
        posArray[i3 + 1] += dy * force * 0.1
      }
    }

    positionAttribute.needsUpdate = true

    mesh.current.rotation.y = time * 0.02
    mesh.current.rotation.x = Math.sin(time * 0.1) * 0.05
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function ConnectionLines({ count = 300 }: ParticlesProps) {
  const linesRef = useRef<THREE.LineSegments>(null)

  const [positions] = useState<Float32Array>(() => {
    const pos = new Float32Array(count * 2 * 3)
    for (let i = 0; i < count * 2; i++) {
      const i3 = i * 3
      const radius = 8 + Math.random() * 7
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      pos[i3] = radius * Math.sin(phi) * Math.cos(theta)
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      pos[i3 + 2] = radius * Math.cos(phi) - 15
    }
    return pos
  })

  useFrame((state) => {
    if (!linesRef.current) return
    
    const time = state.clock.getElapsedTime()
    linesRef.current.rotation.y = time * 0.015
    linesRef.current.rotation.z = Math.sin(time * 0.05) * 0.02
  })

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count * 2}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#8b5cf6"
        transparent
        opacity={0.15}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  )
}

interface ParticleBackgroundProps {
  className?: string
}

export function ParticleBackground({ className = '' }: ParticleBackgroundProps) {
  const mouse = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div ref={containerRef} className={`absolute inset-0 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 10, 40]} />
        
        <ambientLight intensity={0.5} />
        
        <Particles count={1500} mouse={mouse} />
        <ConnectionLines count={200} mouse={mouse} />
      </Canvas>
    </div>
  )
}
