"use client";

import { useId, useState, type ComponentType } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Cpu,
  FileText,
  LockKeyhole,
  Wallet,
  type LucideProps,
} from "lucide-react";

type Point = { x: number; y: number };
type NodeId = "renter" | "job" | "gpu1" | "gpu2" | "gpu3" | "result" | "settle" | "escrow";
type RouteId =
  | "renter-job"
  | "job-gpu1"
  | "job-gpu2"
  | "job-gpu3"
  | "gpu1-result"
  | "gpu2-result"
  | "gpu3-result"
  | "result-settle"
  | "fund-escrow"
  | "escrow-job";
type InspectTarget = "gpu1" | "gpu2" | "gpu3" | "result" | "settle" | "escrow" | null;
type LabelSide = "below" | "right" | "left";

type NodeDefinition = Point & {
  id: NodeId;
  title: string;
  status: string;
  icon: ComponentType<LucideProps>;
  accent?: boolean;
  labelSide?: LabelSide;
};

type RouteDefinition = {
  id: RouteId;
  d: string;
  active?: boolean;
  financial?: boolean;
};

const NODE_RADIUS = 21;
const ACCENT = "#00e878";
const PATH_NEUTRAL = "rgba(245,245,245,.2)";
const PATH_DIM = "rgba(245,245,245,.1)";

const desktopPoints: Record<NodeId, Point> = {
  renter: { x: 80, y: 260 },
  job: { x: 285, y: 260 },
  gpu1: { x: 560, y: 92 },
  gpu2: { x: 560, y: 260 },
  gpu3: { x: 560, y: 428 },
  result: { x: 845, y: 260 },
  settle: { x: 1040, y: 260 },
  escrow: { x: 285, y: 72 },
};

const mobilePoints: Record<NodeId, Point> = {
  renter: { x: 60, y: 70 },
  job: { x: 60, y: 210 },
  gpu1: { x: 60, y: 390 },
  gpu2: { x: 180, y: 390 },
  gpu3: { x: 300, y: 390 },
  result: { x: 180, y: 610 },
  settle: { x: 180, y: 785 },
  escrow: { x: 292, y: 145 },
};

function pointAtEdge(point: Point, side: "left" | "right" | "top" | "bottom") {
  if (side === "left") return { x: point.x - NODE_RADIUS, y: point.y };
  if (side === "right") return { x: point.x + NODE_RADIUS, y: point.y };
  if (side === "top") return { x: point.x, y: point.y - NODE_RADIUS };
  return { x: point.x, y: point.y + NODE_RADIUS };
}

function horizontalPath(from: Point, to: Point) {
  const start = pointAtEdge(from, "right");
  const end = pointAtEdge(to, "left");
  return `M ${start.x} ${start.y} C ${start.x + (end.x - start.x) * 0.4} ${start.y}, ${end.x - (end.x - start.x) * 0.4} ${end.y}, ${end.x} ${end.y}`;
}

function computePath(from: Point, to: Point) {
  const start = pointAtEdge(from, "right");
  const end = pointAtEdge(to, "left");
  const bend = Math.max(72, (end.x - start.x) * 0.46);
  return `M ${start.x} ${start.y} C ${start.x + bend} ${start.y}, ${end.x - bend} ${end.y}, ${end.x} ${end.y}`;
}

function verticalPath(from: Point, to: Point) {
  const start = pointAtEdge(from, "bottom");
  const end = pointAtEdge(to, "top");
  const bend = (end.y - start.y) * 0.46;
  return `M ${start.x} ${start.y} C ${start.x} ${start.y + bend}, ${end.x} ${end.y - bend}, ${end.x} ${end.y}`;
}

function mobileComputePath(from: Point, to: Point) {
  const start = pointAtEdge(from, "bottom");
  const end = pointAtEdge(to, "top");
  const bend = Math.max(62, (end.y - start.y) * 0.46);
  return `M ${start.x} ${start.y} C ${start.x} ${start.y + bend}, ${end.x} ${end.y - bend}, ${end.x} ${end.y}`;
}

