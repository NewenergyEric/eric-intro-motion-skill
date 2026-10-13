import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {TidekeeperNative} from './TidekeeperNative';
const Root=()=> <>{(['zh','en'] as const).flatMap(language=>([['square',1080],['portrait',1440],['vertical',1920]] as const).map(([ratio,height])=><Composition key={`${language}-${ratio}`} id={`tidekeeper-${language}-${ratio}`} component={TidekeeperNative} width={1080} height={height} fps={30} durationInFrames={720} defaultProps={{language,audit:false}}/>))}</>;
registerRoot(Root);
