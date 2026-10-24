import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      system: 'SakhiSetu (सखीसेतू) – महिला बचत गट व्यवस्थापन प्रणाली',
      version: '1.0.0',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      features: {
        voiceAssistant: true,
        offlineSync: true,
        roleBasedAccessControl: true,
        multiLanguage: 'mr-IN',
      },
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
