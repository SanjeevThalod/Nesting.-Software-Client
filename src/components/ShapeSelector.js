import React from 'react';
import './ShapeSelector.css';

function ShapeSelector({
  shapes,
  selectedShapes,
  shapeQuantities,
  onSelectionChange,
  onQuantityChange,
}) {
  if (!shapes || shapes.length === 0) {
    return null;
  }

  const handleSelectAll = () => {
    const allIds = shapes.map((_, index) => index);
    onSelectionChange(allIds);
    if (onQuantityChange) {
      allIds.forEach((index) => {
        const current = shapeQuantities && shapeQuantities[index];
        const nextQty = Number(current) > 0 ? Number(current) : 1;
        onQuantityChange(index, nextQty);
      });
    }
  };

  const handleDeselectAll = () => {
    onSelectionChange([]);
    if (onQuantityChange) {
      shapes.forEach((_, index) => {
        onQuantityChange(index, 0);
      });
    }
  };

  const handleToggle = (index) => {
    const isSelected = selectedShapes.includes(index);
    if (isSelected) {
      onSelectionChange(selectedShapes.filter((i) => i !== index));
      if (onQuantityChange) {
        onQuantityChange(index, 0);
      }
    } else {
      onSelectionChange([...selectedShapes, index]);
      if (onQuantityChange) {
        const current = shapeQuantities && shapeQuantities[index];
        const nextQty = Number(current) > 0 ? Number(current) : 1;
        onQuantityChange(index, nextQty);
      }
    }
  };

  const getShapeInfo = (shape, index) => {
    if (shape.bounding_box && shape.bounding_box.length >= 4) {
      const [minX, minY, maxX, maxY] = shape.bounding_box;
      return {
        id: shape.shape_id || `Shape_${index + 1}`,
        width: (maxX - minX).toFixed(1),
        height: (maxY - minY).toFixed(1),
        area: shape.area ? shape.area.toFixed(0) : ((maxX - minX) * (maxY - minY)).toFixed(0)
      };
    }
    return {
      id: shape.shape_id || `Shape_${index + 1}`,
      width: 'N/A',
      height: 'N/A',
      area: 'N/A'
    };
  };

  return (
    <div className="shape-selector">
      <div className="selector-header">
        <h4>Select Shapes to Nest</h4>
        <div className="selector-actions">
          <button className="select-btn" onClick={handleSelectAll}>
            Select All
          </button>
          <button className="select-btn" onClick={handleDeselectAll}>
            Deselect All
          </button>
          <span className="selection-count">
            {selectedShapes.length} of {shapes.length} selected
          </span>
        </div>
      </div>
      
      <div className="shapes-list">
        {shapes.map((shape, index) => {
          const info = getShapeInfo(shape, index);
          const isSelected = selectedShapes.includes(index);
          const quantity =
            shapeQuantities && shapeQuantities[index] != null
              ? shapeQuantities[index]
              : 0;
          
          return (
            <div
              key={index}
              className={`shape-item ${isSelected ? 'selected' : ''}`}
              onClick={() => handleToggle(index)}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggle(index)}
                onClick={(e) => e.stopPropagation()}
                className="shape-checkbox"
              />
              <div className="shape-info">
                <div className="shape-id-row">
                  <div className="shape-id">{info.id}</div>
                  <div className="shape-qty">
                    <label htmlFor={`shape-qty-${index}`}>Qty</label>
                    <input
                      id={`shape-qty-${index}`}
                      type="number"
                      min="0"
                      step="1"
                      value={quantity}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const val = parseInt(e.target.value || '0', 10);
                        const safeVal = isNaN(val) || val < 0 ? 0 : val;
                        if (onQuantityChange) {
                          onQuantityChange(index, safeVal);
                        }
                        // Auto-select if quantity > 0, deselect if 0
                        const currentlySelected = selectedShapes.includes(index);
                        if (safeVal > 0 && !currentlySelected) {
                          onSelectionChange([...selectedShapes, index]);
                        } else if (safeVal === 0 && currentlySelected) {
                          onSelectionChange(
                            selectedShapes.filter((i) => i !== index)
                          );
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="shape-dims">
                  {info.width} × {info.height} mm
                  <span className="shape-area"> ({info.area} mm²)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ShapeSelector;
