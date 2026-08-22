import React from 'react';
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const C = {bg: '#040504', ivory: '#F2F4F3', muted: '#8C918E', green: '#00E878', line: 'rgba(242,244,243,.12)'};

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const fade = (frame: number, duration: number) =>
  interpolate(frame, [0, 18, duration - 18, duration], [0, 1, 1, 0], clamp);
const rise = (frame: number, fps: number, delay = 0) => {
  const p = spring({frame: frame - delay, fps, config: {damping: 22, stiffness: 90, mass: 1}});
  return {opacity: interpolate(p, [0, 1], [0, 1]), transform: `translateY(${interpolate(p, [0, 1], [35, 0])}px)`};
};

const Grid: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{
    opacity: .65,
    backgroundImage: 'linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)',
    backgroundSize: '72px 72px',
    backgroundPosition: `${frame * -.18}px ${frame * .08}px`,
    maskImage: 'radial-gradient(circle at 50% 45%, black 0%, transparent 78%)',
  }}/>;
};

const Shell: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{backgroundColor: C.bg, color: C.ivory, fontFamily: 'Arial, Helvetica, sans-serif', overflow: 'hidden'}}>
    <Grid/>
    <div style={{position:'absolute', inset:40, border:`1px solid ${C.line}`, pointerEvents:'none'}}/>
    <div style={{position:'absolute', top:62, left:72, display:'flex', alignItems:'center', gap:14}}>
      <div style={{width:34,height:34,border:`1px solid ${C.line}`,overflow:'hidden'}}><Img src={staticFile('logo.png')} style={{width:'100%',height:'100%',transform:'scale(1.65)'}}/></div>
      <div style={{fontSize:22,fontWeight:650,letterSpacing:'-.06em'}}>Compute<span style={{color:C.green}}>Fi</span></div>
    </div>
    <div style={{position:'absolute',top:76,right:72,fontFamily:'monospace',fontSize:12,letterSpacing:3,color:C.muted}}>THE OPEN COMPUTE MARKET</div>
    {children}
  </AbsoluteFill>
);

const Eyebrow: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{display:'flex',alignItems:'center',gap:12,color:C.green,fontSize:14,fontWeight:600,letterSpacing:4,textTransform:'uppercase'}}><span style={{width:7,height:7,background:C.green,borderRadius:'50%'}}/>{children}</div>;
const Title: React.FC<{children: React.ReactNode; size?:number}> = ({children,size=102}) => <div style={{fontSize:size,lineHeight:.94,letterSpacing:'-.075em',fontWeight:520,maxWidth:1250}}>{children}</div>;
const Caption: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{fontSize:25,lineHeight:1.45,color:C.muted,maxWidth:760,letterSpacing:'-.02em'}}>{children}</div>;

const Packet: React.FC<{x:number;y:number;delay:number;label?:string}> = ({x,y,delay,label}) => {
  const frame = useCurrentFrame();
  const p = interpolate((frame-delay)%90,[0,90],[0,1],clamp);
  return <div style={{position:'absolute',left:x,top:y,width:label?125:8,height:label?34:8,background:label?C.bg:C.green,border:label?`1px solid ${C.green}`:'none',boxShadow:`0 0 22px ${C.green}`,transform:`translateX(${p*420}px)`,opacity:interpolate(p,[0,.08,.9,1],[0,1,1,0]),display:'grid',placeItems:'center',fontFamily:'monospace',fontSize:11,color:C.green,letterSpacing:2}}>{label}</div>;
};

const Intro: React.FC = () => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig();
  return <Shell><div style={{position:'absolute',left:150,top:300,opacity:fade(frame,240)}}>
    <div style={rise(frame,fps,0)}><Eyebrow>Compute marketplace · Solana</Eyebrow></div>
    <div style={{...rise(frame,fps,10),marginTop:36}}><Title>Idle compute,<br/><span style={{color:C.green}}>settled.</span></Title></div>
    <div style={{...rise(frame,fps,24),marginTop:38}}><Caption>Turn spare GPU capacity into an open market for useful work.</Caption></div>
  </div><div style={{position:'absolute',left:1180,top:300,width:540,height:420,opacity:fade(frame,240)}}>
    {[0,1,2,3,4].map(i=><React.Fragment key={i}><div style={{position:'absolute',left:0,top:40+i*78,width:460,height:1,background:C.line}}/><div style={{position:'absolute',left:-12,top:28+i*78,width:25,height:25,border:`1px solid ${i===2?C.green:C.line}`,background:C.bg}}/><Packet x={0} y={37+i*78} delay={i*13}/></React.Fragment>)}
  </div></Shell>;
};

