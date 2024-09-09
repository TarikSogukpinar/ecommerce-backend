import React, { useState } from "react";

const TryApi = ({ apiEndpoint }) => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiEndpoint);
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError("Failed to fetch API data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <div className="spinner"></div> // Spinner while loading
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : response ? (
        <pre>{JSON.stringify(response, null, 2)}</pre>
      ) : (
        <button className="try-api-button" onClick={fetchData}>
          Try API
        </button>
      )}
    </div>
  );
};

export default TryApi;
