import React from 'react';
import './ConfigurationForm.css';

function ConfigurationForm({ config, onConfigChange }) {
  const handleChange = (field, value) => {
    const newConfig = { ...config, [field]: value };
    onConfigChange(newConfig);
  };

  return (
    <div className="config-form">
      <h2>⚙️ Configuration</h2>
      
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="sheetWidth">
            Sheet Width (mm)
            <span className="tooltip" title="Width of your material sheet">
              ℹ️
            </span>
          </label>
          <input
            type="number"
            id="sheetWidth"
            value={config.sheetWidth}
            onChange={(e) => handleChange('sheetWidth', parseFloat(e.target.value) || 0)}
            min="1"
            step="1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="sheetHeight">
            Sheet Height (mm)
            <span className="tooltip" title="Height of your material sheet">
              ℹ️
            </span>
          </label>
          <input
            type="number"
            id="sheetHeight"
            value={config.sheetHeight}
            onChange={(e) => handleChange('sheetHeight', parseFloat(e.target.value) || 0)}
            min="1"
            step="1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="margin">
            Margin (mm)
            <span className="tooltip" title="Minimum spacing between parts">
              ℹ️
            </span>
          </label>
          <input
            type="number"
            id="margin"
            value={config.margin}
            onChange={(e) => handleChange('margin', parseFloat(e.target.value) || 0)}
            min="0"
            step="0.1"
          />
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={config.allowRotation}
              onChange={(e) => handleChange('allowRotation', e.target.checked)}
            />
            <span>Allow Rotation</span>
            <span className="tooltip" title="Allow parts to be rotated for better fit">
              ℹ️
            </span>
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="feedRate">
            Feed Rate (mm/min)
            <span className="tooltip" title="Cutting speed for G-code">
              ℹ️
            </span>
          </label>
          <input
            type="number"
            id="feedRate"
            value={config.feedRate}
            onChange={(e) => handleChange('feedRate', parseFloat(e.target.value) || 0)}
            min="1"
            step="10"
          />
        </div>

        <div className="form-group">
          <label htmlFor="cutDepth">
            Cut Depth (mm)
            <span className="tooltip" title="Cutting depth (negative value)">
              ℹ️
            </span>
          </label>
          <input
            type="number"
            id="cutDepth"
            value={config.cutDepth}
            onChange={(e) => handleChange('cutDepth', parseFloat(e.target.value) || 0)}
            max="0"
            step="0.1"
          />
        </div>

        <div className="form-group form-group-full">
          <label htmlFor="projectName">Project Name (for PDF reports)</label>
          <input
            type="text"
            id="projectName"
            value={config.projectName || ''}
            onChange={(e) => handleChange('projectName', e.target.value)}
            placeholder="e.g. MINDA OUT"
          />
        </div>

        <div className="form-group">
          <label htmlFor="materialSpec">Material Spec</label>
          <input
            type="text"
            id="materialSpec"
            value={config.materialSpec || ''}
            onChange={(e) => handleChange('materialSpec', e.target.value)}
            placeholder="e.g. GI, 0.6mm"
          />
        </div>

        <div className="form-group">
          <label htmlFor="materialThickness">Material Thickness (mm)</label>
          <input
            type="number"
            id="materialThickness"
            value={config.materialThickness ?? ''}
            onChange={(e) => handleChange('materialThickness', parseFloat(e.target.value) || 0)}
            min="0"
            step="0.1"
            placeholder="0.6"
          />
        </div>

        <div className="form-group">
          <label htmlFor="materialDensity">Material Density (kg/m³)</label>
          <input
            type="number"
            id="materialDensity"
            value={config.materialDensity ?? ''}
            onChange={(e) => handleChange('materialDensity', parseFloat(e.target.value) || 7850)}
            min="1"
            step="1"
            placeholder="7850 (steel)"
          />
        </div>
      </div>
    </div>
  );
}

export default ConfigurationForm;
