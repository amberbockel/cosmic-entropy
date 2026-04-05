import { useState } from 'react'
import { Background } from './components/Background'
import { Dashboard, type SimulationSettings } from './components/Dashboard'
import { useEffect } from 'react'
import './App.css'

function App() {
  const [isSandboxVisible, setIsSandboxVisible] = useState(true);
  const [isScienceVisible, setIsScienceVisible] = useState(false);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  
  // Cosmological Physics state
  const [settings, setSettings] = useState<SimulationSettings>({
    epoch: 0, // 0 = Plasma Era (Maximum Interactivity)
    density: 2.0,
    expansion: 2.5,
    darkEnergy: 2.0
  });

  const [currentObservation, setCurrentObservation] = useState("We are at the beginning of Time. Try moving the sliders or your mouse!");

  useEffect(() => {
    if (settings.epoch === 0) setCurrentObservation("🪐 TIME TRAVEL: The very beginning! It's so hot and crowded that atoms can't even form yet!");
    else if (settings.epoch === 1) setCurrentObservation("🪐 TIME TRAVEL: The Cosmic Web! Gravity is pulling matter together like a giant spider web in space.");
    else if (settings.epoch === 2) setCurrentObservation("❄️ TIME TRAVEL: The End of Everything. The universe stretched so far that everything froze and drifted apart.");
  }, [settings.epoch]);

  useEffect(() => {
    if (settings.expansion > 2.0) setCurrentObservation("🚨 WARNING: The universe is stretching way too fast! The space web is ripping apart!");
    if (settings.density < 0.2) setCurrentObservation("🚨 WARNING: There isn't enough gravity left! Galaxies are floating away from each other.");
  }, [settings.expansion, settings.density]);

  useEffect(() => {
    if (isInteracting) {
      setCurrentObservation("✨ WOW: You made a galaxy! But remember: creating order here makes the rest of space more chaotic!");
    }
  }, [isInteracting]);

  return (
    <>
      <div className={`loading-screen ${isEngineReady ? 'out' : ''}`}>
        <div className="loader-ring" />
        <p>INITIALIZING MACRO-PHYSICS...</p>
      </div>
      
      <Background 
        settings={settings} 
        onReady={() => setIsEngineReady(true)} 
        onInteract={() => setIsInteracting(prev => !prev)} 
      />
      
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
                This sandbox is an interactive WebGL simulation mapping the fundamental struggle that dictates the fate of our universe: the battle between <strong>Matter Density (Ωm)</strong> and <strong>Dark Energy (ΩΛ)</strong>.
              </p>
              <p>
                As governed by Information Theory and the Second Law of Thermodynamics, entropy represents the "hidden information" of a system. To visually demonstrate this, drag your mouse across the canvas. You will create a vortex of <strong>Local Order</strong> (a planetary orbit or star system). However, watch closely: generating this localized structure vigorously agitates the underlying quantum noise field around it, visually demonstrating that creating pockets of order necessitates a massive increase in <strong>Global Entropy</strong>!
              </p>
              <p>
                In the Laboratory, you can travel entirely outside the human timeline. Use the Epoch slider to reverse time to the ultra-dense Planck Epoch ($10^&#123;-43&#125;$ seconds), or slide it forward to witness Heat Death in the Black Hole Era—where matter density reaches zero, and the universe disperses entirely back into the void.
              </p>
            </div>
          )}
        </div>
      </main>

      <div className={`dashboard-wrapper ${isSandboxVisible ? 'visible' : 'hidden'}`}>
        <Dashboard settings={settings} setSettings={setSettings} observation={currentObservation} />
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
