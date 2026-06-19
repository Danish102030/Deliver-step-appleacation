import React from 'react';
import {AbsoluteFill,useCurrentFrame,useVideoConfig,spring,interpolate} from 'remotion';
import {z} from 'zod';
export const transparentOverlaySchema = z.object({label:z.string().default('LIVE'),color:z.string().default('#FF0000')});
export type TransparentOverlayProps = z.infer<typeof transparentOverlaySchema>;
export const defaultTransparentOverlayProps: TransparentOverlayProps = {label:'LIVE',color:'#FF0000'};
export const TransparentOverlay: React.FC<TransparentOverlayProps> = ({label,color}) => {
  const frame = useCurrentFrame();
  const {fps,durationInFrames} = useVideoConfig();
  const scale = spring({fps,frame,config:{damping:8,stiffness:120,mass:0.8},from:0,to:1});
  const opacity = interpolate(frame,[durationInFrames-20,durationInFrames-1],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor:'transparent'}}>
      <div style={{position:'absolute',top:60,left:60,transform:`scale(${scale})`,opacity,display:'flex',alignItems:'center',gap:12,backgroundColor:color,borderRadius:8,padding:'12px 24px'}}>
        <div style={{width:16,height:16,borderRadius:'50%',backgroundColor:'#ffffff',opacity:Math.sin(frame*0.15)*0.5+0.5}} />
        <span style={{color:'#ffffff',fontSize:36,fontWeight:900,fontFamily:'sans-serif',letterSpacing:'3px'}}>{label}</span>
      </div>
    </AbsoluteFill>
  );
};
