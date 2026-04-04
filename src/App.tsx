import { useState } from 'react'
import { Background } from './components/Background'
import { Dashboard, type SimulationSettings } from './components/Dashboard'
import './App.css'

function App() {
  const [isSandboxVisible, setIsSandboxVisible] = useState(false);
  const [isScienceVisible, setIsScienceVisible] = useState(false);
  const [isEngineReady, setIsEngineReady] = useState(false);
  
  // Interactive Sandbox state
  const [settings, setSettings] = useState<SimulationSettings>({
    gravity: 0.8,
    timeSpeed: 1.5,
    vortexScale: 1.0,
    bloomStrength: 0.6 // Softened bloom to un-blob the stars
  });

  return (
    <>
      <div className={`loading-screen ${isEngineReady ? 'out' : ''}`}>
        <div className="loader-ring" />
        <p>INITIALIZING MACRO-PHYSICS...</p>
      </div>
      
      <Background settings={settings} onReady={() => setIsEngineReady(true)} />
      
      <main className="hero-overlay">
        <div className="title-container">
          <h1 className="hero-title">Cosmic Entropy</h1>
          <div className="subtitle-row">
            <p className="hero-subtitle">Transcendental Particles</p>
            <button 
              className="science-trigger"
              onClick={() => setIsScienceVisible(!isScienceVisible)}
            >
              {isScienceVisible ? 'HIDE' : 'READ THE SCIENCE'}
            </button>
          </div>
          
          {isScienceVisible && (
            <div className="science-summary">
              <p>
                This sandbox is an interactive WebGL simulation modeling the fundamental struggle that shapes our universe: the battle between <strong>Gravity</strong> and <strong>Thermodynamic Entropy</strong>.
              </p>
              <p>
                In astrophysics, the universe is organized into a massive, interconnected lattice called the <strong>Cosmic Web</strong>. This web exists purely because of Gravity pulling particles into dense nodes and trailing filaments.
              </p>
              <p>
                However, gravity is constantly fighting a losing battle against <strong>Entropy</strong> and <strong>Dark Energy</strong>—the forces pushing space apart. The twisting, chaotic "fluids" you see here are generated using 4D Perlin Noise to represent this entropic counter-force.
              </p>
              <p>
                When you scale down the Gravity slider, you are effectively watching Cosmic Heat Death in real time: the entropic noise overpowers the gravitational bonds, and the fluid dynamics scatter the organized starlight back into the infinite, unstructured void.
              </p>
            </div>
          )}
        </div>
      </main>

      <div className={`dashboard-wrapper ${isSandboxVisible ? 'visible' : 'hidden'}`}>
        <Dashboard settings={settings} setSettings={setSettings} />
      </div>

      <button 
        className={`info-toggle ${isSandboxVisible ? 'active' : ''}`}
        onClick={() => setIsSandboxVisible(!isSandboxVisible)}
        aria-label="Toggle Physics Sandbox"
      >
        {isSandboxVisible ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>
    </>
  )
}

export default App
