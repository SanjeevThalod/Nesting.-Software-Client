import React, { useRef, useEffect, useState, useMemo } from 'react';
import './NestedLayoutPreview.css';

function NestedLayoutPreview({ sheets, nestedShapes, sheetWidth, sheetHeight, onDownload, totalSheets, totalShapes, placedShapes, unplacedShapes }) {
  const canvasRef = useRef(null);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);

  // Support both new multi-sheet format and old single-sheet format
  const displaySheets = useMemo(() => {
    return sheets || (nestedShapes ? [{
      nestedShapes: nestedShapes,
      sheetWidth: sheetWidth,
      sheetHeight: sheetHeight,
      sheetNumber: 1
    }] : []);
  }, [sheets, nestedShapes, sheetWidth, sheetHeight]);

  // Current sheet data
  const currentSheet = displaySheets.length > 0 && currentSheetIndex < displaySheets.length 
    ? displaySheets[currentSheetIndex] 
    : null;
  const shapes = useMemo(() => currentSheet?.nestedShapes || [], [currentSheet]);
  const sw = currentSheet?.sheetWidth ?? sheetWidth;
  const sh = currentSheet?.sheetHeight ?? sheetHeight;

  useEffect(() => {
    if (displaySheets.length === 0 || currentSheetIndex >= displaySheets.length) return;

    if (shapes.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    const padding = 20;
    const scale = Math.min(
      (canvas.width - padding * 2) / sw,
      (canvas.height - padding * 2) / sh,
      1
    );

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw sheet outline
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.strokeRect(
      padding,
      padding,
      sw * scale,
      sh * scale
    );

    // Draw sheet background
    ctx.fillStyle = '#f0fdf4';
    ctx.fillRect(
      padding,
      padding,
      sw * scale,
      sh * scale
    );

    // Draw nested shapes
    shapes.forEach((nested, index) => {
      ctx.save();
      
      const shape = nested.original_shape;
      const hue = (index * 137.5) % 360;
      ctx.strokeStyle = `hsl(${hue}, 70%, 50%)`;
      ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.3)`;
      ctx.lineWidth = 2;

      // Transform for position and rotation
      const offsetX = nested.x * scale + padding;
      const offsetY = nested.y * scale + padding;

      ctx.translate(offsetX, offsetY);

      // Translate to the center of the shape for rotation, rotate, then translate back
      const halfShapeWidth = nested.width * scale / 2;
      const halfShapeHeight = nested.height * scale / 2;

      ctx.translate(halfShapeWidth, halfShapeHeight);
      ctx.rotate((nested.rotation * Math.PI) / 180);
      ctx.translate(-halfShapeWidth, -halfShapeHeight);

      const minX = shape.bounding_box[0];
      const minY = shape.bounding_box[1];

      if (shape.shape_type === 'circle') {
        const r = (shape.radius || 0) * scale;
        const cx = (shape.center[0] - minX) * scale;
        const cy = (shape.center[1] - minY) * scale;
        
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (shape.shape_type === 'point') {
        const pointRadius = 2 * scale; // Adjust as needed
        const px = (shape.center[0] - minX) * scale;
        const py = (shape.center[1] - minY) * scale;
        
        ctx.beginPath();
        ctx.arc(px, py, pointRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (shape.points && shape.points.length > 0) {
        // Draw outer boundary for polyline/rectangle
        ctx.beginPath();
        const firstPoint = shape.points[0];
        ctx.moveTo((firstPoint[0] - minX) * scale, (firstPoint[1] - minY) * scale);
        
        for (let i = 1; i < shape.points.length; i++) {
          const point = shape.points[i];
          ctx.lineTo((point[0] - minX) * scale, (point[1] - minY) * scale);
        }
        
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw holes if any (circle holes or polyline holes)
        if (shape.holes && shape.holes.length > 0) {
          ctx.fillStyle = '#f0fdf4'; // Fill holes with sheet background color
          shape.holes.forEach(hole => {
            if (!hole) return;
            if (hole.type === 'circle' && hole.center && hole.radius != null) {
              const cx = (hole.center[0] - minX) * scale;
              const cy = (hole.center[1] - minY) * scale;
              const r = hole.radius * scale;
              ctx.beginPath();
              ctx.arc(cx, cy, r, 0, 2 * Math.PI);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
              return;
            }
            if (Array.isArray(hole) && hole.length > 0) {
              ctx.beginPath();
              const firstHolePoint = hole[0];
              ctx.moveTo((firstHolePoint[0] - minX) * scale, (firstHolePoint[1] - minY) * scale);
              for (let i = 1; i < hole.length; i++) {
                const point = hole[i];
                ctx.lineTo((point[0] - minX) * scale, (point[1] - minY) * scale);
              }
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
            }
          });
        }
      } else {
        // Fallback: draw bounding box (should not happen for valid shapes)
        ctx.strokeRect(0, 0, nested.width * scale, nested.height * scale);
        ctx.fillRect(0, 0, nested.width * scale, nested.height * scale);
      }

      ctx.restore();

      // Draw label with dimensions
      ctx.fillStyle = '#000';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const labelX = offsetX + nested.width * scale / 2;
      const labelY = offsetY + nested.height * scale / 2;
      ctx.fillText(
        shape.shape_id || `P${index + 1}`,
        labelX,
        labelY
      );
      
      // Show dimensions if space allows
      if (nested.width * scale > 60 && nested.height * scale > 50) {
        ctx.font = '10px Arial';
        ctx.fillStyle = '#444';
        ctx.fillText(
          `${nested.width.toFixed(0)}×${nested.height.toFixed(0)}mm`,
          labelX,
          labelY + 15
        );
      }
    });

  }, [displaySheets, currentSheetIndex, sheetWidth, sheetHeight, shapes, sw, sh]);

  if (displaySheets.length === 0) {
    return (
      <div className="nested-layout-preview">
        <h3>Nested Layout Preview</h3>
        <p className="no-layout">No layout to display</p>
      </div>
    );
  }

  return (
    <div className="nested-layout-preview">
      <div className="preview-header">
        <h3>Nested Layout Preview</h3>
        {onDownload && (
          <button className="download-button" onClick={onDownload}>
            📥 Download All Sheets
          </button>
        )}
      </div>
      
      {totalSheets > 1 && (
        <div className="sheet-navigation">
          <button
            className="nav-button"
            onClick={() => setCurrentSheetIndex(Math.max(0, currentSheetIndex - 1))}
            disabled={currentSheetIndex === 0}
          >
            ← Previous Sheet
          </button>
          <span className="sheet-info">
            Sheet {currentSheetIndex + 1} of {totalSheets}
          </span>
          <button
            className="nav-button"
            onClick={() => setCurrentSheetIndex(Math.min(totalSheets - 1, currentSheetIndex + 1))}
            disabled={currentSheetIndex >= totalSheets - 1}
          >
            Next Sheet →
          </button>
        </div>
      )}

      <div className="preview-info">
        <span>Sheet: {sw} × {sh} mm</span>
        <span>{shapes.length} shape{shapes.length !== 1 ? 's' : ''} on this sheet</span>
        {totalSheets > 1 && (
          <span>Total: {placedShapes || shapes.length} placed across {totalSheets} sheet{totalSheets !== 1 ? 's' : ''}</span>
        )}
        {unplacedShapes > 0 && (
          <span className="warning">⚠️ {unplacedShapes} shape{unplacedShapes !== 1 ? 's' : ''} could not be placed</span>
        )}
      </div>
      
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={1000}
          height={800}
          className="preview-canvas"
        />
      </div>
      
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#10b981' }}></div>
          <span>Sheet Outline</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: 'hsla(200, 70%, 50%, 0.3)' }}></div>
          <span>Nested Shapes</span>
        </div>
      </div>
    </div>
  );
}

export default NestedLayoutPreview;
