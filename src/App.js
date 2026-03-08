import React, { useState } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import ConfigurationForm from './components/ConfigurationForm';
import ResultsDisplay from './components/ResultsDisplay';
import ShapePreview from './components/ShapePreview';
import ShapeSelector from './components/ShapeSelector';
import NestedLayoutPreview from './components/NestedLayoutPreview';
import Header from './components/Header';
import apiConfig from './config';

function App() {
  const [file, setFile] = useState(null);
  const [config, setConfig] = useState({
    sheetWidth: 1220,
    sheetHeight: 3000,
    margin: 5,
    allowRotation: true,
    feedRate: 1200,
    cutDepth: -3,
    projectName: '',
    materialSpec: 'GI, 0.6mm',
    materialThickness: 0.6,
    materialDensity: 7850
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedShapes, setUploadedShapes] = useState(null);
  const [selectedShapes, setSelectedShapes] = useState([]);
  const [shapeQuantities, setShapeQuantities] = useState({});
  const [nestedData, setNestedData] = useState(null);

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    setResults(null);
    setError(null);
    setUploadedShapes(null);
    setNestedData(null);

    // Preview shapes from uploaded file
    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch(`${apiConfig.API_BASE_URL}/api/preview-shapes`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setUploadedShapes(data.shapes);
          // Auto-select all shapes by default, with quantity = 1
          const defaultSelected = data.shapes.map((_, index) => index);
          setSelectedShapes(defaultSelected);
          const defaultQuantities = {};
          defaultSelected.forEach((index) => {
            defaultQuantities[index] = 1;
          });
          setShapeQuantities(defaultQuantities);
        }
      } catch (err) {
        console.error('Error previewing shapes:', err);
      }
    }
  };

  const handleConfigChange = (newConfig) => {
    setConfig(newConfig);
  };

  const handleProcess = async () => {
    if (!file) {
      setError('Please upload a DXF file first');
      return;
    }

    if (!uploadedShapes || uploadedShapes.length === 0) {
      setError('No shapes available. Please upload a DXF file first.');
      return;
    }

    // Ensure at least one shape has quantity > 0
    const hasAnyQuantity =
      shapeQuantities &&
      Object.values(shapeQuantities).some((qty) => Number(qty) > 0);

    if (!hasAnyQuantity) {
      setError('Please select at least one shape with quantity greater than 0.');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setNestedData(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sheetWidth', config.sheetWidth);
      formData.append('sheetHeight', config.sheetHeight);
      formData.append('margin', config.margin);
      formData.append('allowRotation', config.allowRotation);
      formData.append('feedRate', config.feedRate);
      formData.append('cutDepth', config.cutDepth);
      formData.append('selectedIndices', JSON.stringify(selectedShapes));
      formData.append('shapeQuantities', JSON.stringify(shapeQuantities || {}));
      formData.append('projectName', config.projectName || '');
      formData.append('materialSpec', config.materialSpec || '');
      formData.append('materialThickness', config.materialThickness || 0);
      formData.append('materialDensity', config.materialDensity || 7850);

      const response = await fetch(`${apiConfig.API_BASE_URL}/api/process`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Processing failed' };
        }
        throw new Error(errorData.error || 'Processing failed');
      }

      // Get JSON response with shape data
      const data = await response.json();
      
      console.log('Processing response:', data); // Debug log
      
      // Set results and nested data for preview
      if (data.results) {
        setResults(data.results);
      }
      
      if (data.sheets && data.sheets.length > 0) {
        setNestedData({
          sheets: data.sheets,
          totalSheets: data.totalSheets || data.sheets.length,
          totalShapes: data.totalShapes,
          placedShapes: data.placedShapes,
          unplacedShapes: data.unplacedShapes
        });
      } else if (data.nestedShapes && data.nestedShapes.length > 0) {
        // Backward compatibility
        setNestedData({
          sheets: [{
            nestedShapes: data.nestedShapes,
            sheetWidth: data.sheetWidth,
            sheetHeight: data.sheetHeight,
            sheetNumber: 1
          }],
          totalSheets: 1
        });
      } else {
        setError('No shapes could be placed on the sheet. Try adjusting sheet dimensions or margin.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while processing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <Header />
      <div className="container">
        <div className="main-content">
          <div className="upload-section">
            <FileUpload onFileSelect={handleFileSelect} file={file} />
          </div>

          <div className="config-section">
            <ConfigurationForm
              config={config}
              onConfigChange={handleConfigChange}
            />
          </div>

          <div className="action-section">
            <button
              className="process-button"
              onClick={handleProcess}
              disabled={!file || loading}
            >
              {loading ? 'Processing...' : 'Process & Nest Shapes'}
            </button>
          </div>

          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}

          {uploadedShapes && uploadedShapes.length > 0 && (
            <div className="shape-workspace">
              <div className="shape-workspace-column shape-workspace-preview">
                <ShapePreview
                  shapes={uploadedShapes}
                  title="Uploaded Shapes Playground"
                />
              </div>
              <div className="shape-workspace-column shape-workspace-selector">
                <ShapeSelector
                  shapes={uploadedShapes}
                  selectedShapes={selectedShapes}
                  shapeQuantities={shapeQuantities}
                  onSelectionChange={setSelectedShapes}
                  onQuantityChange={(index, quantity) => {
                    setShapeQuantities((prev) => ({
                      ...prev,
                      [index]: quantity,
                    }));
                  }}
                />
              </div>
            </div>
          )}

          {nestedData && (
            <NestedLayoutPreview
              sheets={nestedData.sheets}
              nestedShapes={nestedData.nestedShapes}
              sheetWidth={nestedData.sheetWidth}
              sheetHeight={nestedData.sheetHeight}
              totalSheets={nestedData.totalSheets}
              totalShapes={nestedData.totalShapes}
              placedShapes={nestedData.placedShapes}
              unplacedShapes={nestedData.unplacedShapes}
              onDownload={async () => {
                try {
                  const response = await fetch(`${apiConfig.API_BASE_URL}/api/download-results`);
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'nested_results.zip';
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                } catch (err) {
                  setError('Error downloading files: ' + err.message);
                }
              }}
            />
          )}

          {results && <ResultsDisplay results={results} />}
        </div>
      </div>
    </div>
  );
}

export default App;
