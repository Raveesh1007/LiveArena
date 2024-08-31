import "../styles/globals.css";
import '@livekit/components-styles';
import '@livekit/components-styles/prefabs';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata ={
  title: {
    default: "Livearena",
    template: "%s",
  },

  description:
  'LiveArena is an webRtc Project that allows you to create and join rooms to chat with your friends',
},

icons: {
  icons: {
    rel: "icon",
    url: "/favicon-32x32.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#070707",
};

export default function Rootlayout({children}: {children: React.ReactNode}){
  return(
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}