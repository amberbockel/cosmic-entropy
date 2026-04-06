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
    // 1. Hard-coded Presets and Epochs (Highest Priority for the preset buttons)
    if (settings.epoch === 0 && settings.density === 2.0 && settings.expansion === 2.5) {
        setCurrentObservation("🔥 THE BIG BANG: It's so hot and crowded that atoms can't even form! The soup is boiling!");
        return;
    }
    if (settings.epoch === 2 && settings.density === 0.0 && settings.expansion === 3.0) {
        setCurrentObservation("❄️ HEAT DEATH: The universe stretched so far that everything froze and drifted apart into the dark abyss.");
        return;
    }
    if (settings.epoch === 1 && settings.density === 0.8 && settings.expansion === 1.0) {
        setCurrentObservation("🌎 OUR GALAXY: Perfect balance! Gravity is gently clumping the soup together into stars.");
        return;
    }

    // 2. Interactive States
    if (isInteracting) {
      setCurrentObservation("✨ WOW: You made a galaxy! Your giant gravity well clumped the soup together into a solid chunk!");
      return;
    }

    // 3. Custom Physics Warnings
    if (settings.expansion > 2.0) {
        setCurrentObservation("🚨 WARNING: The universe is stretching way too fast! The soup is flying apart!");
        return;
    }
    if (settings.density < 0.2) {
        setCurrentObservation("🚨 WARNING: There isn't enough gravity left! Galaxies are floating away from each other.");
        return;
    }
    
    // 4. Default timeline scrubbing fallbacks
    if (settings.epoch < 0.5) setCurrentObservation("🪐 The Cosmic Soup: Everything is super hot! The particles bounce around like crazy!");
    else if (settings.epoch > 1.5) setCurrentObservation("❄️ Time Travel: Approaching absolute zero... the soup is freezing.");
    else setCurrentObservation("🪐 The Cosmic Soup: Cooling down! Gravity is taking over.");

  }, [settings, isInteracting]);

  return (
    <>
      <div className={`loading-screen ${isEngineReady ? 'out' : ''}`}>
        <div className="loader-ring" />
        <p>INITIALIZING MACRO-PHYSICS...</p>
      </div>

      <nav className="top-nav">
        <a href="https://amberbockel.com" className="nav-logo" aria-label="Amber Bockel">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 44" fill="currentColor" aria-hidden="true">
            <g transform="translate(37.647 11.44)">
              <path d="M 10.996 13.894 C 8.33 13.894 6.154 16.389 4.55 19.427 L 6.644 7.464 L 6.536 7.464 C 5.501 8.115 4.495 8.441 3.299 8.631 L 3.299 8.739 C 3.842 9.363 4.115 9.851 4.006 10.827 C 3.87 11.778 1.666 23.279 1.666 24.608 C 1.666 27.213 3.625 28.488 6.018 28.488 C 10.833 28.488 14.532 23.361 14.532 18.234 C 14.532 15.439 13.199 13.894 10.996 13.894 Z M 6.1 28.163 C 4.522 28.163 3.651 27.159 3.651 25.233 C 3.651 24.283 3.951 22.764 4.387 20.242 C 5.855 17.393 7.814 15.033 10.153 15.033 C 11.512 15.033 12.356 16.145 12.356 18.261 C 12.356 22.357 9.827 28.163 6.1 28.163 Z M 20.434 28.488 C 25.031 28.488 28.512 24.121 28.512 19.508 C 28.512 16.064 26.309 13.894 23.045 13.894 C 18.449 13.894 14.966 18.315 14.966 22.9 C 14.966 26.372 17.142 28.488 20.434 28.488 Z M 20.488 28.163 C 18.449 28.061 17.061 26.481 17.061 23.686 C 17.061 19.726 19.509 14.219 22.964 14.219 C 25.031 14.219 26.391 15.983 26.391 18.749 C 26.391 22.737 23.97 28.163 20.488 28.163 Z M 34.386 28.488 C 36.889 28.488 38.766 27.05 39.882 25.396 L 39.826 25.287 C 38.631 26.697 37.052 27.267 35.556 27.267 C 32.945 27.267 31.422 25.314 31.422 22.466 C 31.422 18.858 33.843 14.219 37.215 14.219 C 39.337 14.219 39.854 16.931 40.017 17.745 L 40.099 17.745 L 41.378 15.493 C 40.697 14.842 39.473 13.894 37.434 13.894 C 32.646 13.894 29.137 18.125 29.137 22.954 C 29.137 26.399 31.231 28.488 34.386 28.488 Z M 52.991 26.507 C 52.392 27.294 51.903 27.647 51.386 27.647 C 50.652 27.647 50.163 26.725 49.89 26.182 L 47.905 21.652 C 51.549 20.187 54.051 17.284 54.051 15.467 C 54.051 14.354 53.371 13.894 52.175 13.894 C 49.699 13.894 46.354 17.637 44.341 20.295 L 46.599 7.491 L 46.436 7.491 C 45.403 8.115 44.559 8.387 43.171 8.657 L 43.145 8.766 C 43.77 9.309 44.096 10.014 43.933 10.99 L 41.186 26.318 C 41.023 27.104 40.643 27.756 39.854 28.135 L 39.826 28.298 L 43.907 28.298 L 43.933 28.135 C 43.226 27.837 43.145 27.05 43.281 26.318 L 44.233 20.892 C 45.918 18.586 48.748 15.168 50.787 15.168 C 51.521 15.168 51.903 15.683 51.903 16.578 C 51.903 18.858 49.291 20.838 45.892 22.059 L 47.416 25.64 C 48.15 27.403 48.802 28.488 50.38 28.488 C 51.386 28.488 52.311 28.135 53.073 26.562 L 53.019 26.507 Z M 60.471 27.267 C 57.941 27.267 56.553 25.449 56.336 22.926 C 60.879 22.167 66.019 20.756 66.019 17.04 C 66.019 15.195 64.605 13.894 62.048 13.894 C 57.506 13.894 53.997 18.098 53.997 22.845 C 53.997 26.453 56.282 28.488 59.519 28.488 C 61.939 28.488 63.898 27.132 65.257 25.205 L 65.176 25.097 C 63.843 26.697 62.238 27.267 60.471 27.267 Z M 61.967 14.219 C 63.435 14.219 64.251 15.033 64.251 16.552 C 64.251 20.024 60.77 21.815 56.309 22.737 L 56.309 22.249 C 56.309 18.586 58.729 14.219 61.967 14.219 Z M 68.195 28.488 C 69.256 28.488 70.071 27.945 70.751 26.562 L 70.697 26.481 L 70.67 26.481 C 70.234 27.213 69.717 27.457 69.011 27.457 C 68.548 27.457 68.195 26.996 68.44 25.721 L 71.676 7.464 L 71.568 7.464 C 70.561 8.088 69.664 8.387 68.359 8.631 L 68.331 8.739 C 68.848 9.282 69.202 9.824 69.011 10.99 L 66.509 25.124 C 66.074 27.457 66.889 28.488 68.195 28.488 Z"/>
            </g>
            <g transform="translate(0 0)">
              <path d="M 10.969 8.052 L 14.742 8.052 L 14.742 21.944 L 10.969 21.944 L 10.969 20.385 C 10.197 21.388 9.029 21.889 7.467 21.889 C 5.564 21.907 3.93 21.244 2.564 19.899 C 1.196 18.559 0.505 16.928 0.486 15.009 C 0.47 13.111 1.136 11.482 2.481 10.119 C 3.829 8.76 5.464 8.07 7.384 8.051 C 8.965 8.051 10.16 8.562 10.969 9.582 Z M 9.838 17.374 C 10.502 16.712 10.835 15.906 10.835 14.959 C 10.835 13.991 10.493 13.184 9.811 12.539 C 9.127 11.858 8.327 11.535 7.412 11.572 C 6.462 11.572 5.654 11.904 4.99 12.566 C 4.325 13.23 3.993 14.035 3.993 14.982 C 3.993 15.915 4.333 16.721 5.013 17.402 C 5.677 18.065 6.486 18.396 7.439 18.396 C 8.41 18.359 9.21 18.019 9.838 17.374 Z M 33.065 8.079 C 34.931 8.043 36.447 8.615 37.614 9.743 C 38.874 10.925 39.503 12.583 39.503 14.716 L 39.503 21.944 L 36.001 21.944 L 36.001 14.959 C 36.001 14.691 35.955 14.385 35.864 14.042 C 35.737 13.629 35.567 13.263 35.353 12.942 C 34.777 12.029 33.933 11.572 32.821 11.572 C 31.636 11.572 30.773 12.029 30.234 12.942 C 30.034 13.281 29.89 13.666 29.802 14.097 C 29.732 14.396 29.696 14.702 29.696 15.009 L 29.696 21.944 L 26.166 21.944 L 26.166 14.959 C 26.166 14.691 26.121 14.385 26.029 14.042 C 25.921 13.629 25.76 13.263 25.546 12.942 C 24.951 12.029 24.108 11.572 23.014 11.572 C 21.81 11.572 20.938 12.029 20.399 12.942 C 20.199 13.281 20.056 13.666 19.967 14.097 C 19.897 14.396 19.862 14.702 19.861 15.009 L 19.861 21.944 L 16.089 21.944 L 16.089 8.051 L 19.862 8.051 L 19.862 9.5 C 20.741 8.554 21.871 8.079 23.254 8.079 C 25.285 8.043 26.928 8.821 28.184 10.417 L 29.32 9.367 C 30.379 8.509 31.628 8.079 33.065 8.079 Z M 49.12 8.107 C 51.041 8.123 52.675 8.811 54.024 10.174 C 55.371 11.537 56.036 13.167 56.018 15.064 C 56 16.98 55.307 18.611 53.941 19.955 C 52.577 21.3 50.942 21.962 49.037 21.944 C 47.404 21.944 45.941 21.416 44.649 20.358 L 44.649 21.944 L 40.876 21.944 L 40.848 3.189 L 44.621 3.189 L 44.621 9.743 C 45.914 8.652 47.413 8.107 49.12 8.107 Z M 51.491 17.457 C 52.137 16.813 52.48 16.006 52.516 15.037 C 52.516 14.123 52.183 13.318 51.519 12.621 C 50.854 11.959 50.045 11.627 49.093 11.627 C 48.157 11.627 47.349 11.95 46.666 12.594 C 46.001 13.257 45.669 14.063 45.669 15.009 C 45.634 15.942 45.958 16.749 46.639 17.429 C 47.288 18.074 48.096 18.415 49.065 18.451 C 50.017 18.451 50.826 18.12 51.491 17.457 Z M 70.35 15.628 C 70.369 16.004 70.369 16.228 70.35 16.302 L 60.217 16.274 C 60.36 16.687 60.621 17.081 60.998 17.457 C 61.699 18.12 62.508 18.451 63.424 18.451 C 64.395 18.415 65.204 18.074 65.851 17.429 L 65.957 17.324 L 69.459 18.424 C 68.686 19.625 67.879 20.485 67.037 21.004 C 66.083 21.613 64.888 21.925 63.452 21.944 C 61.549 21.962 59.915 21.3 58.549 19.955 C 57.181 18.611 56.49 16.98 56.471 15.064 C 56.455 13.167 57.121 11.537 58.466 10.174 C 59.814 8.811 61.448 8.123 63.369 8.107 C 65.274 8.088 66.909 8.751 68.273 10.091 C 69.639 11.436 70.332 13.066 70.35 14.982 Z M 63.397 11.627 C 62.447 11.627 61.639 11.959 60.975 12.621 C 60.631 12.997 60.388 13.373 60.244 13.749 L 66.577 13.749 C 66.432 13.373 66.182 12.988 65.824 12.594 C 65.14 11.95 64.331 11.627 63.397 11.627 Z M 74.957 10.174 C 75.261 9.315 75.772 8.715 76.492 8.373 C 77.193 8.033 78.244 7.864 79.645 7.864 L 79.645 11.705 C 78.278 11.705 77.137 12.171 76.221 13.103 C 75.378 13.927 74.957 14.833 74.957 15.816 L 74.957 21.944 L 71.184 21.944 L 71.184 8.107 L 74.957 8.107 Z"/>
            </g>
          </svg>
        </a>
      </nav>
      
      <Background 
        settings={settings} 
        onReady={() => setIsEngineReady(true)} 
        onInteract={() => setIsInteracting(prev => !prev)} 
      />
      
      <main className="hero-overlay">
        <div className="title-container">
          <h1 className="hero-title">Cosmic Entropy</h1>
          <div className="subtitle-row">
            <p className="hero-subtitle">An Interactive Physics Sandbox</p>
            <button 
              className="science-trigger"
              onClick={() => setIsScienceVisible(!isScienceVisible)}
            >
              {isScienceVisible ? 'HIDE' : 'HOW IT WORKS'}
            </button>
          </div>
          
          {isScienceVisible && (
            <div className="science-summary">
              <p>
                Welcome to the <strong>Cosmic Soup!</strong> This sandbox lets you play with the mathematical rules that control the entire universe.
              </p>
              <p>
                The universe is governed by <strong>Thermodynamics</strong>. Basically: things that are hot have lots of energy and bounce around incredibly fast! Things that are cold lose their energy, slow down, and eventually freeze dead in their tracks.
              </p>
              <p>
                Use the controls on the right to time-travel! If you go all the way back to the beginning of time (<strong>The Big Bang</strong>), the universe was so hot and crowded that the soup was furiously boiling. If you travel all the way to the end of time (<strong>Heat Death</strong>), the soup stretches so far apart that the stars completely freeze!
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

      <footer className="site-footer">
        <a href="https://amberbockel.com" target="_blank" rel="noopener noreferrer">A project by amberbockel.com</a>
      </footer>
    </>
  )
}

export default App
