import React, { useState } from "react";
import { runComparison } from "@/services/api.service";

function ComparePage() {
  const [compareFile, setCompareFile] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleFileChange = (e) => {
    setCompareFile(e.target.files[0]);
    setError("");
    setComparisonResult(null);
    setShowModal(false);
  };

  const handleCompare = async () => {
    if (!compareFile) {
      setError("Please select a file to compare");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await runComparison(compareFile);
      
      if (response.success === false) {
        throw new Error(response.error || "Comparison failed");
      }

      const result = response.data || response;
      setComparisonResult(result);
      setShowModal(true);
    } catch (err) {
      setError(err.message || "Failed to compare document");
    } finally {
      setLoading(false);
    }
  };

  const getDecisionColor = (decision) => {
    return decision === "VALID" ? "text-green-600" : "text-red-600";
  };

  const getDecisionIcon = (decision) => {
    return decision === "VALID" ? "✅" : "❌";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Compare Document</h1>
        <p className="text-gray-600 mt-2">Upload a document to compare and validate</p>
      </div>

      {/* File Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Document for Comparison
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*,.pdf"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {compareFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {compareFile.name}
              </p>
            )}
          </div>

          <button
            onClick={handleCompare}
            disabled={!compareFile || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Processing comparison..." : "Compare Document"}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Results Modal */}
      {showModal && comparisonResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Comparison Results</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Decision Section */}
              <div className="text-center mb-6">
                <div className={`text-3xl font-bold ${getDecisionColor(comparisonResult.decision)}`}>
                  {getDecisionIcon(comparisonResult.decision)} {comparisonResult.decision}
                </div>
              </div>

              {/* Scores Section */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-semibold text-gray-900">
                    {comparisonResult.similarity_score}%
                  </div>
                  <div className="text-sm text-gray-600">Similarity Score</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-semibold text-gray-900">
                    {comparisonResult.authenticity_score}%
                  </div>
                  <div className="text-sm text-gray-600">Authenticity Score</div>
                </div>
              </div>

              {/* Validation Checklist */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Validation Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">Dosage Format</span>
                    <span className={comparisonResult.validation_details.dosage_format ? "text-green-600" : "text-red-600"}>
                      {comparisonResult.validation_details.dosage_format ? "✅ Valid" : "❌ Invalid"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">Expiry Format</span>
                    <span className={comparisonResult.validation_details.expiry_format ? "text-green-600" : "text-red-600"}>
                      {comparisonResult.validation_details.expiry_format ? "✅ Valid" : "❌ Invalid"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">Batch Number</span>
                    <span className={comparisonResult.validation_details.batch_number ? "text-green-600" : "text-red-600"}>
                      {comparisonResult.validation_details.batch_number ? "✅ Valid" : "❌ Invalid"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">Manufacturer Presence</span>
                    <span className={comparisonResult.validation_details.manufacturer_presence ? "text-green-600" : "text-red-600"}>
                      {comparisonResult.validation_details.manufacturer_presence ? "✅ Valid" : "❌ Invalid"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Extracted Text */}
              {comparisonResult.extracted_text && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Extracted Text</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {comparisonResult.extracted_text}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComparePage;
