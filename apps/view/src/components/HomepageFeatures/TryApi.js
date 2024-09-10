import React, { useEffect, useState } from "react";

export default function TryApi({ apiEndpoint, token }) {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(apiEndpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err.message);
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [apiEndpoint, token]);

  if (error) {
    return <p style={{ color: "red" }}>Error: {error}</p>;
  }

  return (
    <div>
      {userData ? (
        <div>
          <h3>User Info</h3>
          <p>
            <strong>Name:</strong> {userData.name}
          </p>
          <p>
            <strong>Email:</strong> {userData.email}
          </p>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
}
