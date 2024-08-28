import { EgressClient } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest){
    try{
        const roomName = req.nextUrl.searchParams.get('roomNamr');

        if (roomName===null){
            return new NextResponse('Missing roomName parameter', {status: 403});   
        }

        const {LIVEKIT_API_SECRET,LIVEKIT_API_KEY,LIVEKIT_URL} = process.env;

        const hostURL = new URL(LIVEKIT_URL!);
        hostURL.protocol = 'https';

        const egressClient = new EgressClient(hostURL.origin, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
    const activeEgresses = (await egressClient.listEgress({ roomName })).filter(
      (info) => info.status < 2,
    );
    if (activeEgresses.length === 0){
        return new NextResponse('No active recording found', {status: 400});
    }
    await Promise.all(activeEgresses.map((info)=>egressClient.stopEgress(info.egressId)));

    return new NextResponse('Recording stopped', {status: 200});
    }catch (error){
        if(error instanceof Error){
            return new NextResponse(error.message, {status: 500});
        }
    }
}