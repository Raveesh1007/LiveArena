import { EgressClient, EncodedFileOutput, S3Upload } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest){
    try{
        const roomName = req.nextUrl.searchParams.get('roomName');
        if (roomName === null){
            return new NextResponse('Missing roomName parameter', {status: 403});
        }

        const {
            LIVEKIT_API_KEY,
            LIVEKIT_API_SECRET,
            LIVEKIT_URL,
            S3_KEY_ID,
            S3_KEY_SECRET,
            S3_BUCKET,
            S3_ENDPOINT,
            S3_REGION,
        }=process.env;

        const hostURL = new URL(LIVEKIT_URL!);
        hostURL.protocol = 'https';

        const egressClient = new EgressClient(hostURL.origin, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)

        const existingEgresses = await egressClient.listEgress({roomName});
        if (existingEgresses.length > 0 && existingEgresses.some((e)=>e.status < 2)){
            return new NextResponse('Recording already in progress', {status: 400});
        }

        const fileOutput = new EncodedFileOutput({
            filepath: `${new Date(Date.now()).toISOString()}-${roomName}.mp4`,
            output: {
                case: 's3',
                value: new S3Upload({
                    endpoint: S3_ENDPOINT,
                    accessKey: S3_KEY_ID,
                    secret: S3_KEY_SECRET,
                    bucket: S3_BUCKET,
                    region: S3_REGION,
                }),
            },
        });

        await egressClient.startRoomCompositeEgress(
            roomName,
            {
                file: fileOutput,
            },
            {
                layout: 'speaker',
            },
        );
        return new NextResponse('Recording started', {status: 200});
    }catch(error){
        if(error instanceof Error){
            return new NextResponse(error.message, {status: 500});
        }
    }
}