function buildNodes(points: Record<NodeId, Point>, mobile: boolean): NodeDefinition[] {
  const side: LabelSide = mobile ? "right" : "below";
  return [
    { id: "renter", ...points.renter, title: "RENTER", status: "WORKLOAD", icon: FileText, labelSide: side },
    { id: "job", ...points.job, title: "JOB", status: "FUNDED", icon: FileText, labelSide: side },
    { id: "gpu1", ...points.gpu1, title: "GPU 01", status: "AVAILABLE", icon: Cpu, labelSide: mobile ? "below" : side },
    { id: "gpu2", ...points.gpu2, title: "GPU 02", status: "PROCESSING", icon: Cpu, accent: true, labelSide: "below" },
    { id: "gpu3", ...points.gpu3, title: "GPU 03", status: "AVAILABLE", icon: Cpu, labelSide: mobile ? "below" : side },
    { id: "result", ...points.result, title: "RESULT", status: "VERIFIED", icon: Check, accent: true, labelSide: mobile ? "right" : side },
    { id: "settle", ...points.settle, title: "SETTLE", status: "CLAIMABLE", icon: Wallet, accent: true, labelSide: mobile ? "right" : side },
    { id: "escrow", ...points.escrow, title: "ESCROW", status: "SOL LOCKED", icon: LockKeyhole, labelSide: mobile ? "left" : side },
  ];
}

function buildDesktopRoutes(points: Record<NodeId, Point>): RouteDefinition[] {
  const escrowLeft = pointAtEdge(points.escrow, "left");
  const escrowRight = pointAtEdge(points.escrow, "right");
  const jobTop = pointAtEdge(points.job, "top");

  return [
    { id: "renter-job", d: horizontalPath(points.renter, points.job) },
    { id: "job-gpu1", d: computePath(points.job, points.gpu1) },
    { id: "job-gpu2", d: horizontalPath(points.job, points.gpu2), active: true },
    { id: "job-gpu3", d: computePath(points.job, points.gpu3) },
    { id: "gpu1-result", d: computePath(points.gpu1, points.result) },
    { id: "gpu2-result", d: horizontalPath(points.gpu2, points.result), active: true },
    { id: "gpu3-result", d: computePath(points.gpu3, points.result) },
    { id: "result-settle", d: horizontalPath(points.result, points.settle), active: true },
    {
      id: "fund-escrow",
      financial: true,
      d: `M 170 260 C 170 162, 210 72, ${escrowLeft.x} ${escrowLeft.y}`,
    },
    {
      id: "escrow-job",
      financial: true,
      d: `M ${escrowRight.x} ${escrowRight.y} C 400 72, 400 174, ${jobTop.x} ${jobTop.y}`,
    },
  ];
}

function buildMobileRoutes(points: Record<NodeId, Point>): RouteDefinition[] {
  const jobTop = pointAtEdge(points.job, "top");
  const escrowBottom = pointAtEdge(points.escrow, "bottom");

  return [
    { id: "renter-job", d: verticalPath(points.renter, points.job) },
    { id: "job-gpu1", d: mobileComputePath(points.job, points.gpu1) },
    { id: "job-gpu2", d: mobileComputePath(points.job, points.gpu2), active: true },
    { id: "job-gpu3", d: mobileComputePath(points.job, points.gpu3) },
    { id: "gpu1-result", d: mobileComputePath(points.gpu1, points.result) },
    { id: "gpu2-result", d: verticalPath(points.gpu2, points.result), active: true },
    { id: "gpu3-result", d: mobileComputePath(points.gpu3, points.result) },
    { id: "result-settle", d: verticalPath(points.result, points.settle), active: true },
    {
      id: "fund-escrow",
      financial: true,
      d: `M ${jobTop.x} ${jobTop.y} C 92 140, 212 118, ${escrowBottom.x} ${escrowBottom.y}`,
    },
    {
      id: "escrow-job",
      financial: true,
      d: `M ${escrowBottom.x} ${escrowBottom.y} C 218 192, 132 165, ${jobTop.x} ${jobTop.y}`,
    },
  ];
}

const inspectedRoutes: Record<Exclude<InspectTarget, null>, RouteId[]> = {
  gpu1: ["job-gpu1", "gpu1-result"],
  gpu2: ["job-gpu2", "gpu2-result"],
  gpu3: ["job-gpu3", "gpu3-result"],
  result: ["gpu1-result", "gpu2-result", "gpu3-result"],
  settle: ["result-settle"],
  escrow: ["fund-escrow", "escrow-job"],
};

function StatusLabel({ x, y, text, active, anchor = "middle" }: { x: number; y: number; text: string; active?: boolean; anchor?: "start" | "middle" | "end" }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fill={active ? ACCENT : "rgba(245,245,245,.42)"}
      fontSize="8.5"
      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      fontWeight="500"
      letterSpacing="1.5"
    >
      {text}
    </text>
  );
}

