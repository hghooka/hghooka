import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, Line } from "@react-three/drei";
import * as THREE from "three";
import {
  COMPARTMENTS,
  type Atlas,
  type AtlasTarget,
  type Compartment,
} from "@/lib/moa-atlas";
import { Boxes, Search, RotateCcw, X, Pill } from "lucide-react";

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

function radiusFor(count: number): number {
  return Math.min(2.3, 0.55 + Math.sqrt(count) * 0.23);
}

// ── Cell membrane — the outer boundary you are floating inside ──────────────
function CellMembrane() {
  const wireRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (wireRef.current) wireRef.current.rotation.y += delta * 0.012;
  });
  return (
    <group position={[0, 3, 0]}>
      {/* Inner surface — faint backlit glow from inside */}
      <mesh>
        <sphereGeometry args={[25.5, 48, 48]} />
        <meshBasicMaterial
          color="#4fd0e3"
          transparent
          opacity={0.032}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Slowly rotating wireframe shell gives depth cue */}
      <mesh ref={wireRef}>
        <sphereGeometry args={[26, 32, 32]} />
        <meshBasicMaterial color="#4fd0e3" transparent opacity={0.05} wireframe />
      </mesh>
      {/* Outer corona visible from inside */}
      <mesh>
        <sphereGeometry args={[28, 24, 24]} />
        <meshBasicMaterial
          color="#4fd0e3"
          transparent
          opacity={0.014}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ── Nucleus — dense glowing core visible below you ─────────────────────────
function NucleusGlow() {
  const groupRef = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, delta) => {
    t.current += delta;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.055;
      // Subtle breathing pulse
      const p = 1 + Math.sin(t.current * 1.1) * 0.035;
      groupRef.current.scale.setScalar(p);
    }
  });
  return (
    <group ref={groupRef} position={[0, -8, 0]}>
      <mesh>
        <sphereGeometry args={[5.8, 40, 40]} />
        <meshBasicMaterial
          color="#e0489b"
          transparent
          opacity={0.13}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[6.0, 24, 24]} />
        <meshBasicMaterial color="#e0489b" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
      {/* Rotating chromatin-like wireframe */}
      <mesh>
        <sphereGeometry args={[6.2, 18, 18]} />
        <meshBasicMaterial color="#e0489b" transparent opacity={0.022} wireframe />
      </mesh>
      {/* Extended nuclear halo */}
      <mesh>
        <sphereGeometry args={[9.5, 20, 20]} />
        <meshBasicMaterial
          color="#e0489b"
          transparent
          opacity={0.016}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ── Mitochondria — warm glowing organelle island ────────────────────────────
function MitochondriaGlow() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.038;
  });
  return (
    <group ref={ref} position={[0, -3.5, 0]}>
      <mesh>
        <sphereGeometry args={[3.6, 24, 24]} />
        <meshBasicMaterial
          color="#ff8a5c"
          transparent
          opacity={0.075}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[4.8, 14, 14]} />
        <meshBasicMaterial
          color="#ff8a5c"
          transparent
          opacity={0.016}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ── Cytoplasm particles — Brownian-motion-like molecular environment ─────────
// Three overlapping point clouds rotating at different rates simulate
// the chaotic, dynamic feel of the cytoplasmic matrix.
function CytoplasmParticles() {
  const COUNT = 650;

  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = 4 + Math.random() * 17;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = (Math.random() - 0.5) * 26 + 1;
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, []);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  const r1 = useRef<THREE.Points>(null);
  const r2 = useRef<THREE.Points>(null);
  const r3 = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (r1.current) { r1.current.rotation.y += delta * 0.038; r1.current.rotation.x += delta * 0.007; }
    if (r2.current) { r2.current.rotation.y -= delta * 0.027; r2.current.rotation.z += delta * 0.009; }
    if (r3.current) { r3.current.rotation.y += delta * 0.019; r3.current.rotation.x -= delta * 0.006; }
  });

  return (
    <>
      <points ref={r1} geometry={geo}>
        <pointsMaterial size={0.07} color="#a98bff" transparent opacity={0.42}
          blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
      </points>
      <points ref={r2} geometry={geo}>
        <pointsMaterial size={0.06} color="#4fd0e3" transparent opacity={0.22}
          blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
      </points>
      <points ref={r3} geometry={geo}>
        <pointsMaterial size={0.05} color="#5fd49b" transparent opacity={0.16}
          blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
      </points>
    </>
  );
}

