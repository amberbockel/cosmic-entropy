import React from 'react';
import './Dashboard.css';

export interface SimulationSettings {
  gravity: number;
  timeSpeed: number;
  vortexScale: number;
  bloomStrength: number;
}

interface DashboardProps {
  settings: SimulationSettings;
  setSettings: React.Dispatch<React.SetStateAction<SimulationSettings>>;
}

export const Dashboard: React.FC<DashboardProps> = ({ settings, setSettings }) => {

  const updateSetting = (key: keyof SimulationSettings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <aside className="sandbox-dashboard">
      <div className="dashboard-header">
        <h2>Laboratory</h2>
        <p>Change the rules of the universe.</p>
      </div>

      <div className="control-group">
        <div className="control-header">
          <label htmlFor="gravity">Black Hole Pull</label>
          <span className="control-value">{settings.gravity.toFixed(2)}G</span>
        </div>
        <input 
          id="gravity"
          type="range" 
          min="0" max="2" step="0.05"
          value={settings.gravity}
          onChange={(e) => updateSetting('gravity', parseFloat(e.target.value))}
        />
        <div className="control-tooltip">
          How hard the invisible magnet in the center holds the universe together. Drag it to 0 to turn off gravity and watch the stars float away!
        </div>
      </div>

      <div className="control-group">
        <div className="control-header">
          <label htmlFor="timeSpeed">Time Machine</label>
          <span className="control-value">{settings.timeSpeed.toFixed(1)}x</span>
        </div>
        <input 
          id="timeSpeed"
          type="range" 
          min="0" max="3" step="0.1"
          value={settings.timeSpeed}
          onChange={(e) => updateSetting('timeSpeed', parseFloat(e.target.value))}
        />
        <div className="control-tooltip">
          Control how fast the universe ages. Fast forward to see the chaotic storms spin, or drag it down to 0 to freeze time completely.
        </div>
      </div>

      <div className="control-group">
        <div className="control-header">
          <label htmlFor="bloomStrength">Starlight Glow</label>
          <span className="control-value">{settings.bloomStrength.toFixed(2)}</span>
        </div>
        <input 
          id="bloomStrength"
          type="range" 
          min="0" max="2.5" step="0.05"
          value={settings.bloomStrength}
          onChange={(e) => updateSetting('bloomStrength', parseFloat(e.target.value))}
        />
        <div className="control-tooltip">
          Turn up the hidden energy of the tendrils, making them burn brighter and bleed magical neon light into the deep space around them.
        </div>
      </div>

    </aside>
  );
};