function MeshNode({
  node,
  inspected,
  reducedMotion,
  onInspect,
}: {
  node: NodeDefinition;
  inspected: InspectTarget;
  reducedMotion: boolean;
  onInspect: (target: InspectTarget) => void;
}) {
  const Icon = node.icon;
  const target = (["gpu1", "gpu2", "gpu3", "result", "settle", "escrow"] as NodeId[]).includes(node.id)
    ? (node.id as Exclude<InspectTarget, null>)
    : null;
  const isInspected = inspected === target;
  const isUnrelated = inspected !== null && target !== null && !isInspected;
  const side = node.labelSide ?? "below";
  const titleX = side === "right" ? 36 : side === "left" ? -36 : 0;
  const titleY = side === "below" ? 52 : -3;
  const statusY = side === "below" ? 69 : 14;
  const anchor = side === "right" ? "start" : side === "left" ? "end" : "middle";
  const escrowStatus = node.id === "escrow" && isInspected ? "0.42 SOL LOCKED" : node.status;

  return (
    <g
      transform={`translate(${node.x} ${node.y})`}
      role={target ? "button" : undefined}
      tabIndex={target ? 0 : undefined}
      aria-label={target ? `${node.title}: ${escrowStatus}` : undefined}
      onPointerEnter={() => target && onInspect(target)}
      onPointerLeave={() => onInspect(null)}
      onFocus={() => target && onInspect(target)}
      onBlur={() => onInspect(null)}
      className={target ? "cursor-pointer outline-none" : undefined}
    >
      {node.id === "gpu2" && (
        <motion.circle
          r="27"
          fill="none"
          stroke={ACCENT}
          strokeWidth="1"
          animate={reducedMotion ? { opacity: 0.12 } : { r: [25, 28, 25], opacity: [0.08, 0.2, 0.08] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <circle r="34" fill="transparent" />
      <motion.g
        animate={{ scale: isInspected ? 1.06 : 1, opacity: isUnrelated ? 0.58 : 1 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <circle
          r={NODE_RADIUS}
          fill="rgba(3,5,4,.96)"
          stroke={node.accent || isInspected ? ACCENT : "rgba(245,245,245,.28)"}
          strokeWidth="1"
        />
        {node.id === "result" ? (
          <motion.g
            animate={reducedMotion ? { scale: 1 } : { scale: [1, 1, 1, 1.14, 1] }}
            transition={{ duration: 6.8, repeat: Infinity, times: [0, 0.58, 0.66, 0.72, 1] }}
          >
            <Icon x={-8} y={-8} width={16} height={16} stroke={ACCENT} strokeWidth={2} />
          </motion.g>
        ) : (
          <Icon
            x={-8}
            y={-8}
            width={16}
            height={16}
            stroke={node.accent ? ACCENT : "rgba(245,245,245,.82)"}
            strokeWidth={1.7}
          />
        )}
        <text
          x={titleX}
          y={titleY}
          textAnchor={anchor}
          fill="#f5f5f5"
          fontSize="11"
          fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
          fontWeight="650"
          letterSpacing="1.2"
        >
          {node.title}
        </text>
        <StatusLabel x={titleX} y={statusY} anchor={anchor} text={escrowStatus} active={node.id === "gpu2" || node.accent} />
      </motion.g>
    </g>
  );
}

function routeStyle(route: RouteDefinition, inspected: InspectTarget) {
  if (!inspected) {
    return {
      opacity: route.financial ? 0.76 : 1,
      stroke: route.active ? ACCENT : PATH_NEUTRAL,
      width: route.active ? 1.25 : 1,
    };
  }

  const highlighted = inspectedRoutes[inspected].includes(route.id);
  return {
    opacity: highlighted ? 1 : 0.34,
    stroke: highlighted ? ACCENT : PATH_DIM,
    width: highlighted ? 1.55 : 1,
  };
}

function MeshPath({ route, inspected, pathId }: { route: RouteDefinition; inspected: InspectTarget; pathId: string }) {
  const style = routeStyle(route, inspected);
  const isSettlement = route.id === "result-settle";
  return (
    <motion.path
      id={pathId}
      d={route.d}
      fill="none"
      stroke={style.stroke}
      strokeWidth={style.width}
      strokeLinecap="round"
      strokeDasharray={route.financial ? "3 6" : undefined}
      animate={
        isSettlement && !inspected
          ? { opacity: [0.42, 0.42, 1, 1, 0.42] }
          : { opacity: style.opacity }
      }
      transition={
        isSettlement && !inspected
          ? { duration: 6.8, repeat: Infinity, times: [0, 0.62, 0.7, 0.84, 1] }
          : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
      }
    />
  );
}

function FlowParticle({ pathId, color, duration, begin, radius = 2.5 }: { pathId: string; color: string; duration: number; begin: number; radius?: number }) {
  return (
    <circle r={radius} fill={color} opacity="0">
      <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.12;0.82;1" dur={`${duration}s`} begin={`${begin}s`} repeatCount="indefinite" />
      <animateMotion dur={`${duration}s`} begin={`${begin}s`} repeatCount="indefinite" rotate="auto">
        <mpath href={`#${pathId}`} />
      </animateMotion>
    </circle>
  );
}

function ComputeRoute({ routes, routeIds, inspected, prefix }: { routes: RouteDefinition[]; routeIds: RouteId[]; inspected: InspectTarget; prefix: string }) {
  return (
    <>
      {routeIds.map((id) => {
        const route = routes.find((item) => item.id === id);
        return route ? <MeshPath key={id} route={route} inspected={inspected} pathId={`${prefix}-${id}`} /> : null;
      })}
    </>
  );
}

function MeshDiagram({ mobile, idPrefix }: { mobile: boolean; idPrefix: string }) {
  const reducedMotion = useReducedMotion() ?? false;
  const [inspected, setInspected] = useState<InspectTarget>(null);
  const points = mobile ? mobilePoints : desktopPoints;
  const nodes = buildNodes(points, mobile);
  const routes = mobile ? buildMobileRoutes(points) : buildDesktopRoutes(points);
  const prefix = `${idPrefix}-${mobile ? "mobile" : "desktop"}`;
  const primaryRoutes: RouteId[] = ["renter-job", "result-settle"];
  const computeRoutes: RouteId[] = ["job-gpu1", "job-gpu2", "job-gpu3", "gpu1-result", "gpu2-result", "gpu3-result"];
  const financialRoutes: RouteId[] = ["fund-escrow", "escrow-job"];

  return (
    <svg
      className="h-auto w-full overflow-visible"
      viewBox={mobile ? "0 0 360 870" : "0 0 1120 520"}
      fill="none"
      role="img"
      aria-label="Renter funds a job, SOL is locked in escrow, compute is routed to a GPU, the result is verified, and payment becomes claimable."
      preserveAspectRatio="xMidYMid meet"
    >
      <circle cx={points.gpu2.x} cy={points.gpu2.y} r={mobile ? 92 : 112} fill={ACCENT} opacity="0.018" />

      <g aria-hidden="true">
        <ComputeRoute routes={routes} routeIds={primaryRoutes} inspected={inspected} prefix={prefix} />
        <ComputeRoute routes={routes} routeIds={computeRoutes} inspected={inspected} prefix={prefix} />
        <ComputeRoute routes={routes} routeIds={financialRoutes} inspected={inspected} prefix={prefix} />

        {!reducedMotion && (
          <g>
            <FlowParticle pathId={`${prefix}-renter-job`} color="#f5f5f5" duration={3.9} begin={0} />
            <FlowParticle pathId={`${prefix}-job-gpu2`} color={ACCENT} duration={4.4} begin={0.8} />
            <FlowParticle pathId={`${prefix}-gpu2-result`} color={ACCENT} duration={4.1} begin={1.75} />
            <FlowParticle pathId={`${prefix}-result-settle`} color={ACCENT} duration={5.1} begin={3.35} radius={2.8} />
            <FlowParticle pathId={`${prefix}-fund-escrow`} color={ACCENT} duration={6.2} begin={2.2} radius={2.2} />
          </g>
        )}
      </g>

      {nodes.map((node) => (
        <MeshNode key={node.id} node={node} inspected={inspected} reducedMotion={reducedMotion} onInspect={setInspected} />
      ))}
    </svg>
  );
}

export function NetworkMesh({ compact = false }: { compact?: boolean }) {
  const reactId = useId().replace(/:/g, "");
  return (
    <div className={`relative w-full ${compact ? "max-w-[620px]" : ""}`}>
      <div className="hidden md:block">
        <MeshDiagram mobile={false} idPrefix={`mesh-${reactId}`} />
      </div>
      <div className="mx-auto max-w-[420px] md:hidden">
        <MeshDiagram mobile idPrefix={`mesh-${reactId}`} />
      </div>
    </div>
  );
}