// ── Pathway connection lines ─────────────────────────────────────────────────
// Drawn between all targets that share the same signalling pathway as the
// focused target. Helps the viewer understand how mechanisms cluster.
function PathwayConnections({
  atlas,
  focusKey,
}: {
  atlas: Atlas;
  focusKey: string | null;
}) {
  const connections = useMemo(() => {
    if (!focusKey) return [];
    const focal = atlas.targetByKey.get(focusKey);
    if (!focal) return [];
    return atlas.targets
      .filter((t) => t.key !== focusKey && t.pathway === focal.pathway)
      .map((t) => ({
        from: focal.position as [number, number, number],
        to: t.position as [number, number, number],
        color: COMPARTMENTS[focal.compartment].color,
      }));
  }, [atlas, focusKey]);

  if (!connections.length) return null;

  return (
    <>
      {connections.map((c, i) => (
        <Line
          key={i}
          points={[c.from, c.to]}
          color={c.color}
          lineWidth={1.1}
          transparent
          opacity={0.32}
        />
      ))}
    </>
  );
}

// ── Expanding pulse ring on selected node ────────────────────────────────────
function PulseRing({ color, r }: { color: string; r: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const t = useRef(Math.random()); // stagger multiple rings
  useFrame((_, delta) => {
    t.current = (t.current + delta * 0.75) % 1;
    if (ref.current) {
      const s = 1.3 + t.current * 3;
      ref.current.scale.setScalar(s);
      (ref.current.material as THREE.MeshBasicMaterial).opacity =
        0.5 * (1 - t.current);
    }
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[r * 1.15, 0.045, 6, 36]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// ── Individual molecular target node ─────────────────────────────────────────
function TargetNode({
  target,
  active,
  dimmed,
  selected,
  showLabel,
  onSelect,
  onHover,
}: {
  target: AtlasTarget;
  active: boolean;
  dimmed: boolean;
  selected: boolean;
  showLabel: boolean;
  onSelect: (k: string) => void;
  onHover: (k: string | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const phase = useRef(Math.random() * Math.PI * 2);
  const r = radiusFor(target.drugs.length);
  const color = COMPARTMENTS[target.compartment].color;

  useFrame((_, delta) => {
    phase.current += delta * (active ? 2.4 : 1.5);
    if (meshRef.current) {
      const s = 1 + Math.sin(phase.current) * (active ? 0.13 : 0.04);
      meshRef.current.scale.setScalar(s);
    }
  });

  const opacity = dimmed ? 0.11 : 1;

  return (
    <group position={target.position}>
      {/* Core icosahedron */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSelect(target.key); }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(target.key);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => { onHover(null); document.body.style.cursor = "auto"; }}
      >
        <icosahedronGeometry args={[r, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 3.2 : 1.3}
          roughness={0.28}
          metalness={0.18}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Inner halo — always present */}
      <mesh scale={active ? 2.3 : 1.65}>
        <sphereGeometry args={[r, 10, 10]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={(active ? 0.28 : 0.09) * opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Wide corona when active */}
      {active && (
        <mesh scale={4}>
          <sphereGeometry args={[r, 8, 8]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.055}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Selection ring + animated pulse */}
      {selected && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r * 1.9, 0.065, 8, 48]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.88} />
          </mesh>
          <PulseRing color={color} r={r} />
        </>
      )}

      {/* Label — always-on for large nodes, hover-on for others */}
      {(showLabel || active) && (
        <Html
          center
          distanceFactor={28}
          position={[0, r + 1.05, 0]}
          occlude={false}
        >
          <div
            className={`pointer-events-none flex select-none items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-center backdrop-blur-sm transition-all ${
              active
                ? "scale-110 bg-white/95 text-violet-950 ring-1 ring-white/70 shadow-lg"
                : "bg-black/55 text-violet-50 ring-1 ring-white/15"
            }`}
            style={{ opacity }}
          >
            <span className="text-[10px] font-semibold leading-tight">
              {target.label}
            </span>
            <span
              className={`rounded-full px-1 text-[8px] font-bold ${
                active
                  ? "bg-violet-950/15 text-violet-900"
                  : "bg-white/15 text-violet-100"
              }`}
            >
              {target.drugs.length}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

// ── Compartment atmospheric layer ─────────────────────────────────────────────
function CompartmentLayer({
  comp,
  visible,
}: {
  comp: Compartment;
  visible: boolean;
}) {
  const meta = COMPARTMENTS[comp];
  if (!visible) return null;
  const isShell = comp === "systemic";
  const color = meta.color;

  return (
    <group position={[0, meta.y, 0]}>
      {isShell ? (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[meta.radius, 0.09, 8, 90]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
      ) : (
        <>
          {/* Translucent disc */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry
              args={[meta.radius + 1.5, meta.radius + 1.5, 0.03, 60]}
            />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.04}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          {/* Glowing boundary ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[meta.radius, 0.045, 6, 72]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.2}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </>
      )}

      <Html
        center
        distanceFactor={34}
        position={[-(meta.radius + (isShell ? 0 : 1.5)), isShell ? 5 : 0.5, 0]}
      >
        <div
          className="pointer-events-none select-none whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest backdrop-blur-sm ring-1"
          style={{
            color,
            backgroundColor: `${color}1a`,
            borderColor: `${color}55`,
          }}
        >
          {meta.label}
        </div>
      </Html>
    </group>
  );
}

// ── Full 3D scene ─────────────────────────────────────────────────────────────
function Scene({
  atlas,
  selectedKey,
  hoveredKey,
  hidden,
  matchSet,
  onSelect,
  onHover,
}: {
  atlas: Atlas;
  selectedKey: string | null;
  hoveredKey: string | null;
  hidden: Set<Compartment>;
  matchSet: Set<string> | null;
  onSelect: (k: string) => void;
  onHover: (k: string | null) => void;
}) {
  const focusKey = selectedKey ?? hoveredKey;

  const usedCompartments = useMemo(() => {
    const s = new Set<Compartment>();
    atlas.targets.forEach((t) => s.add(t.compartment));
    return [...s];
  }, [atlas]);

  return (
    <>
      {/* Atmospheric depth fog — makes distant structures fade naturally */}
      <fog attach="fog" color="#06030d" near={60} far={130} />

      {/* Ambient + themed point lights simulate bioluminescent organelles */}
      <ambientLight intensity={0.45} />
      {/* Nucleus light — warm magenta glow rising from below */}
      <pointLight position={[0, -8, 0]} intensity={2.4} color="#e0489b" distance={26} decay={1.8} />
      {/* Membrane light — cyan from above/outside */}
      <pointLight position={[0, 8, 0]} intensity={0.85} color="#4fd0e3" distance={32} decay={1.5} />
      {/* Cytoplasm fill lights — violet and green to give depth */}
      <pointLight position={[11, 2, 11]} intensity={0.55} color="#a98bff" distance={28} decay={1.6} />
      <pointLight position={[-11, 0, -9]} intensity={0.45} color="#5fd49b" distance={22} decay={1.6} />

      {/* Immersive cell environment layers */}
      <CellMembrane />
      <NucleusGlow />
      <MitochondriaGlow />
      <CytoplasmParticles />

      {/* Pathway connection lines (shown when a target is focused) */}
      <PathwayConnections atlas={atlas} focusKey={focusKey} />

      {/* Compartment boundary discs */}
      {usedCompartments.map((c) => (
        <CompartmentLayer key={c} comp={c} visible={!hidden.has(c)} />
      ))}

      {/* Molecular target nodes */}
      {atlas.targets.map((t) => {
        if (hidden.has(t.compartment)) return null;
        let active = false;
        let dimmed = false;
        if (matchSet) {
          active = matchSet.has(t.key);
          dimmed = !active;
        } else if (focusKey) {
          active = focusKey === t.key;
          dimmed = !active;
        }
        return (
          <TargetNode
            key={t.key}
            target={t}
            active={active}
            dimmed={dimmed}
            selected={selectedKey === t.key}
            showLabel={t.drugs.length >= 10}
            onSelect={onSelect}
            onHover={onHover}
          />
        );
      })}

      {/* Camera controls — min distance 2 lets you zoom right up to any node */}
      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        enableDamping
        dampingFactor={0.07}
        minDistance={2}
        maxDistance={75}
        target={[0, 1, 0]}
      />
    </>
  );
}

const CONF_LABEL: Record<string, string> = {
  high: "curated target",
  class: "class-inferred",
  low: "approximate",
};

export default function MoaAtlas3D({
  atlas,
  searchQuery,
  onSearchChange,
}: {
  atlas: Atlas;
  /** Controlled search query — syncs with the page-level search */
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}) {
  const [webglOk] = useState(detectWebGL);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [internalQuery, setInternalQuery] = useState("");
  const [hidden, setHidden] = useState<Set<Compartment>>(new Set());

  // Use controlled query if provided, otherwise fall back to internal state.
  const query = searchQuery !== undefined ? searchQuery : internalQuery;

  function handleQueryChange(val: string) {
    setInternalQuery(val);
    onSearchChange?.(val);
  }

  useEffect(() => {
    return () => { document.body.style.cursor = "auto"; };
  }, []);

  const q = query.trim().toLowerCase();

  const matchSet = useMemo(() => {
    if (!q) return null;
    const s = new Set<string>();
    for (const t of atlas.targets) {
      for (const d of t.drugs) {
        if (
          d.brand.toLowerCase().includes(q) ||
          d.generic.toLowerCase().includes(q) ||
          d.agent.includes(q)
        ) {
          s.add(t.key);
          break;
        }
      }
    }
    return s;
  }, [q, atlas]);

  const matchedDrugs = useMemo(() => {
    if (!q) return [];
    const out: {
      brand: string;
      generic: string;
      targetKey: string;
      targetLabel: string;
    }[] = [];
    for (const t of atlas.targets)
      for (const d of t.drugs)
        if (
          d.brand.toLowerCase().includes(q) ||
          d.generic.toLowerCase().includes(q) ||
          d.agent.includes(q)
        )
          out.push({
            brand: d.brand,
            generic: d.generic,
            targetKey: t.key,
            targetLabel: t.label,
          });
    return out.slice(0, 60);
  }, [q, atlas]);

  const selected = selectedKey
    ? (atlas.targetByKey.get(selectedKey) ?? null)
    : null;

  const usedCompartments = useMemo(() => {
    const counts = new Map<Compartment, number>();
    atlas.targets.forEach((t) =>
      counts.set(t.compartment, (counts.get(t.compartment) ?? 0) + t.drugs.length),
    );
    const order: Compartment[] = [
      "membrane",
      "cytoplasm",
      "mitochondria",
      "nucleus",
      "systemic",
      "extracellular",
    ];
    return order
      .filter((c) => counts.has(c))
      .map((c) => ({ comp: c, count: counts.get(c)! }));
  }, [atlas]);

  function toggleCompartment(c: Compartment) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }

  if (!webglOk) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/20 text-center text-sm text-muted-foreground">
        <Boxes className="h-7 w-7 opacity-30" />
        <p className="max-w-md">
          The interactive 3D molecular atlas needs WebGL. Open this page in a
          full browser tab to explore it. The searchable drug table below works
          everywhere.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-[720px] w-full overflow-hidden rounded-lg border border-white/10 bg-[#06030d]">
      {/* Camera starts at z=22 inside the cytoplasm zone — nucleus visible below, membrane surrounding */}
      <Canvas
        camera={{ position: [0, 1, 22], fov: 70, near: 0.1, far: 300 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, failIfMajorPerformanceCaveat: false }}
        onPointerMissed={() => setSelectedKey(null)}
      >
        <Scene
          atlas={atlas}
          selectedKey={selectedKey}
          hoveredKey={hoveredKey}
          hidden={hidden}
          matchSet={matchSet}
          onSelect={(k) => setSelectedKey((cur) => (cur === k ? null : k))}
          onHover={setHoveredKey}
        />
      </Canvas>

      {/* Title */}
      <div className="pointer-events-none absolute left-4 top-4 max-w-[55%]">
        <h4 className="text-sm font-bold text-white drop-shadow">
          Molecular MOA Atlas
        </h4>
        <p className="mt-0.5 text-[11px] leading-snug text-violet-200/80">
          {atlas.classifiedAgents} agents · {atlas.targets.length} targets ·{" "}
          <span className="text-emerald-300/80">you are inside the cell</span>{" "}
          · drag to explore, scroll to zoom, click a target
        </p>
      </div>

      {/* Search overlay */}
      <div className="absolute right-3 top-3 w-[230px] max-w-[calc(100%-2rem)]">
        <div className="flex items-center gap-2 rounded-md bg-black/55 px-2.5 py-1.5 ring-1 ring-white/15 backdrop-blur-md">
          <Search className="h-3.5 w-3.5 shrink-0 text-violet-300" />
          <input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search a drug…"
            className="w-full bg-transparent text-[12px] text-violet-50 placeholder:text-violet-300/60 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => handleQueryChange("")}
              className="text-violet-300 hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {q && (
          <div className="mt-1.5 max-h-56 overflow-y-auto rounded-md bg-black/65 p-1 ring-1 ring-white/15 backdrop-blur-md">
            {matchedDrugs.length === 0 ? (
              <p className="px-2 py-1.5 text-[11px] text-violet-300/80">
                No agent matches "{query}".
              </p>
            ) : (
              matchedDrugs.map((d, i) => (
                <button
                  key={`${d.brand}-${d.targetKey}-${i}`}
                  onClick={() => setSelectedKey(d.targetKey)}
                  className="flex w-full items-center justify-between gap-2 rounded px-2 py-1 text-left transition-colors hover:bg-white/10"
                >
                  <span className="truncate text-[11px] text-violet-50">
                    {d.brand}
                    {d.generic.toLowerCase() !== d.brand.toLowerCase() && (
                      <span className="text-violet-300/70">
                        {" "}
                        · {d.generic}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 rounded-full bg-violet-500/25 px-1.5 text-[9px] font-semibold text-violet-100">
                    {d.targetLabel}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Compartment legend / filter */}
      <div className="absolute bottom-4 right-3 flex flex-col gap-1 rounded-xl bg-black/55 p-2 ring-1 ring-white/15 backdrop-blur-md">
        <p className="px-1 text-[8px] font-semibold uppercase tracking-widest text-violet-300/80">
          Compartments
        </p>
        {usedCompartments.map(({ comp, count }) => {
          const meta = COMPARTMENTS[comp];
          const off = hidden.has(comp);
          return (
            <button
              key={comp}
              onClick={() => toggleCompartment(comp)}
              className={`flex items-center gap-1.5 rounded px-1.5 py-0.5 text-left text-[10px] transition-colors hover:bg-white/10 ${
                off ? "opacity-40" : ""
              }`}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: meta.color }}
              />
              <span className="text-violet-50">
                {meta.label.split(" · ")[0]}
              </span>
              <span className="ml-auto pl-1 text-violet-300/70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Target detail panel */}
      {selected && (
        <div className="absolute bottom-4 left-4 w-[300px] max-w-[calc(100%-2rem)] rounded-xl bg-black/70 p-3.5 text-violet-50 shadow-2xl ring-1 ring-white/15 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            onClick={() => setSelectedKey(null)}
            className="absolute right-2.5 top-2.5 text-violet-300 transition-colors hover:text-white"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <span
            className="inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white"
            style={{
              backgroundColor: COMPARTMENTS[selected.compartment].color,
            }}
          >
            {COMPARTMENTS[selected.compartment].label.split(" · ")[0]}
          </span>
          <h5 className="mt-1.5 pr-5 text-base font-bold leading-tight">
            {selected.label}
          </h5>
          <p className="text-[10px] font-medium uppercase tracking-wide text-violet-300/90">
            {selected.moaClass} · {selected.pathway}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-violet-200/85">
            {selected.description}
          </p>
          <div className="mt-2.5 border-t border-white/10 pt-2">
            <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-violet-300/80">
              <Pill className="h-3 w-3" />
              {selected.drugs.length} agent
              {selected.drugs.length === 1 ? "" : "s"} acting here
            </p>
            <div className="max-h-44 space-y-0.5 overflow-y-auto pr-1">
              {selected.drugs.map((d, i) => (
                <div
                  key={`${d.brand}-${i}`}
                  className="flex items-center justify-between gap-2 rounded px-1.5 py-0.5 text-[11px] odd:bg-white/[0.03]"
                >
                  <span className="truncate">
                    <span className="font-medium text-violet-50">
                      {d.brand}
                    </span>
                    {d.generic.toLowerCase() !== d.brand.toLowerCase() && (
                      <span className="text-violet-300/70">
                        {" "}
                        · {d.generic}
                      </span>
                    )}
                  </span>
                  <span
                    className={`shrink-0 text-[8px] uppercase tracking-wide ${
                      d.confidence === "high"
                        ? "text-emerald-300/80"
                        : d.confidence === "class"
                          ? "text-amber-300/80"
                          : "text-rose-300/80"
                    }`}
                    title={CONF_LABEL[d.confidence]}
                  >
                    {d.confidence === "high"
                      ? "✓"
                      : d.confidence === "class"
                        ? "≈"
                        : "?"}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setSelectedKey(null)}
            className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-violet-300 hover:text-white"
          >
            <RotateCcw className="h-3 w-3" /> Clear selection
          </button>
        </div>
      )}
    </div>
  );
}