const Problem: React.FC = () => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig();
  const pulse=.4+.6*Math.sin(frame/18)**2;
  return <Shell><div style={{position:'absolute',left:150,top:275,opacity:fade(frame,240)}}><div style={rise(frame,fps)}><Eyebrow>01 · The mismatch</Eyebrow></div><div style={{...rise(frame,fps,9),marginTop:36}}><Title size={88}>Compute sits idle.<br/>Demand keeps moving.</Title></div><div style={{...rise(frame,fps,20),marginTop:36}}><Caption>Powerful machines wait unused while builders need fast, flexible access to capacity.</Caption></div></div>
  <div style={{position:'absolute',right:130,bottom:145,width:640,height:190,display:'flex',gap:16,alignItems:'flex-end',opacity:fade(frame,240)}}>{[.35,.7,.48,.9,.28,.58,.8,.42].map((v,i)=><div key={i} style={{flex:1,height:150*v,border:`1px solid ${C.line}`,background:i===3?`rgba(0,232,120,${.08*pulse})`:'rgba(255,255,255,.015)',position:'relative'}}><div style={{position:'absolute',bottom:0,left:0,right:0,height:`${20+pulse*35}%`,background:i===3?C.green:'rgba(255,255,255,.1)',opacity:i===3?.9:.35}}/></div>)}</div></Shell>;
};

const FlowNode: React.FC<{x:number;title:string;sub:string;active:number;index:number}> = ({x,title,sub,active,index}) => {
  const on = active >= index;
  return <div style={{position:'absolute',left:x,top:445,width:300,height:180,border:`1px solid ${on?C.green:C.line}`,background:on?'rgba(0,232,120,.045)':'rgba(255,255,255,.015)',padding:28,boxSizing:'border-box',boxShadow:on?'0 0 45px rgba(0,232,120,.06)':'none'}}><div style={{fontFamily:'monospace',fontSize:12,color:on?C.green:C.muted,letterSpacing:3}}>0{index+1}</div><div style={{fontSize:28,fontWeight:550,marginTop:28,letterSpacing:'-.04em'}}>{title}</div><div style={{fontSize:15,color:C.muted,marginTop:10}}>{sub}</div></div>;
};

const How: React.FC = () => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig(); const active=Math.min(2,Math.floor(Math.max(0,frame-45)/52));
  return <Shell><div style={{position:'absolute',left:150,top:205,opacity:fade(frame,300)}}><div style={rise(frame,fps)}><Eyebrow>02 · One simple market</Eyebrow></div><div style={{...rise(frame,fps,8),marginTop:30}}><Title size={76}>Describe the work. Fund it. Let the network deliver.</Title></div></div>
  <div style={{opacity:fade(frame,300)}}><div style={{position:'absolute',left:300,top:534,width:1200,height:1,background:C.line}}/><FlowNode x={180} title="Post a job" sub="Model, input, budget" active={active} index={0}/><FlowNode x={810} title="Match capacity" sub="Available worker claims it" active={active} index={1}/><FlowNode x={1440} title="Verify & settle" sub="Result unlocks payment" active={active} index={2}/>{active<2&&<Packet x={480+active*630} y={530} delay={0} label="WORK UNIT"/>}</div></Shell>;
};

