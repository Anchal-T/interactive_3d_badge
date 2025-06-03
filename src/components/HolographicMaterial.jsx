import * as THREE from 'three'
import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'

// Holographic shader material that mimics the Pokemon cards effect
const HolographicShaderMaterial = shaderMaterial(
  {
    time: 0,
    pointerX: 0.5,
    pointerY: 0.5,
    cardTexture: null,
    holoTexture: null,
    grainTexture: null,
    noiseTexture: null,
    normalTexture: null,
    cardGlow: new THREE.Color('#5DC9E2'), // Default color - can be changed like in Pokemon cards
    pointerFromCenter: 0.5,
  },
  // Vertex shader
  /*glsl*/`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader - mimicking the Pokemon cards holographic effect
  /*glsl*/`
    uniform float time;
    uniform float pointerX;
    uniform float pointerY;
    uniform float pointerFromCenter;
    uniform sampler2D cardTexture;
    uniform sampler2D holoTexture;
    uniform sampler2D grainTexture;
    uniform sampler2D noiseTexture;
    uniform sampler2D normalTexture;    uniform vec3 cardGlow;
    varying vec2 vUv;      void main() {
      // Use UV coordinates for correct card orientation and proper centering
      vec2 cardUV = vUv;
      
      // Base card texture
      vec4 color = texture2D(cardTexture, cardUV);
      
      // Dynamic holographic effect based on pointer position
      float pX = (pointerX - 0.5) * 2.0;
      float pY = (pointerY - 0.5) * 2.0;
      
      // Calculate holographic effect coordinates with subtle distortion
      vec2 holoUV = vUv;
      holoUV.x += pX * 0.02; // Reduced distortion
      holoUV.y += pY * 0.02;
      
      // Apply time-based movement for shimmer effect
      holoUV.x += sin(time * 0.3 + vUv.y * 8.0) * 0.005;
      holoUV.y += cos(time * 0.4 + vUv.x * 6.0) * 0.005;
      
      // Holo texture - this goes behind the card
      vec4 holo = texture2D(holoTexture, holoUV);
      
      // Create subtle glare effect based on pointer position
      float glareDist = 1.0 - distance(vec2(pointerX, pointerY), vUv);
      float glare = smoothstep(0.3, 0.8, glareDist) * pointerFromCenter;
      glare *= 0.15; // Much more subtle
      
      // Grain effect for texture
      vec3 grain = texture2D(grainTexture, vUv * 3.0).rgb;
        // Start with the holographic background
      vec3 finalColor = holo.rgb * cardGlow * 0.2; // More subtle background effect
      
      // Layer the card image on top with stronger presence
      finalColor = mix(finalColor, color.rgb, 0.9); // Make card texture more prominent
      
      // Add very subtle glare highlights
      finalColor += cardGlow * glare * 0.1;
      
      // Apply subtle grain texture
      finalColor *= mix(vec3(1.0), grain, 0.05);
      
      // Brighten the overall result
      finalColor *= 1.2;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
)

// Extend the material to Three.js
extend({ HolographicShaderMaterial })

export function HolographicMaterial({ 
  cardTexture, 
  holoTexture,
  grainTexture,
  noiseTexture,
  normalTexture, 
  type = 'water' // Use Pokemon card types: water, fire, grass, etc.
}) {
  const materialRef = useRef()
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.5 })
  
  // Create a default holographic texture if none provided
  const defaultHoloTexture = useMemo(() => {
    if (holoTexture) return holoTexture
    // Create a simple gradient texture as fallback
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createLinearGradient(0, 0, 256, 256)
    gradient.addColorStop(0, '#ff00ff')
    gradient.addColorStop(0.5, '#00ffff')
    gradient.addColorStop(1, '#ffff00')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 256, 256)
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    return texture
  }, [holoTexture])
  
  // Map Pokemon card types to glow colors like in the original repo
  const typeColors = {
    water: '#5DC9E2',
    fire: '#F24333',
    grass: '#9BDF4A',
    lightning: '#FBD100',
    psychic: '#D33FE6',
    fighting: '#915A27',
    darkness: '#054863',
    metal: '#8A8D90',
    colorless: '#E3D6D1',
    dragon: '#796BBE'
  }

  const selectedColor = typeColors[type] || typeColors.water
  
  // Track pointer movement globally
  useEffect(() => {
    const handleMouseMove = (event) => {
      setPointer({
        x: event.clientX / window.innerWidth,
        y: 1 - (event.clientY / window.innerHeight) // Invert Y for correct orientation
      })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  
  // Update shader uniforms
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime
      materialRef.current.uniforms.pointerX.value = pointer.x
      materialRef.current.uniforms.pointerY.value = pointer.y
      
      // Calculate distance from center like in Pokemon cards
      const fromCenter = Math.sqrt(
        Math.pow(pointer.x - 0.5, 2) + 
        Math.pow(pointer.y - 0.5, 2)
      ) * 2
      materialRef.current.uniforms.pointerFromCenter.value = fromCenter
      
      // Update color if needed
      materialRef.current.uniforms.cardGlow.value.set(selectedColor)
    }
  })
    return (
    <holographicShaderMaterial 
      ref={materialRef}
      cardTexture={cardTexture}
      holoTexture={defaultHoloTexture}
      grainTexture={grainTexture || defaultHoloTexture}
      noiseTexture={noiseTexture || grainTexture || defaultHoloTexture}
      normalTexture={normalTexture || defaultHoloTexture}
      transparent
      cardGlow={new THREE.Color(selectedColor)}
    />
  )
}