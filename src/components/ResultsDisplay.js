import React from 'react';
import './ResultsDisplay.css';

function ResultsDisplay({ results }) {
  if (!results) return null;

  return (
    <div className="results-display">
      <h2>📊 Results</h2>
      
      <div className="results-grid">
        <div className="result-card">
          <div className="result-label">Shapes Processed</div>
          <div className="result-value">{results.totalShapes}</div>
        </div>

        <div className="result-card">
          <div className="result-label">Shapes Placed</div>
          <div className="result-value success">{results.placedShapes}</div>
        </div>

        <div className="result-card">
          <div className="result-label">Sheet Utilization</div>
          <div className="result-value highlight">
            {results.utilization?.toFixed(2) || 0}%
          </div>
        </div>

        {results.unplacedShapes > 0 && (
          <div className="result-card warning">
            <div className="result-label">Unplaced Shapes</div>
            <div className="result-value">{results.unplacedShapes}</div>
          </div>
        )}
      </div>

      <div className="download-info">
        <p>✓ Files have been downloaded automatically</p>
        <p className="file-list">
          • nested_layout.dxf (CAD file)<br />
          • nested_program.nc (G-code file)
        </p>
      </div>
    </div>
  );
}

export default ResultsDisplay;