const Verify: React.FC = () => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig(); const check=spring({frame:frame-80,fps,config:{damping:16,stiffness:110}});
  const dash=interpolate(frame,[20,190],[480,0],clamp);
  return <Shell><div style={{position:'absolute',left:150,top:265,opacity:fade(frame,270)}}><div style={rise(frame,fps)}><Eyebrow>03 · Results, not promises</Eyebrow></div><div style={{...rise(frame,fps,8),marginTop:36}}><Title size={88}>Work completes.<br/><span style={{color:C.green}}>Proof moves value.</span></Title></div><div style={{...rise(frame,fps,20),marginTop:38}}><Caption>ComputeFi coordinates the job, records completion, and credits the machine that did the work.</Caption></div></div>
  <div style={{position:'absolute',right:210,top:295,width:470,height:470,opacity:fade(frame,270)}}><svg width="470" height="470" viewBox="0 0 470 470"><circle cx="235" cy="235" r="184" fill="none" stroke={C.line} strokeWidth="1"/><circle cx="235" cy="235" r="150" fill="rgba(0,232,120,.025)" stroke={C.green} strokeWidth="2" strokeDasharray="480" strokeDashoffset={dash} transform="rotate(-90 235 235)"/><path d="M153 237 L211 294 L326 167" fill="none" stroke={C.green} strokeWidth="13" strokeLinecap="square" strokeLinejoin="miter" pathLength="1" strokeDasharray="1" strokeDashoffset={1-check}/></svg><div style={{position:'absolute',inset:0,display:'grid',placeItems:'center',paddingTop:285,fontFamily:'monospace',fontSize:12,letterSpacing:4,color:C.green,opacity:check}}>COMPLETION VERIFIED</div></div></Shell>;
};

const Settlement: React.FC = () => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig(); const count=interpolate(frame,[35,150],[0,97.5],clamp);
  return <Shell><div style={{position:'absolute',left:150,top:245,opacity:fade(frame,240)}}><div style={rise(frame,fps)}><Eyebrow>04 · Settlement on Solana</Eyebrow></div><div style={{...rise(frame,fps,8),marginTop:35}}><Title size={90}>Value flows back<br/>to the machines.</Title></div><div style={{...rise(frame,fps,20),marginTop:38}}><Caption>Workers earn in SOL. Renters pay only for completed work.</Caption></div></div>
  <div style={{position:'absolute',right:155,top:320,width:650,opacity:fade(frame,240)}}><div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',borderBottom:`1px solid ${C.line}`,paddingBottom:24}}><span style={{fontFamily:'monospace',fontSize:13,letterSpacing:3,color:C.muted}}>WORKER SHARE</span><span style={{fontSize:104,fontWeight:500,letterSpacing:'-.08em',color:C.green}}>{count.toFixed(1)}<span style={{fontSize:34}}>%</span></span></div><div style={{display:'flex',justifyContent:'space-between',marginTop:24,fontFamily:'monospace',fontSize:13,letterSpacing:2,color:C.muted}}><span>JOB COMPLETE</span><span style={{color:C.ivory}}>SETTLED IN SOL</span></div><div style={{height:6,background:'rgba(255,255,255,.08)',marginTop:50}}><div style={{height:'100%',width:`${count}%`,background:C.green,boxShadow:`0 0 24px ${C.green}`}}/></div></div></Shell>;
};

const End: React.FC = () => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig();
  return <Shell><div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',opacity:fade(frame,210)}}><div><div style={{...rise(frame,fps),display:'flex',justifyContent:'center'}}><Eyebrow>Rent compute · Earn from hardware</Eyebrow></div><div style={{...rise(frame,fps,10),marginTop:42}}><Title size={110}>Compute,<br/><span style={{color:C.green}}>without the middle.</span></Title></div><div style={{...rise(frame,fps,24),margin:'46px auto 0',display:'inline-flex',border:`1px solid ${C.green}`,padding:'20px 32px',fontFamily:'monospace',fontSize:15,letterSpacing:3,color:C.green}}>COMPUTEFI</div></div></div><div style={{position:'absolute',bottom:68,left:72,right:72,display:'flex',justifyContent:'space-between',fontFamily:'monospace',fontSize:11,letterSpacing:2,color:C.muted}}><span>OPEN COMPUTE MARKET</span><span>BUILT ON SOLANA</span></div></Shell>;
};

export const ComputeFiExplainer: React.FC = () => <AbsoluteFill style={{background:C.bg}}>
  <Sequence from={0} durationInFrames={240}><Intro/></Sequence>
  <Sequence from={220} durationInFrames={240}><Problem/></Sequence>
  <Sequence from={440} durationInFrames={300}><How/></Sequence>
  <Sequence from={720} durationInFrames={270}><Verify/></Sequence>
  <Sequence from={970} durationInFrames={240}><Settlement/></Sequence>
  <Sequence from={1190} durationInFrames={310}><End/></Sequence>
</AbsoluteFill>;
