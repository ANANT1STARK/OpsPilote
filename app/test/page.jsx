"use client";

import { useEffect } from "react";
import { apiGet } from "@/lib/api";

export default function ApiTest() {
  useEffect(() => {
    async function testConnection() {
      try {
        const data = await apiGet("/tickets");
        console.log("Backend connected:", data);
      } catch (error) {
        console.error("Backend connection failed:", error);
      }
    }

    testConnection();
  }, []);

  return <div>Testing backend connection...</div>;
}