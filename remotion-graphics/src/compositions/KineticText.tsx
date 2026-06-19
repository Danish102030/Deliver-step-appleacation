import React from 'react';
import {AbsoluteFill,useCurrentFrame,useVideoConfig,spring,interpolate} from 'remotion';
import {z} from 'zod';
import {loadFont} from '@remotion/google-fonts/Inter';
const {fontFamily} = loadFont();
export const kineticTextSchema = z.object({words:z.array(z.string()).default(['Motion','Graphics','Studio'])});
export type KineticTextProps = z.infer<typeof kineticTextSchema>;
export const defaultKineticTextProps: KineticTextProps = {words:['Motion','Graphics','Studio']};
export const KineticText: React.FC<KineticTextProps> = ({words}) => {
  const frame = useCurrentFrame();
  const {fps,durationInFrames} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor:'#0a0a1a',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:24}}>
      {words.map((word,i)=>{
        const wordFrame=frame-i*fps;
        const opacity=spring({fps,frame:wordFrame,config:{damping:20,stiffness:80,mass:1},from:0,to:1});
        const scale=spring({fps,frame:wordFrame,config:{damping:10,stiffness:60,mass:1},from:0.5,to:1});
        const fadeOut=interpolate(frame,[durationInFrames-20,durationInFrames-1],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
        return <div key={i} style={{opacity:opacity*fadeOut,transform:`scale(${scale})`,color:'#ffffff',fontSize:120,fontFamily,fontWeight:800,letterSpacing:'-2px',textTransform:'uppercase'}}>{word}</div>;
      })}
    </AbsoluteFill>
  );
};
