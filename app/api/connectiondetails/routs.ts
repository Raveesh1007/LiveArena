import { randomString } from '@/lib/client-utils';
import { connectionDetails } from '@/lib/types';
import { AccessToken, AccessTokenOptions, VideoGrant } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.LIVEKIT_AI_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

export async function GET(request: NextRequest) {
  try {
    const roomName = request.nextUrl.searchParams.get('roomName');
    const participantName = request.nextUrl.searchParams.get('participantName');
    const metadata = request.nextUrl.searchParams.get('metadata') ?? '';
    const region = request.nextUrl.searchParams.get('region');
    const livekitServerUrl = region ? getLiveKitURL(region) : LIVEKIT_URL;

    if (livekitServerUrl === undefined) {
      throw new Error('Invalid region');
    }

    if (typeof roomName !== 'string' || roomName === null) {
      return new NextResponse('Missing or invalid required query parameter: roomName', { status: 400 });
    }

    if (participantName === null) {
      return new NextResponse('Missing required query parameter: participantName', { status: 400 });
    }

    const participantToken = await createParticipantToken(
      {
        identity: `${participantName}_${randomString(4)}`,
        name: participantName,
        metadata,
      },
      roomName
    );

    const data: connectionDetails = {
        serverurl: livekitServerUrl,
        roomName: roomName,
        participantToken: participantToken,
        participantName: participantName,
      };

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse('An unexpected error occurred', { status: 500 });
  }
}

function createParticipantToken(userinfo: AccessTokenOptions, roomName: string) {
  const at = new AccessToken(API_KEY, API_SECRET, userinfo);
  at.ttl = 300; // 5 minutes in seconds
  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };
  at.addGrant(grant);
  return at.toJwt();
}

function getLiveKitURL(region: string) {
  let targetKey = 'LIVEKIT_URL';
  if (region) {
    targetKey = `LIVEKIT_URL_${region.toUpperCase()}`;
  }
  const url = process.env[targetKey];
  if (!url) {
    throw new Error(`${targetKey} is not defined`);
  }
  return url;
}
