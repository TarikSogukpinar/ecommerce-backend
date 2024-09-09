import React, { useState } from "react";
import TryEmailForm from "@site/src/components/HomepageFeatures/TryEmailForm";
import TryApi from "@site/src/components/HomepageFeatures/TryApi";

export default function TryApiExample() {
  const [token, setToken] = useState(null);

  return (
    <div>
      {/* <h2>Step 1: Generate a JWT Token</h2> */}
      <TryEmailForm
        apiEndpoint="http://localhost:3015/api/v1/auth/login"
        onTokenGenerated={setToken}
      />

      {/* <h2>Step 2: Fetch Data with Your Token</h2> */}
      <TryApi
        apiEndpoint="http://localhost:3015/api/v1/products"
        token={token}
      />
    </div>
  );
}
