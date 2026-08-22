import React from 'react';
import {Composition} from 'remotion';
import {ComputeFiExplainer} from './ComputeFiExplainer';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="ComputeFiExplainer"
    component={ComputeFiExplainer}
    durationInFrames={1500}
    fps={30}
    width={1920}
    height={1080}
  />
);
