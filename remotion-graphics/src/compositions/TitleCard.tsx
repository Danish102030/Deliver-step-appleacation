import React from 'react';
import {AbsoluteFill,useCurrentFrame,useVideoConfig,interpolate,spring,Easing} from 'remotion';
import {z} from 'zod';
export const titleCardSchema = z.object({title:z.string().default('Hello World'),subtitle:z.string().default('A Remotion Motion Graphic')});
export type TitleCardProps = z.infer<typeof titleCardSchema>;
export const defaultTitleCardProps: TitleCardProps = {title:'Hello World',subtitle:'A Remotion Motion Graphic'};
export const TitleCard: React.FC<TitleCardProps> = ({title,subtitle}) => {
  const frame = useCurrentFrame();
  const {durationInFrames,fps} = useVideoConfig();
  const opacity = interpolate(frame,[0,20],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.out(Easing.ease)});
  const scale = spring({fps,frame,config:{damping:12,stiffness:100,mass:0.5},from:0.9,to:1});
  const fadeOut = interpolate(frame,[durationInFrames-20,durationInFrames-1],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor:'#0a0a1a',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',opacity:opacity*fadeOut,transform:`scale(${scale})`}}>
      <h1 style={{color:'#ffffff',fontSize:120,fontFamily:'sans-serif',fontWeight:800,margin:0,letterSpacing:'-2px',textAlign:'center'}}>{title}</h1>
      {subtitle?<p style={{color:'#aaaacc',fontSize:48,fontFamily:'sans-serif',fontWeight:400,marginTop:24,letterSpacing:'4px',textTransform:'uppercase'}}>{subtitle}</p>:null}
    </AbsoluteFill>
  );
};
