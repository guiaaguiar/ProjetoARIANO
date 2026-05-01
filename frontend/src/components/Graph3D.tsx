import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

interface Graph3DProps {
  size?: number;
  bgHex?: string;
  lineHex?: string;
  nodeHex?: string;
  nodeCount?: number;
  /** Max distance (in world units) for two nodes to be connected */
  connectionRadius?: number;
}

interface NodeData {
  base: THREE.Vector3;
  current: THREE.Vector3;
  target: THREE.Vector3;
  phase: THREE.Vector3;
  speed: THREE.Vector3;
  amp: number;
  // smooth scale + emissive intensity
  scale: number;
  glow: number;
}

/** Build a soft radial sprite texture for the glow */
function makeGlowTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(255,255,255,0.55)");
  grad.addColorStop(0.55, "rgba(255,255,255,0.18)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

function GraphScene({
  lineHex,
  nodeHex,
  nodeCount,
  connectionRadius,
}: {
  lineHex: string;
  nodeHex: string;
  nodeCount: number;
  connectionRadius: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const nodesRef = useRef<THREE.InstancedMesh>(null);
  const glowSpritesRef = useRef<THREE.Sprite[]>([]);
  const pulseRef = useRef<THREE.Points>(null);
  const { gl, camera } = useThree();

  // Interaction state
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const draggingNodeRef = useRef<number | null>(null);
  const draggingGroupRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const dragPlaneRef = useRef(new THREE.Plane());
  const raycasterRef = useRef(new THREE.Raycaster());
  const ndcRef = useRef(new THREE.Vector2());
  const intersectionRef = useRef(new THREE.Vector3());

  // Smooth target rotation for group-drag (eased)
  const targetRotRef = useRef({ x: 0, y: 0 });

  const glowTexture = useMemo(() => makeGlowTexture(), []);

  // Generate nodes — small count, well-spaced on a sphere (slightly squashed vertically)
  const nodes = useMemo<NodeData[]>(() => {
    const arr: NodeData[] = [];
    const radius = 1.25;
    const ySquash = 0.7; // keep nodes from going too high/low
    for (let i = 0; i < nodeCount; i++) {
      const k = i + 0.5;
      const phi = Math.acos(1 - (2 * k) / nodeCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * k;
      const r = radius * (0.85 + Math.random() * 0.2);
      const x = Math.cos(theta) * Math.sin(phi) * r;
      const y = Math.sin(theta) * Math.sin(phi) * r * ySquash;
      const z = Math.cos(phi) * r;
      const base = new THREE.Vector3(x, y, z);
      arr.push({
        base,
        current: base.clone(),
        target: base.clone(),
        phase: new THREE.Vector3(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        ),
        speed: new THREE.Vector3(
          0.18 + Math.random() * 0.18,
          0.18 + Math.random() * 0.18,
          0.18 + Math.random() * 0.18
        ),
        amp: 0.04 + Math.random() * 0.05,
        scale: 1,
        glow: 1,
      });
    }
    return arr;
  }, [nodeCount]);

  const pairs = useMemo(() => {
    const result: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = nodes[i].base.distanceTo(nodes[j].base);
        if (d < connectionRadius) result.push([i, j]);
      }
    }
    return result;
  }, [nodes, connectionRadius]);

  const lineGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(pairs.length * 2 * 3);
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geom;
  }, [pairs]);

  const pulses = useMemo(
    () =>
      Array.from({ length: Math.min(8, pairs.length) }, () => ({
        edge: Math.floor(Math.random() * Math.max(1, pairs.length)),
        t: Math.random(),
        speed: 0.12 + Math.random() * 0.14,
      })),
    [pairs]
  );

  const pulseGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(pulses.length * 3), 3)
    );
    return geom;
  }, [pulses]);

  const tempObj = useMemo(() => new THREE.Object3D(), []);
  const tmpA = useMemo(() => new THREE.Vector3(), []);
  const tmpB = useMemo(() => new THREE.Vector3(), []);
  const tmpColor = useMemo(() => new THREE.Color(), []);
  const baseColor = useMemo(() => new THREE.Color(nodeHex), [nodeHex]);
  const accentColor = useMemo(
    () => new THREE.Color(nodeHex).lerp(new THREE.Color("#ffffff"), 0.55),
    [nodeHex]
  );

  // Init instance colors
  useEffect(() => {
    if (nodesRef.current) {
      for (let i = 0; i < nodes.length; i++) {
        nodesRef.current.setColorAt(i, baseColor);
      }
      if (nodesRef.current.instanceColor)
        nodesRef.current.instanceColor.needsUpdate = true;
    }
  }, [nodes.length, baseColor]);

  // Global pointer up to release drag
  useEffect(() => {
    const up = () => {
      draggingNodeRef.current = null;
      draggingGroupRef.current = false;
      lastPointerRef.current = null;
      gl.domElement.style.cursor = "grab";
    };
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [gl]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const isDraggingNode = draggingNodeRef.current !== null;
    const isDraggingGroup = draggingGroupRef.current;
    // Frame-rate-independent smoothing factor
    const smooth = 1 - Math.pow(0.001, delta); // ~very smooth lerp

    // Smooth, eased rotation
    if (groupRef.current) {
      if (!isDraggingNode && !isDraggingGroup) {
        // Gentle idle rotation target
        targetRotRef.current.y += delta * 0.06;
        targetRotRef.current.x = Math.sin(t * 0.12) * 0.1;
      }
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotRef.current.y,
        smooth
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotRef.current.x,
        smooth
      );
    }

    // Update node target/current positions with smoothing
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (i === draggingNodeRef.current) {
        // Dragged node snaps to target (set in pointer move)
        n.current.lerp(n.target, smooth);
      } else if (isDraggingNode || isDraggingGroup) {
        // Hold near base, gently
        n.target.copy(n.base);
        n.current.lerp(n.target, smooth * 0.6);
      } else {
        // Idle drift around base
        n.target.set(
          n.base.x + Math.sin(t * n.speed.x + n.phase.x) * n.amp,
          n.base.y + Math.sin(t * n.speed.y + n.phase.y) * n.amp,
          n.base.z + Math.sin(t * n.speed.z + n.phase.z) * n.amp
        );
        n.current.lerp(n.target, smooth);
      }
    }

    // Update instanced node meshes (smooth scale + color)
    if (nodesRef.current) {
      for (let i = 0; i < nodes.length; i++) {
        const isSel = selectedNode === i;
        const isHov = hoveredNode === i;
        const targetScale = isSel ? 1.3 : isHov ? 1.15 : 1;
        nodes[i].scale = THREE.MathUtils.lerp(
          nodes[i].scale,
          targetScale,
          smooth * 0.6
        );

        tempObj.position.copy(nodes[i].current);
        tempObj.scale.setScalar(nodes[i].scale);
        tempObj.updateMatrix();
        nodesRef.current.setMatrixAt(i, tempObj.matrix);

        // Subtle: keep node color, just slightly brighter on hover/select
        if (isSel) {
          tmpColor.copy(baseColor).multiplyScalar(1.25);
        } else if (isHov) {
          tmpColor.copy(baseColor).multiplyScalar(1.12);
        } else {
          tmpColor.copy(baseColor);
        }
        nodesRef.current.setColorAt(i, tmpColor);
      }
      nodesRef.current.instanceMatrix.needsUpdate = true;
      if (nodesRef.current.instanceColor)
        nodesRef.current.instanceColor.needsUpdate = true;
    }

    // Update glow sprites (always face camera — true billboards)
    for (let i = 0; i < nodes.length; i++) {
      const sprite = glowSpritesRef.current[i];
      if (!sprite) continue;
      const isSel = selectedNode === i;
      const isHov = hoveredNode === i;
      const breathe = 1 + Math.sin(t * 1.4 + nodes[i].phase.x) * 0.06;
      // Subtle scale change for selected — keep it close to base
      const targetGlow = (isSel ? 1.45 : isHov ? 1.2 : 1.0) * breathe;
      nodes[i].glow = THREE.MathUtils.lerp(
        nodes[i].glow,
        targetGlow,
        smooth * 0.5
      );
      sprite.position.copy(nodes[i].current);
      const s = nodes[i].glow * 0.55;
      sprite.scale.set(s, s, s);
      // Subtle opacity bump on selected/hover — color stays node color
      const mat = sprite.material as THREE.SpriteMaterial;
      const targetOpacity = isSel ? 1.0 : isHov ? 0.85 : 0.65;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, smooth * 0.5);
      mat.color.copy(baseColor);
    }

    // Update line geometry
    if (linesRef.current) {
      const posAttr = linesRef.current.geometry.getAttribute(
        "position"
      ) as THREE.BufferAttribute;
      for (let i = 0; i < pairs.length; i++) {
        const [a, b] = pairs[i];
        posAttr.setXYZ(
          i * 2,
          nodes[a].current.x,
          nodes[a].current.y,
          nodes[a].current.z
        );
        posAttr.setXYZ(
          i * 2 + 1,
          nodes[b].current.x,
          nodes[b].current.y,
          nodes[b].current.z
        );
      }
      posAttr.needsUpdate = true;
    }

    // Update pulses (smoother, slower)
    if (pulseRef.current && pairs.length > 0) {
      const posAttr = pulseRef.current.geometry.getAttribute(
        "position"
      ) as THREE.BufferAttribute;
      for (let i = 0; i < pulses.length; i++) {
        const p = pulses[i];
        if (!isDraggingNode && !isDraggingGroup) p.t += delta * p.speed;
        if (p.t >= 1) {
          p.t = 0;
          p.edge = Math.floor(Math.random() * pairs.length);
          p.speed = 0.12 + Math.random() * 0.14;
        }
        const [a, b] = pairs[p.edge];
        tmpA.copy(nodes[a].current);
        tmpB.copy(nodes[b].current);
        // ease in-out for the travel
        const eased = p.t * p.t * (3 - 2 * p.t);
        tmpA.lerp(tmpB, eased);
        posAttr.setXYZ(i, tmpA.x, tmpA.y, tmpA.z);
      }
      posAttr.needsUpdate = true;
    }
  });

  // Drag a single node along a plane facing the camera, in local group space
  const handleNodePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const id = e.instanceId;
    if (id === undefined) return;
    (e.target as Element)?.setPointerCapture?.(e.pointerId);
    draggingNodeRef.current = id;
    setSelectedNode(id);
    gl.domElement.style.cursor = "grabbing";

    if (groupRef.current) {
      const worldPos = nodes[id].current.clone();
      groupRef.current.localToWorld(worldPos);
      const normal = new THREE.Vector3();
      camera.getWorldDirection(normal);
      dragPlaneRef.current.setFromNormalAndCoplanarPoint(
        normal.negate(),
        worldPos
      );
    }
  };

  const handleNodePointerOver = (e: ThreeEvent<PointerEvent>) => {
    const id = e.instanceId;
    if (id === undefined) return;
    setHoveredNode(id);
    if (draggingNodeRef.current === null) gl.domElement.style.cursor = "pointer";
  };

  const handleNodePointerOut = () => {
    setHoveredNode(null);
    if (draggingNodeRef.current === null && !draggingGroupRef.current) {
      gl.domElement.style.cursor = "grab";
    }
  };

  // Background pointer down — rotate whole group
  const handleBgPointerDown = (e: ThreeEvent<PointerEvent>) => {
    draggingGroupRef.current = true;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    setSelectedNode(null);
    gl.domElement.style.cursor = "grabbing";
    if (groupRef.current) {
      targetRotRef.current.x = groupRef.current.rotation.x;
      targetRotRef.current.y = groupRef.current.rotation.y;
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (draggingNodeRef.current !== null && groupRef.current) {
      const id = draggingNodeRef.current;
      const rect = gl.domElement.getBoundingClientRect();
      ndcRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndcRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(ndcRef.current, camera);
      if (
        raycasterRef.current.ray.intersectPlane(
          dragPlaneRef.current,
          intersectionRef.current
        )
      ) {
        const local = intersectionRef.current.clone();
        groupRef.current.worldToLocal(local);
        if (local.length() > 2.0) local.setLength(2.0);
        // Set as smooth target — current will lerp toward it
        nodes[id].target.copy(local);
        nodes[id].base.copy(local);
      }
      return;
    }

    if (draggingGroupRef.current && groupRef.current && lastPointerRef.current) {
      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;
      // Lower sensitivity, smoother
      targetRotRef.current.y += dx * 0.0035;
      targetRotRef.current.x += dy * 0.0035;
      targetRotRef.current.x = THREE.MathUtils.clamp(
        targetRotRef.current.x,
        -1.0,
        1.0
      );
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  return (
    <>
      {/* Invisible interaction surface to catch background drags */}
      <mesh
        onPointerDown={handleBgPointerDown}
        onPointerMove={handlePointerMove}
        position={[0, 0, 0]}
      >
        <sphereGeometry args={[3.2, 16, 16]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      <group ref={groupRef}>
        {/* Glow halos — true sprites (always face camera, never look like rings) */}
        {nodes.map((_, i) => (
          <sprite
            key={`glow-${i}`}
            ref={(el) => {
              if (el) glowSpritesRef.current[i] = el;
            }}
          >
            <spriteMaterial
              map={glowTexture}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              opacity={0.65}
              toneMapped={false}
            />
          </sprite>
        ))}

        {/* Connection lines */}
        <lineSegments ref={linesRef} geometry={lineGeometry}>
          <lineBasicMaterial
            color={lineHex}
            transparent
            opacity={0.55}
            depthWrite={false}
          />
        </lineSegments>

        {/* Nodes — solid spheres, instanced */}
        <instancedMesh
          ref={nodesRef}
          args={[undefined, undefined, nodes.length]}
          onPointerDown={handleNodePointerDown}
          onPointerMove={handlePointerMove}
          onPointerOver={handleNodePointerOver}
          onPointerOut={handleNodePointerOut}
        >
          <sphereGeometry args={[0.085, 24, 24]} />
          <meshBasicMaterial color={nodeHex} toneMapped={false} />
        </instancedMesh>

        {/* Traveling pulses */}
        <points ref={pulseRef} geometry={pulseGeometry}>
          <pointsMaterial
            color={nodeHex}
            size={0.11}
            sizeAttenuation
            transparent
            opacity={0.95}
            depthWrite={false}
            toneMapped={false}
            map={glowTexture}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
    </>
  );
}

export function Graph3D({
  size = 600,
  lineHex = "#1aa0b8",
  nodeHex,
  nodeCount = 7,
  connectionRadius = 2.4,
}: Graph3DProps) {
  return (
    <div
      style={{ width: size, height: size, cursor: "grab", touchAction: "none", position: 'relative' }}
    >
      <div style={{ position: 'absolute', top: -500, left: -500, right: -500, bottom: -500 }}>
        <Canvas
          camera={{ position: [0, 0, 5.2], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <GraphScene
            lineHex={lineHex}
            nodeHex={nodeHex ?? lineHex}
            nodeCount={nodeCount}
            connectionRadius={connectionRadius}
          />
        </Canvas>
      </div>
    </div>
  );
}

export default Graph3D;
