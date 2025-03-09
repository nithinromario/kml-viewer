import React, { useState } from 'react';
import { Upload, FileText, Map as MapIcon } from 'lucide-react';
import { kml } from '@tmcw/togeojson';
import Map from './components/Map';
import { parseKMLFile, calculateStats, getDetailedStats } from './utils/kmlParser';

function App() {
  const [state, setState] = useState({
    geoJSON: null,
    stats: {
      Placemark: 0,
      Point: 0,
      LineString: 0,
      Polygon: 0,
      MultiLineString: 0,
    },
    detailedStats: [],
  });
  const [showSummary, setShowSummary] = useState(false);
  const [showDetailed, setShowDetailed] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const kmlDoc = await parseKMLFile(file);
      const geoJSON = kml(kmlDoc);
      const stats = calculateStats(geoJSON);
      const detailedStats = getDetailedStats(geoJSON);

      setState({ geoJSON, stats, detailedStats });
      setShowSummary(false);
      setShowDetailed(false);
    } catch (error) {
      console.error('Error parsing KML file:', error);
      alert('Error parsing KML file. Please ensure it\'s a valid KML format.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <MapIcon className="w-8 h-8" />
            KML Viewer
          </h1>

          <div className="flex gap-4 mb-6">
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors">
              <Upload className="w-5 h-5" />
              Upload KML
              <input
                type="file"
                accept=".kml"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {state.geoJSON && (
              <>
                <button
                  onClick={() => setShowSummary(!showSummary)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  Summary
                </button>
                <button
                  onClick={() => setShowDetailed(!showDetailed)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  Detailed
                </button>
              </>
            )}
          </div>

          {showSummary && (
            <div className="mb-6 overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Element Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(state.stats).map(([type, count]) => (
                    <tr key={type} className="border-t border-gray-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showDetailed && (
            <div className="mb-6 overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Element Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Length (km)</th>
                  </tr>
                </thead>
                <tbody>
                  {state.detailedStats.map((stat, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stat.length?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {state.geoJSON && (
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <Map geoJSON={state.geoJSON} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;