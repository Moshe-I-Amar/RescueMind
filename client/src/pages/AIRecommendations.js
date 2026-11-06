// src/components/AIRecommendations.js
import React, { useState, useCallback, useRef } from "react";
import CameraCapture from "../components/camra-ai/CameraCapture";
import ResultDisplay from "../components/camra-ai/ResultDisplay";
import { API_BASE } from "../api/httpClient";


function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new Blob([ab], { type: mimeString });
}

export default function AIRecommendations() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | success | error
  const [preview, setPreview] = useState(null);
  const abortRef = useRef(null);

  const handleCapture = useCallback(async (imageSrc) => {
    setError(null);
    setPrediction(null);
    setPreview(imageSrc);
    setStatus('uploading');

    const formData = new FormData();
    formData.append('image', dataURItoBlob(imageSrc), 'capturedImage.jpg');

    // support aborting if needed
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_BASE}/api/images/predict`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();

      if (data && data.status === 'success' && data.data && data.data.analysis) {
        setPrediction({ response: data.data.analysis });
        setStatus('success');
      } else {
        console.warn('Unexpected server response', data);
        throw new Error('Invalid server response');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('ההעלאה בוטלה');
      } else {
        console.error('Error uploading image:', err);
        setError('אירעה שגיאה בעיבוד התמונה. נסה שוב.');
      }
      setStatus('error');
    } finally {
      abortRef.current = null;
    }
  }, []);

  const handleCancel = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setStatus('idle');
    setPreview(null);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">המלצות מבוססות AI</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <CameraCapture onCapture={handleCapture} />
          <div className="mt-3">
            {status === 'uploading' && <div className="text-sm text-gray-600">טוען תמונה...</div>}
            {status === 'success' && <div className="text-sm text-green-600">הניתוח הושלם</div>}
            {status === 'error' && <div className="text-sm text-red-600">{error}</div>}
          </div>
          {preview && (
            <div className="mt-3">
              <div className="text-sm text-gray-500 mb-1">תצוגה מקדימה</div>
              <img src={preview} alt="preview" className="max-w-full rounded border" />
              {status === 'uploading' && (
                <div className="mt-2">
                  <button onClick={handleCancel} className="px-3 py-1 bg-gray-200 rounded">בטל העלאה</button>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-sm text-gray-500">תוצאה</div>
            {prediction ? (
              <ResultDisplay prediction={prediction} />
            ) : (
              <div className="text-gray-600 mt-2">לא הוזנה תמונה לעיבוד עדיין.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
