import React, { useState } from "react";

// Basit bir Alert bileşeni
const Alert = ({ message, onClose }) => (
  <div
    style={{
      backgroundColor: "#f8d7da",
      color: "#721c24",
      padding: "10px",
      borderRadius: "5px",
      margin: "20px 0",
      position: "relative",
    }}
  >
    <span>{message}</span>
    <button
      onClick={onClose}
      style={{
        position: "absolute",
        right: "10px",
        top: "10px",
        background: "none",
        border: "none",
        fontWeight: "bold",
        fontSize: "16px",
        cursor: "pointer",
      }}
    >
      &times;
    </button>
  </div>
);

const Spinner = () => (
  <div style={{ textAlign: "center", marginTop: "20px" }}>
    <div
      style={{
        border: "4px solid rgba(0, 0, 0, 0.1)",
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        borderTopColor: "#000000",
        animation: "spin 1s ease-in-out infinite",
      }}
    />
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default function TryApiExample({ apiEndpoint, token }) {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseDetails, setResponseDetails] = useState(null);

  const fetchUserData = async () => {
    setError(null);
    setLoading(true);
    setResponseDetails(null);
    const startTime = new Date().getTime();

    try {
      const response = await fetch(apiEndpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const endTime = new Date().getTime();
      const responseTime = endTime - startTime;

      setResponseDetails({
        status: response.status,
        statusText: response.statusText,
        responseTime,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data = await response.json();
      setUserData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={fetchUserData}
        style={{
          padding: "10px 20px",
          backgroundColor: "#000000",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Try it API
      </button>

      {loading && <Spinner />}
      {error && (
        <Alert
          message={error}
          onClose={() => setError(null)} // Alert'ı kapatma fonksiyonu
        />
      )}

      {responseDetails && !loading && (
        <div style={{ marginTop: "20px" }}>
          <h3>Response Details:</h3>
          <p>Status: {responseDetails.status}</p>
          <p>Status Text: {responseDetails.statusText}</p>
          <p>Response Time: {responseDetails.responseTime} ms (Average)</p>
        </div>
      )}

      {userData && !loading && (
        <div style={{ marginTop: "20px" }}>
          <h3>Response Data:</h3>
          <pre
            style={{
              backgroundColor: "#000000",
              padding: "10px",
              borderRadius: "5px",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              color: "#fff",
            }}
          >
            {JSON.stringify(userData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
