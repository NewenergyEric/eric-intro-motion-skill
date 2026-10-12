import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {ArtNative} from './ArtNative';
const Root=()=> <>{(['zh','en'] as const).flatMap(language=>([['square',1080],['portrait',1440],['vertical',1920]] as const).map(([ratio,height])=><Composition key={`${language}-${ratio}`} id={`art-director-${language}-${ratio}`} component={ArtNative} width={1080} height={height} fps={30} durationInFrames={720} defaultProps={{language,audit:false}}/>))}</>;
registerRoot(Root);
