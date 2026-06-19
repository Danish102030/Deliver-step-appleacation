import React from 'react';
import {AbsoluteFill,useCurrentFrame,useVideoConfig,interpolate,Easing} from 'remotion';
import {z} from 'zod';
export const lowerThirdSchema = z.object({name:z.string().default('Jane Doe'),title:z.string().default('Motion Designer'),accentColor:z.string().default('#0066FF')});
export type LowerThirdProps = z.infer<typeof lowerThirdSchema>;
export const defaultLowerThirdProps: LowerThirdProps = {name:'Jane Doe',title:'Motion Designer',accentColor:'#0066FF'};
export const LowerThird: React.FC<LowerThirdProps> = ({name,title,accentColor}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const holdEnd = durationInFrames-30;
  const slideIn = interpolate(frame,[0,30],[-600,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.out(Easing.cubic)});
  const slideOut = interpolate(frame,[holdEnd,durationInFrames-1],[0,-600],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.in(Easing.cubic)});
  const translateX = frame<holdEnd?slideIn:slideOut;
  return (
    <AbsoluteFill style={{display:'flex',alignItems:'flex-end',justifyContent:'flex-start',padding:'0 0 120px 80px'}}>
      <div style={{transform:`translateX(${translateX}px)`,display:'flex',flexDirection:'row'}}>
        <div style={{width:8,backgroundColor:accentColor,marginRight:16,borderRadius:4}} />
        <div style={{backgroundColor:'rgba(0,0,0,0.85)',padding:'16px 32px',display:'flex',flexDirection:'column'}}>
          <span style={{color:'#ffffff',fontSize:52,fontWeight:700,fontFamily:'sans-serif'}}>{name}</span>
          <span style={{color:accentColor,fontSize:32,fontWeight:400,fontFamily:'sans-serif',textTransform:'uppercase'}}>{title}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
