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
    <div>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: "10px", marginRight: "10px", fontSize: "16px" }}
      />
      <button
        onClick={fetchToken}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          fontSize: "16px",
          cursor: "pointer",
        }}
        disabled={loading || !email}
      >
        {loading ? "Generating..." : "Get Token"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default TryEmailForm;
