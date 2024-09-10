import React, { useState } from "react";
import TryEmailForm from "@site/src/components/HomepageFeatures/TryEmailForm";
import TryApi from "@site/src/components/HomepageFeatures/TryApi";

export default function TryApiExample() {
  const [token, setToken] = useState(null);

  return (
    <div>
      <h2>Step 1: Generate a JWT Token</h2>
      {/* Email formu ile token alınacak */}
      <TryEmailForm
        apiEndpoint="http://localhost:3015/api/v1/auth/login"
        onTokenGenerated={setToken}
      />

      {token && (
        <>
          <h2>Step 2: Fetch User Data with Your Token</h2>
          {/* Alınan token ile başka bir API'yi çağırma */}
          <TryApi
            apiEndpoint="http://localhost:3015/api/v1/user/me"
            token={token}
          />
        </>
      )}
    </div>
  );
}