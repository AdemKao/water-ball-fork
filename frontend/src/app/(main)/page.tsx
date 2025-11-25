"use client";

import { useEffect, useState } from "react";
import { healthService } from "@/services/health.service";

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<string>("Loading...");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await healthService.checkHealth();
        setHealthStatus(`Backend is ${response.status}`);
      } catch (error) {
        setHealthStatus("Backend is not reachable");
        console.error("Health check failed:", error);
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-96px)]">
      <div className="max-w-2xl text-center">
        <h1 className="mb-4 text-5xl font-bold">Waterball Course Platform</h1>
        <p className="mb-8 text-xl text-muted-foreground">
          收費課程網站 - MVP 版本
        </p>

        <div className="rounded-lg border bg-card p-6 shadow-lg">
          <h2 className="mb-4 text-2xl font-semibold">System Status</h2>
          <p className="text-lg">{healthStatus}</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border bg-card p-4 shadow">
            <h3 className="font-semibold">Frontend</h3>
            <p className="text-sm text-muted-foreground">Next.js 15</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow">
            <h3 className="font-semibold">Backend</h3>
            <p className="text-sm text-muted-foreground">Spring Boot</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow">
            <h3 className="font-semibold">Database</h3>
            <p className="text-sm text-muted-foreground">PostgreSQL</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow">
            <h3 className="font-semibold">Storage</h3>
            <p className="text-sm text-muted-foreground">Supabase</p>
          </div>
        </div>
      </div>
    </div>
  );
}
