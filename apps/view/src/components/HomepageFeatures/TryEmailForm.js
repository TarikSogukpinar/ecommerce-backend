import React, { useState } from "react";

const TryEmailForm = ({ apiEndpoint, onTokenGenerated }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchToken = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch token");
      }

      const data = await response.json();

      console.log(data, "data logu burada");

      // Ensure that the token is extracted from data.result.accessToken
      if (data && data.result && data.result.accessToken) {
        onTokenGenerated(data.result.accessToken); // Pass accessToken to parent
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setError("Failed to fetch token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          padding: "12px 15px",
          width: "100%",
          maxWidth: "400px",
          fontSize: "16px",
          border: "2px solid #ccc",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          marginBottom: "15px",
        }}
      />
      <button
        onClick={fetchToken}
        style={{
          padding: "12px 20px",
          backgroundColor: loading || !email ? "#cccccc" : "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: loading || !email ? "not-allowed" : "pointer",
          transition: "background-color 0.3s ease",
        }}
        disabled={loading || !email}
      >
        {loading ? "Generating..." : "Get Token"}
      </button>
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
};

export default TryEmailForm;
