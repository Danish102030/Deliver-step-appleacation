import React from 'react';
import {Composition} from 'remotion';
import {TitleCard,titleCardSchema,defaultTitleCardProps} from './compositions/TitleCard';
import {LowerThird,lowerThirdSchema,defaultLowerThirdProps} from './compositions/LowerThird';
import {KineticText,kineticTextSchema,defaultKineticTextProps} from './compositions/KineticText';
import {TransparentOverlay,transparentOverlaySchema,defaultTransparentOverlayProps} from './compositions/TransparentOverlay';
import {VIDEO_WIDTH,VIDEO_HEIGHT,VIDEO_FPS} from './constants';
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="TitleCard" component={TitleCard} durationInFrames={150} fps={VIDEO_FPS} width={VIDEO_WIDTH} height={VIDEO_HEIGHT} schema={titleCardSchema} defaultProps={defaultTitleCardProps} />
    <Composition id="LowerThird" component={LowerThird} durationInFrames={150} fps={VIDEO_FPS} width={VIDEO_WIDTH} height={VIDEO_HEIGHT} schema={lowerThirdSchema} defaultProps={defaultLowerThirdProps} />
    <Composition id="KineticText" component={KineticText} durationInFrames={180} fps={VIDEO_FPS} width={VIDEO_WIDTH} height={VIDEO_HEIGHT} schema={kineticTextSchema} defaultProps={defaultKineticTextProps} />
    <Composition id="TransparentOverlay" component={TransparentOverlay} durationInFrames={150} fps={VIDEO_FPS} width={VIDEO_WIDTH} height={VIDEO_HEIGHT} schema={transparentOverlaySchema} defaultProps={defaultTransparentOverlayProps} />
  </>
);
