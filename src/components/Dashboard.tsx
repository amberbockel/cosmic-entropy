import React from 'react';
import './Dashboard.css';

export interface SimulationSettings {
  epoch: number;
  density: number;
  expansion: number;
  darkEnergy: number;
}

interface DashboardProps {
  settings: SimulationSettings;
  setSettings: React.Dispatch<React.SetStateAction<SimulationSettings>>;
  observation?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ settings, setSettings, observation }) => {

  const updateSetting = (key: keyof SimulationSettings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleEpochChange = (val: number) => {
    const t = val / 2.0; // 0.0 to 1.0

    // density: 2.0 at start, 0.8 at mid, 0.0 at end
    let density = 0.8;
    if (t < 0.5) density = 2.0 - (t * 2.0) * 1.2;
    else density = 0.8 - ((t - 0.5) * 2.0) * 0.8;

    // expansion: 2.5 at start, 1.5 at mid, 3.0 at end
    let expansion = 1.5;
    if (t < 0.5) expansion = 2.5 - (t * 2.0) * 1.0;
    else expansion = 1.5 + ((t - 0.5) * 2.0) * 1.5;

    // darkEnergy: 2.0 at start, 0.6 at mid, 0.0 at end
    let darkEnergy = 0.6;
    if (t < 0.5) darkEnergy = 2.0 - (t * 2.0) * 1.4;
    else darkEnergy = 0.6 - ((t - 0.5) * 2.0) * 0.6;

    setSettings({
      epoch: val,
      density,
      expansion,
      darkEnergy
    });
  };

  const applyPreset = (preset: 'plasma' | 'current' | 'heat_death') => {
    switch (preset) {
      case 'plasma':
        setSettings({ epoch: 0, density: 2.0, expansion: 2.5, darkEnergy: 2.0 });
        break;
      case 'current':
        setSettings({ epoch: 1, density: 0.8, expansion: 1.0, darkEnergy: 0.7 });
        break;
      case 'heat_death':
        setSettings({ epoch: 2, density: 0.0, expansion: 3.0, darkEnergy: 0.0 });
        break;
    }
  };

  const epochLabels = ["Plasma", "Cosmic Web", "Heat Death"];

  return (
    <aside className="sandbox-dashboard">
      <div className="dashboard-header">
        <h2>Interactive Sandbox</h2>
        <p>Mathematical Constraints of the Universe</p>
      </div>

      <div className="mechanic-hint">
        <strong>🥣 The Cosmic Soup:</strong>
        The glowing dots represent matter moving through space. High heat makes them bounce faster, while low temperatures slow them down!
        <div style={{ marginTop: '0.4rem', marginBottom: '0.4rem', padding: '0.4rem', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
          <strong>🌡️ Temperature Scale:</strong><br/>
          🔥 <span style={{ color: '#fbbf24' }}>Yellow</span>/<span style={{ color: '#f43f5e' }}>Red</span> = Boiling Hot & Fast<br/>
          ❄️ <span style={{ color: '#a855f7' }}>Magenta</span>/<span style={{ color: '#3b82f6' }}>Blue</span> = Freezing & Slow
        </div>
        <strong>🎮 Interactive Physics Tool:</strong> 
        Your mouse represents a <em>Supermassive Black Hole</em>. Move it around the canvas to bend gravity and scoop the soup into glowing galaxies!
      </div>

      {observation && (
        <div className="observation-card">
          <span className="observation-badge">LIVE OBSERVATION</span>
          <p className="observation-text">{observation}</p>
        </div>
      )}

      <div className="preset-buttons">
        <button onClick={() => applyPreset('current')} title="Our Current Universe">🌎 Our Galaxy</button>
        <button onClick={() => applyPreset('plasma')} title="Primordial Chaos">🔥 Initial State</button>
        <button onClick={() => applyPreset('heat_death')} title="Absolute Zero Freezing">❄️ Heat Death</button>
      </div>

      <div className="control-group epoch-group">
        <div className="control-header">
          <label htmlFor="epoch">Cosmological Timeline</label>
          <span className="control-value">{epochLabels[settings.epoch] || "Custom"}</span>
        </div>
        <input 
          id="epoch"
          type="range" 
          min="0" max="2" step="1"
          value={settings.epoch}
          onChange={(e) => handleEpochChange(parseInt(e.target.value))}
        />
        <div className="control-tooltip">
          Travel through Time: Start at the super hot beginning, watch matter pull into a giant spider web, and end with everything frozen and drifting in the dark.
        </div>
      </div>

      <div className="control-group">
        <div className="control-header">
          <label htmlFor="density">Matter Density (Ωm)</label>
          <span className="control-value">{settings.density.toFixed(2)}</span>
        </div>
        <input 
          id="density"
          type="range" 
          min="0" max="2" step="0.05"
          value={settings.density}
          onChange={(e) => updateSetting('density', parseFloat(e.target.value))}
        />
        <div className="control-tooltip">
          This changes how much "stuff" (gravity) is in the universe. Too much stuff pulls everything together into a crush! Too little stuff lets everything float away forever.
          <strong style={{display: 'block', marginTop: '4px', color: '#0df'}}>
            {settings.density > 1.8 ? 'State: Everything Squished Together!' : settings.density < 0.2 ? 'State: Floating Away...' : 'State: Balanced Space Web'}
          </strong>
        </div>
      </div>

      <div className="control-group">
        <div className="control-header">
          <label htmlFor="expansion">Hubble Expansion (H0)</label>
          <span className="control-value">{settings.expansion.toFixed(1)}x</span>
        </div>
        <input 
          id="expansion"
          type="range" 
          min="0.1" max="3" step="0.1"
          value={settings.expansion}
          onChange={(e) => updateSetting('expansion', parseFloat(e.target.value))}
        />
        <div className="control-tooltip">
          This changes how fast the universe is stretching like a giant rubber band!
          <strong style={{display: 'block', marginTop: '4px', color: '#0df'}}>
            {settings.expansion > 2.2 ? 'State: Ripping Apart!' : settings.expansion < 0.5 ? 'State: Frozen in Place' : 'State: Growing Smoothly'}
          </strong>
        </div>
      </div>

      <div className="control-group">
        <div className="control-header">
          <label htmlFor="darkEnergy">Dark Energy (ΩΛ)</label>
          <span className="control-value">{settings.darkEnergy.toFixed(2)}</span>
        </div>
        <input 
          id="darkEnergy"
          type="range" 
          min="0" max="2.5" step="0.05"
          value={settings.darkEnergy}
          onChange={(e) => updateSetting('darkEnergy', parseFloat(e.target.value))}
        />
        <div className="control-tooltip">
          The latent repulsive energy hidden in the vacuum of space. Increases the amplitude of the entropic noise function and thermal bloom.
        </div>
      </div>

    </aside>
  );
};
