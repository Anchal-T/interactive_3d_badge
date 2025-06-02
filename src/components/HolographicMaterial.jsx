import * as THREE from 'three'
import { useRef, useState, useEffect } from 'react'
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
    uniform sampler2D normalTexture;
    uniform vec3 cardGlow;
    varying vec2 vUv;    void main() {
      // Rotate UV coordinates for proper card orientation (90 degrees counter-clockwise)
      vec2 cardUV = vec2(1.0 - vUv.y, vUv.x);
      
      // Base card texture with rotated UVs
      vec4 color = texture2D(cardTexture, cardUV);
      
      // Get normal map data
      vec3 normal = texture2D(normalTexture, vUv).rgb * 2.0 - 1.0;
      
      // Noise texture for varied reflections
      vec3 noise = texture2D(noiseTexture, vUv * 0.5 + time * 0.01).rgb;
      
      // Calculate holographic effect coordinates
      vec2 holoUV = vUv;
      
      // Dynamic holographic effect based on pointer position
      float pX = (pointerX - 0.5) * 2.0;
      float pY = (pointerY - 0.5) * 2.0;
      
      // Distort UVs based on pointer position and normal map
      holoUV.x += pX * 0.1 * normal.x;
      holoUV.y += pY * 0.1 * normal.y;
      
      // Additional distortion for more dynamic effect
      holoUV += noise.xy * 0.05;
      
      // Apply time-based movement
      holoUV.x += sin(time * 0.2 + vUv.y * 10.0) * 0.01;
      holoUV.y += cos(time * 0.3 + vUv.x * 8.0) * 0.01;
      
      // Holo texture with distortion
      vec4 holo = texture2D(holoTexture, holoUV);
      
      // Create glare effect based on pointer position
      float glareAngle = atan(pY, pX);
      float glareDist = smoothstep(0.0, 1.0, 1.0 - distance(vec2(pointerX, pointerY), vUv) * 2.0);
      float glare = sin(glareAngle * 5.0 + time) * 0.5 + 0.5;
      glare *= glareDist * pointerFromCenter;
      
      // Grain effect
      vec3 grain = texture2D(grainTexture, vUv * 2.0 + time * 0.05).rgb;
      
      // Blend the holographic effect with the base texture
      vec3 finalColor = mix(color.rgb, holo.rgb * cardGlow, holo.a * 0.8 * (noise.r * 0.5 + 0.5));
      
      // Add glare and grain effects
      finalColor += cardGlow * glare * 0.3;
      finalColor *= mix(vec3(1.0), grain, 0.1);
      
      gl_FragColor = vec4(finalColor, color.a);
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
      holoTexture={holoTexture}
      grainTexture={grainTexture || holoTexture}
      noiseTexture={noiseTexture || grainTexture || holoTexture}
      normalTexture={normalTexture || holoTexture}
      transparent
      cardGlow={new THREE.Color(selectedColor)}
    />
  )
}