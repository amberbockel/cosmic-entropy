import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from '../shaders/particles';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import type { SimulationSettings } from '../components/Dashboard';
import './Background.css';

export const Background: React.FC<{ settings: SimulationSettings, onReady?: () => void, onInteract?: () => void }> = ({ settings, onReady, onInteract }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Self-contained camera zoom target
  const targetZRef = useRef(40);
  
  // Track settings in a ref to bypass the stale closure inside the animation loop
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    if (!mountRef.current) return;
    
    // Fallback native timestamp
    const initTime = Date.now();

    // SCENE SETUP
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020205, 0.015);

    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    
    // Automatically push camera back on narrow mobile screens so the torus radius fits horizontally
    const getResponsiveZ = (ratio: number) => ratio < 1.0 ? 40 / ratio : 40;
    
    camera.position.z = getResponsiveZ(aspect);
    targetZRef.current = camera.position.z;

    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for heavy post-processing
    renderer.setClearColor(0x020205); // Obsidian background
    mountRef.current.appendChild(renderer.domElement);

    // POST-PROCESSING PIPELINE
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.strength = 1.5; 
    bloomPass.radius = 1.0;
    bloomPass.threshold = 0.1;
    
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // GEOMETRY GENERATION
    const tendrilCount = 3000; // Restored high-density particle web!
    const segmentsPerTendril = 15;
    const totalVertices = tendrilCount * segmentsPerTendril;

    const positions = new Float32Array(totalVertices * 3);
    const lineIndices = new Float32Array(totalVertices);
    const randoms = new Float32Array(totalVertices * 3);
    const indices = [];

    let vertexIdx = 0;
    for (let i = 0; i < tendrilCount; i++) {
      // Each tendril shares a unique random seed for its position layout
      const rx = Math.random();
      const ry = Math.random();
      const rz = Math.random();

      for (let j = 0; j < segmentsPerTendril; j++) {
        // We only care about aLineIndex and aRandom, positions are computed 100% in vertex shader
        lineIndices[vertexIdx] = j / (segmentsPerTendril - 1);
        
        randoms[vertexIdx * 3] = rx;
        randoms[vertexIdx * 3 + 1] = ry;
        randoms[vertexIdx * 3 + 2] = rz;
        
        // Define line segment indices
        if (j < segmentsPerTendril - 1) {
          indices.push(vertexIdx, vertexIdx + 1);
        }
        
        vertexIdx++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    // Position array must exist for Three to not crash, though we overwrite it in shader
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aLineIndex', new THREE.BufferAttribute(lineIndices, 1));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));
    geometry.setIndex(indices);

    // MATERIAL SETUP
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0.0 },
        uGravityScale: { value: 0.8 },
        uNoiseScale: { value: 0.1 },
        uSpeed: { value: 1.5 },
        uBloomOverride: { value: 0.6 },
        uMouse: { value: new THREE.Vector2(-9999.0, -9999.0) },
        uAspect: { value: window.innerWidth / window.innerHeight }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false, // Don't block other lines from drawing
      linewidth: 1, // WebGL mostly limits to 1px wide lines, but bloom will thicken it visually!
    });

    const tendrilsMesh = new THREE.LineSegments(geometry, material);
    scene.add(tendrilsMesh);

    // MOUSE INTERACTION
    const targetMouse = new THREE.Vector2(-9999.0, -9999.0);
    const currentMouse = new THREE.Vector2(-9999.0, -9999.0);
    
    let lastInteractTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      // Isolate interaction: Ignore dashboard hovers to prevent UI interference
      if (e.target && (e.target as Element).closest && (e.target as Element).closest('.dashboard-wrapper')) {
        targetMouse.x = -9999.0;
        targetMouse.y = -9999.0;
        return;
      }

      targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      
      const now = Date.now();
      if (now - lastInteractTime > 500) { // Throttle interaction logs
        if (onInteract) onInteract();
        lastInteractTime = now;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      // Scale wheel delta down for smooth sweeping
      targetZRef.current += e.deltaY * 0.05;
      // Clamp between extreme close-up and pulled far out
      targetZRef.current = Math.max(10, Math.min(150, targetZRef.current));
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel, { passive: true });

    // ANIMATION LOOP
    let animationFrameId: number;

    const animate = () => {
      // Native fallback clock tracking
      const elapsedTime = (Date.now() - initTime) * 0.001;
      
      // Map interactive sandbox settings dynamically into the WebGL Engine each frame
      material.uniforms.uTime.value = elapsedTime;
      material.uniforms.uGravityScale.value = settingsRef.current.density;
      // Thermodynamic Velocity Engine: Kinetic energy maps to Temperature (Epoch)
      let targetSpeed = 1.0;
      if (settingsRef.current.epoch < 0.5) targetSpeed = 4.0; // Extreme Heat
      else if (settingsRef.current.epoch > 1.5) targetSpeed = 0.15; // Absolute Zero (Heat Death)

      // Lerp speed for smooth thermodynamic transitions
      material.uniforms.uSpeed.value += (targetSpeed - material.uniforms.uSpeed.value) * 0.05;
      // Pass the Dashboard 'bloom' slider purely as an alpha/brightness multiplier!
      material.uniforms.uBloomOverride.value = settingsRef.current.darkEnergy;
      bloomPass.strength = 0.05 + (settingsRef.current.darkEnergy * 0.15); // Heavily constrained glow injection

      // Smoothly interpolate mouse position for elegant interaction
      if (targetMouse.x === -9999.0) {
        // IDLE STATE: Keep mouse perfectly off-screen until user interacts
        material.uniforms.uMouse.value.set(-9999.0, -9999.0);
      } else {
        // ACTIVE STATE: Lerp towards real mouse
        if (currentMouse.x === -9999.0) currentMouse.copy(targetMouse);
        currentMouse.lerp(targetMouse, 0.3); // Increased tracking snappiness!
        material.uniforms.uMouse.value.set(currentMouse.x, currentMouse.y);
      }

      // Slowly rotate the entire tendril system
      tendrilsMesh.rotation.y = elapsedTime * 0.05;
      tendrilsMesh.rotation.z = elapsedTime * 0.02;

      // Smooth camera dollying for zoom control
      const targetZ = targetZRef.current;
      camera.position.z += (targetZ - camera.position.z) * 0.05;
      
      // Cinematic Camera Parallax: The entire universe sways 
      // relative to the active mouse position!
      if (targetMouse.x !== -9999.0) {
        // We shift the camera's X/Y softly in the direction of the cursor
        camera.position.x += (currentMouse.x * 12.0 - camera.position.x) * 0.04;
        camera.position.y += (currentMouse.y * 12.0 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);
      }

      const now = Date.now();
      frameCount++;
      
      // Auto-downgrade performance check every 1 second
      if (now - lastFPSCheck >= 1000) {
        if (!isDowngraded && elapsedTime > 3.0) { // Wait for shader compilation freeze to unblock
          if (frameCount < 45) { // If dipping below comfortable fluid framerate
            console.warn("Transcendental Engine: Hardware limit detected! Auto-downgrading from Cinematic Bloom to Native Render to preserve interactivity...");
            isDowngraded = true;
          }
        }
        frameCount = 0;
        lastFPSCheck = now;
      }

      if (isDowngraded) {
        renderer.render(scene, camera); // Lightweight fallback
      } else {
        composer.render(); // Heavy cinematic bloom
      }
      
      // Fire ready callback on EXACTLY the first successfully drawn frame
      if (!isReadyFired) {
        isReadyFired = true;
        
        // Use a tiny timeout to guarantee the browser actually painted the pixels
        setTimeout(() => {
            if (onReady) onReady();
        }, 50);
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    let isReadyFired = false;
    let frameCount = 0;
    let lastFPSCheck = Date.now();
    let isDowngraded = false;
    
    // Defer the synchronous WebGL compile by two frames to guarantee 
    // the browser paints the CSS loader ring before locking the main thread!
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        animate();
      });
    });

    const handleResize = () => {
      const aspect = window.innerWidth / window.innerHeight;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
      material.uniforms.uAspect.value = aspect;
      
      // Auto-adjust base zoom so mobile doesn't clip the outer bounds of the particles
      targetZRef.current = aspect < 1.0 ? 40 / aspect : 40;
    };
    window.addEventListener('resize', handleResize);

    // CLEANUP
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      cancelAnimationFrame(animationFrameId);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="particle-container" />;
};
