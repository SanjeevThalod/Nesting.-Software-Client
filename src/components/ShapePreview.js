import React, { useRef, useEffect } from 'react';
import './ShapePreview.css';

function ShapePreview({ shapes, title = "Uploaded Shapes" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!shapes || shapes.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Calculate bounds of all shapes using bounding boxes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    shapes.forEach(shape => {
      if (shape.bounding_box && shape.bounding_box.length >= 4) {
        const [bbMinX, bbMinY, bbMaxX, bbMaxY] = shape.bounding_box;
        minX = Math.min(minX, bbMinX);
        minY = Math.min(minY, bbMinY);
        maxX = Math.max(maxX, bbMaxX);
        maxY = Math.max(maxY, bbMaxY);
      } else if (shape.points && shape.points.length > 0) {
        shape.points.forEach(([x, y]) => {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        });
      } else if (shape.shape_type === 'circle' && shape.center) {
        const r = shape.radius || 0;
        minX = Math.min(minX, shape.center[0] - r);
        minY = Math.min(minY, shape.center[1] - r);
        maxX = Math.max(maxX, shape.center[0] + r);
        maxY = Math.max(maxY, shape.center[1] + r);
      }
    });

    // Ensure we have valid bounds
    if (minX === Infinity) {
      minX = 0;
      minY = 0;
      maxX = 100;
      maxY = 100;
    }

    const width = maxX - minX || 100;
    const height = maxY - minY || 100;
    const padding = 30;
    const scale = Math.min(
      (canvas.width - padding * 2) / width,
      (canvas.height - padding * 2) / height,
      1
    );

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw shapes with better separation
    shapes.forEach((shape, index) => {
      ctx.save();
      
      // Color for each shape - use fewer colors for better distinction
      const hue = (index * 360 / Math.min(shapes.length, 12)) % 360;
      ctx.strokeStyle = `hsl(${hue}, 70%, 40%)`;
      ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.15)`;
      ctx.lineWidth = 2;

      if (shape.shape_type === 'circle' && shape.center) {
        const cx = (shape.center[0] - minX) * scale + padding;
        const cy = (shape.center[1] - minY) * scale + padding;
        const r = (shape.radius || 0) * scale;
        
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (shape.points && shape.points.length > 0) {
        // Draw outer boundary
        ctx.beginPath();
        const firstPoint = shape.points[0];
        const x = (firstPoint[0] - minX) * scale + padding;
        const y = (firstPoint[1] - minY) * scale + padding;
        ctx.moveTo(x, y);
        
        for (let i = 1; i < shape.points.length; i++) {
          const point = shape.points[i];
          const px = (point[0] - minX) * scale + padding;
          const py = (point[1] - minY) * scale + padding;
          ctx.lineTo(px, py);
        }
        
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw holes if any (circle holes or polyline holes)
        if (shape.holes && shape.holes.length > 0) {
          ctx.fillStyle = '#f5f5f5'; // Fill holes with background color
          shape.holes.forEach(hole => {
            if (!hole) return;
            if (hole.type === 'circle' && hole.center && hole.radius != null) {
              const cx = (hole.center[0] - minX) * scale + padding;
              const cy = (hole.center[1] - minY) * scale + padding;
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
              const hx = (firstHolePoint[0] - minX) * scale + padding;
              const hy = (firstHolePoint[1] - minY) * scale + padding;
              ctx.moveTo(hx, hy);
              for (let i = 1; i < hole.length; i++) {
                const point = hole[i];
                const px = (point[0] - minX) * scale + padding;
                const py = (point[1] - minY) * scale + padding;
                ctx.lineTo(px, py);
              }
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
            }
          });
        }
      } else if (shape.bounding_box && shape.bounding_box.length >= 4) {
        // Fallback: Use bounding box for rendering
        const [bbMinX, bbMinY, bbMaxX, bbMaxY] = shape.bounding_box;
        const x = (bbMinX - minX) * scale + padding;
        const y = (bbMinY - minY) * scale + padding;
        const w = (bbMaxX - bbMinX) * scale;
        const h = (bbMaxY - bbMinY) * scale;
        
        ctx.strokeRect(x, y, w, h);
        ctx.fillRect(x, y, w, h);
      }

      ctx.restore();
    });

    // Draw labels for all shapes
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    shapes.forEach((shape, index) => {
      if (shape.bounding_box && shape.bounding_box.length >= 4) {
        const [minX_shape, minY_shape, maxX_shape, maxY_shape] = shape.bounding_box;
        const shapeWidth = maxX_shape - minX_shape;
        const shapeHeight = maxY_shape - minY_shape;
        const cx = ((minX_shape + maxX_shape) / 2 - minX) * scale + padding;
        const cy = ((minY_shape + maxY_shape) / 2 - minY) * scale + padding;
        
        // Always show label
        ctx.fillStyle = '#000';
        ctx.fillText(shape.shape_id || `Shape_${index + 1}`, cx, cy);
        
        // Show dimensions below label if space allows
        if (shapeWidth * scale > 50 && shapeHeight * scale > 40) {
          ctx.font = '10px Arial';
          ctx.fillStyle = '#666';
          ctx.fillText(
            `${shapeWidth.toFixed(0)}×${shapeHeight.toFixed(0)}mm`,
            cx,
            cy + 15
          );
          ctx.font = 'bold 12px Arial'; // Reset font
        }
      }
    });

  }, [shapes]);

  if (!shapes || shapes.length === 0) {
    return (
      <div className="shape-preview">
        <h3>{title}</h3>
        <p className="no-shapes">No shapes to display</p>
      </div>
    );
  }

  // Calculate shape dimensions summary
  const shapeDetails = shapes.map((shape, index) => {
    if (shape.bounding_box && shape.bounding_box.length >= 4) {
      const [minX, minY, maxX, maxY] = shape.bounding_box;
      return {
        id: shape.shape_id || `Shape_${index + 1}`,
        width: (maxX - minX).toFixed(1),
        height: (maxY - minY).toFixed(1),
        area: shape.area ? shape.area.toFixed(0) : ((maxX - minX) * (maxY - minY)).toFixed(0)
      };
    }
    return null;
  }).filter(Boolean);

  return (
    <div className="shape-preview">
      <h3>{title}</h3>
      <div className="preview-info">
        <span>{shapes.length} shape{shapes.length !== 1 ? 's' : ''} detected</span>
      </div>
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="preview-canvas"
        />
      </div>
      {shapeDetails.length > 0 && (
        <div className="shape-details">
          <h4>Shape Dimensions:</h4>
          <div className="details-grid">
            {shapeDetails.map((detail, idx) => (
              <div key={idx} className="detail-item">
                <strong>{detail.id}:</strong> {detail.width} × {detail.height} mm
                <span className="area"> (Area: {detail.area} mm²)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ShapePreview;
