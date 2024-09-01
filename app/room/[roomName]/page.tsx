import * as React from 'react';
import { PageClientImpl } from './PageClientImpl';
import { isVideoCodec } from '@/lib/types';

export default function Page({
  params,
  searchParams,
}: {
  params: { roomName: string };
  searchParams: {
    // FIXME: We should not allow values for regions if in playground mode.
    region?: string;
    hq?: string;
    codec?: string;
  };
}) {
    const codec = searchParams.codec === 'string' && isVideoCodec(searchParams.codec)
    ? searchParams.codec
    : vp9; 

    const hq = searchParams.hq === 'true' ? true : false;

    const region = searchParams.region || ''; // Provide a default value for region

    return (
        <PageClientImpl roomName = {params.roomName} region = {region} hq = {hq} codec = {codec}/>
    )   
}