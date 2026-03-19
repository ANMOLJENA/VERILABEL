import React, { useState } from "react";
import { validateText } from "@/services/api.service";

function VerifyPage() {
  const [text, setText] = useState("");
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleValidateText = async () => {
    if (!text.trim()) {
      setError("Please enter text to validate");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await validateText(text);
      
      if (response.success === false) {
        throw new Error(response.error || "Failed to validate text");
      }

      setValidationResult(response);
    } catch (err) {
      setError(err.message || "Failed to validate text");
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Verify Text</h1>
        <p className="text-gray-600 mt-2">Enter medical text to validate with AI</p>
      </div>

      {/* Text Input Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Text for Validation
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter medical text to validate (drug information, batch numbers, etc.)..."
            />
          </div>

          <button
            onClick={handleValidateText}
            disabled={!text.trim() || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Validating..." : "Run AI Validation"}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Validation Results */}
      {validationResult && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Validation Results</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Drug Name:</span>
                  <p className="text-gray-900">{validationResult.drug_name || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Strength:</span>
                  <p className="text-gray-900">{validationResult.strength || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Batch Number:</span>
                  <p className="text-gray-900">{validationResult.batch_number || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Manufacturing Date:</span>
                  <p className="text-gray-900">{validationResult.manufacturing_date || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Expiry Date:</span>
                  <p className="text-gray-900">{validationResult.expiry_date || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Manufacturer:</span>
                  <p className="text-gray-900">{validationResult.manufacturer || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">License Number:</span>
                  <p className="text-gray-900">{validationResult.license_number || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Serialization Present:</span>
                  <p className="text-gray-900">{validationResult.serialization_present ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Missing Fields:</span>
                  <p className="text-gray-900">
                    {validationResult.missing_fields?.length > 0 
                      ? validationResult.missing_fields.join(", ")
                      : "None"
                    }
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Risk Level:</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevelColor(validationResult.risk_level)}`}>
                    {validationResult.risk_level || "Unknown"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Confidence Score:</span>
                  <p className="text-gray-900">{validationResult.confidence_score || "N/A"}</p>
                </div>
              </div>
            </div>

            {validationResult.analysis_summary && (
              <div className="border-t pt-4">
                <span className="text-sm font-medium text-gray-700">Analysis Summary:</span>
                <p className="text-gray-900 mt-1">{validationResult.analysis_summary}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default VerifyPage;
