import { COS, SIN, ZUNIT } from "./constants";

export const FWD = { x: -COS, y: SIN };
export const VSIDE = { x: COS, y: SIN };
export const VUP = { x: 0, y: -ZUNIT };

export const vproj = (u: number, v: number, w: number): [number, number] => [
  u * FWD.x + v * VSIDE.x + w * VUP.x,
  u * FWD.y + v * VSIDE.y + w * VUP.y,
];

export const poly = (corners: Array<[number, number]>) =>
  `M${corners.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join("L")}Z`;

export type Box = {
  u: [number, number];
  v: [number, number];
  w: [number, number];
};

export function boxFaces({ u: [u0, u1], v: [v0, v1], w: [w0, w1] }: Box) {
  return {
    side: poly([
      vproj(u0, v1, w0),
      vproj(u1, v1, w0),
      vproj(u1, v1, w1),
      vproj(u0, v1, w1),
    ]),
    front: poly([
      vproj(u1, v0, w0),
      vproj(u1, v1, w0),
      vproj(u1, v1, w1),
      vproj(u1, v0, w1),
    ]),
    top: poly([
      vproj(u0, v0, w1),
      vproj(u1, v0, w1),
      vproj(u1, v1, w1),
      vproj(u0, v1, w1),
    ]),
  };
}

export type Prim = {
  d: string;
  fill: string;
  stroked: boolean;
  /** Overrides the default outline color and width. */
  stroke?: string;
  width?: number;
};

export const boxPrims = (
  b: Box,
  fills?: { side?: string; front?: string; top?: string },
): Prim[] => {
  const f = boxFaces(b);
  return [
    { d: f.side, fill: fills?.side || "var(--v-side)", stroked: true },
    { d: f.front, fill: fills?.front || "var(--v-front)", stroked: true },
    { d: f.top, fill: fills?.top || "var(--v-top)", stroked: true },
  ];
};

export const frontPoly = (
  u: number,
  v: [number, number],
  w: [number, number],
  fill: string,
): Prim => ({
  d: poly([
    vproj(u, v[0], w[0]),
    vproj(u, v[1], w[0]),
    vproj(u, v[1], w[1]),
    vproj(u, v[0], w[1]),
  ]),
  fill,
  stroked: false,
});

export const sidePoly = (
  v: number,
  u: [number, number],
  w: [number, number],
  fill: string,
): Prim => ({
  d: poly([
    vproj(u[0], v, w[0]),
    vproj(u[1], v, w[0]),
    vproj(u[1], v, w[1]),
    vproj(u[0], v, w[1]),
  ]),
  fill,
  stroked: false,
});

export const topPoly = (
  w: number,
  u: [number, number],
  v: [number, number],
  fill: string,
): Prim => ({
  d: poly([
    vproj(u[0], v[0], w),
    vproj(u[1], v[0], w),
    vproj(u[1], v[1], w),
    vproj(u[0], v[1], w),
  ]),
  fill,
  stroked: false,
});

export const wheelPrims = (
  u: [number, number],
  v: [number, number],
  w: [number, number],
): Prim[] => {
  return boxPrims(
    { u, v, w },
    {
      side: "var(--v-wheel-side)",
      front: "var(--v-wheel-front)",
      top: "var(--v-wheel-top)",
    },
  );
};

export function buildDetailedCar(): Prim[] {
  const vOffset = 0.05;
  const off = (arr: [number, number]): [number, number] => [
    arr[0] + vOffset,
    arr[1] + vOffset,
  ];

  const bodyBase: Box = {
    u: [-0.48, 0.48],
    v: off([-0.24, 0.24]),
    w: [0.06, 0.18],
  };
  const cabin: Box = { u: [-0.22, 0.12], v: off([-0.2, 0.2]), w: [0.18, 0.32] };
  const frontBumper: Box = {
    u: [0.48, 0.52],
    v: off([-0.22, 0.22]),
    w: [0.05, 0.12],
  };
  const rearBumper: Box = {
    u: [-0.52, -0.48],
    v: off([-0.22, 0.22]),
    w: [0.05, 0.12],
  };

  const spoilerL: Box = {
    u: [-0.44, -0.4],
    v: off([-0.18, -0.14]),
    w: [0.18, 0.24],
  };
  const spoilerR: Box = {
    u: [-0.44, -0.4],
    v: off([0.14, 0.18]),
    w: [0.18, 0.24],
  };
  const spoilerWing: Box = {
    u: [-0.46, -0.38],
    v: off([-0.22, 0.22]),
    w: [0.24, 0.26],
  };

  const wheelRL = wheelPrims([-0.32, -0.2], off([-0.26, -0.2]), [0, 0.11]);
  const wheelFL = wheelPrims([0.2, 0.32], off([-0.26, -0.2]), [0, 0.11]);
  const wheelRR = wheelPrims([-0.32, -0.2], off([0.2, 0.26]), [0, 0.11]);
  const wheelFR = wheelPrims([0.2, 0.32], off([0.2, 0.26]), [0, 0.11]);

  return [
    ...wheelRL,
    ...wheelFL,

    ...boxPrims(rearBumper, {
      side: "var(--v-bumper)",
      front: "var(--v-bumper)",
      top: "var(--v-bumper)",
    }),

    ...boxPrims(bodyBase),
    sidePoly(0.24 + vOffset, [-0.48, 0.48], [0.12, 0.14], "var(--v-bumper)"),

    frontPoly(0.48, off([0.12, 0.22]), [0.13, 0.17], "var(--v-light-front)"),
    frontPoly(0.48, off([-0.22, -0.12]), [0.13, 0.17], "var(--v-light-front)"),

    ...boxPrims(spoilerL, {
      side: "var(--v-bumper)",
      front: "var(--v-bumper)",
      top: "var(--v-bumper)",
    }),
    ...boxPrims(spoilerR, {
      side: "var(--v-bumper)",
      front: "var(--v-bumper)",
      top: "var(--v-bumper)",
    }),
    ...boxPrims(spoilerWing),

    ...boxPrims(frontBumper, {
      side: "var(--v-bumper)",
      front: "var(--v-bumper)",
      top: "var(--v-bumper)",
    }),

    frontPoly(0.52, off([-0.12, 0.12]), [0.06, 0.11], "var(--v-window)"),
    frontPoly(0.52, off([-0.06, 0.06]), [0.07, 0.1], "var(--v-wheel-side)"),

    ...boxPrims(cabin),

    frontPoly(0.12, off([-0.17, 0.17]), [0.21, 0.3], "var(--v-window)"),
    sidePoly(0.2 + vOffset, [-0.18, 0.08], [0.21, 0.3], "var(--v-window)"),
    topPoly(0.32, [-0.15, 0.05], off([-0.14, 0.14]), "var(--v-window)"),

    ...wheelRR,
    ...wheelFR,
  ];
}

type Vec3 = [number, number, number];
type Point2 = [number, number];

const pathOf = (points: Point2[], close: boolean) =>
  `M${points.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join("L")}${close ? "Z" : ""}`;

const project = (points: Vec3[]) => points.map((p) => vproj(...p));

/** Convex hull (monotone chain) of projected points, for clean silhouettes. */
function hull(points: Point2[]): Point2[] {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Point2, a: Point2, b: Point2) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const build = (input: Point2[]) => {
    const chain: Point2[] = [];
    for (const p of input) {
      while (
        chain.length >= 2 &&
        cross(chain[chain.length - 2], chain[chain.length - 1], p) <= 0
      ) {
        chain.pop();
      }
      chain.push(p);
    }
    return chain.slice(0, -1);
  };
  return [...build(sorted), ...build([...sorted].reverse())];
}

/** Blends two face colors by how much a surface faces up (0 to 1). */
const shade = (up: number, top: string, side: string) =>
  `color-mix(in oklab, ${top} ${Math.round(Math.min(Math.max(up, 0), 1) * 100)}%, ${side})`;

/** A curved-surface strip: stroked in its own color so strips show no seams. */
const facet = (points: Point2[], fill: string): Prim => ({
  d: pathOf(points, true),
  fill,
  stroked: true,
  stroke: fill,
  width: 0.35,
});

const outline = (points: Point2[]): Prim => ({
  d: pathOf(hull(points), true),
  fill: "none",
  stroked: true,
});

const line = (points: Vec3[], stroke: string, width: number): Prim => ({
  d: pathOf(project(points), false),
  fill: "none",
  stroked: true,
  stroke,
  width,
});

/**
 * A bar along u with rounded top edges. It can taper: half-width and top
 * height are given at the rear (u0) and the front (u1).
 */
function roundedBar({
  u: [u0, u1],
  v,
  half: [h0, h1],
  w0,
  top: [t0, t1],
  r,
  cap = "var(--v-front)",
}: {
  u: [number, number];
  v: number;
  half: [number, number];
  w0: number;
  top: [number, number];
  r: number;
  cap?: string;
}): Prim[] {
  const steps = 4;

  // Counter-clockwise in the (v, w) plane: up the near side, over the top,
  // down the far side.
  const profile = (h: number, t: number): Point2[] => {
    const rr = Math.min(r, h, t - w0);
    const pts: Point2[] = [[h, w0]];
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * (Math.PI / 2);
      pts.push([h - rr + rr * Math.cos(a), t - rr + rr * Math.sin(a)]);
    }
    for (let i = 0; i <= steps; i++) {
      const a = Math.PI / 2 + (i / steps) * (Math.PI / 2);
      pts.push([-h + rr + rr * Math.cos(a), t - rr + rr * Math.sin(a)]);
    }
    pts.push([-h, w0]);
    return pts;
  };

  const back = profile(h0, t0).map(([pv, pw]): Vec3 => [u0, v + pv, pw]);
  const front = profile(h1, t1).map(([pv, pw]): Vec3 => [u1, v + pv, pw]);
  const prims: Prim[] = [];

  for (let i = 0; i < front.length - 1; i++) {
    const dv = front[i + 1][1] - front[i][1];
    const dw = front[i + 1][2] - front[i][2];
    const len = Math.hypot(dv, dw) || 1;
    const nv = dw / len;
    const nw = -dv / len;
    // The viewer looks down (1, 1, 1), so a strip shows when nv + nw > 0.
    if (nv + nw <= 0.01) continue;
    prims.push(
      facet(
        project([back[i], back[i + 1], front[i + 1], front[i]]),
        shade(nw, "var(--v-top)", "var(--v-side)"),
      ),
    );
  }

  prims.push({ d: pathOf(project(front), true), fill: cap, stroked: true });
  prims.push(outline(project([...back, ...front])));
  return prims;
}

/** A tyre: a short cylinder on the v axis, with a rim and hub on its near face. */
function tyre(uc: number, radius: number, [v0, v1]: [number, number]): Prim[] {
  const steps = 24;
  const ring = (v: number, r: number): Vec3[] =>
    Array.from({ length: steps }, (_, i): Vec3 => {
      const a = (i / steps) * Math.PI * 2;
      return [uc + r * Math.cos(a), v, radius + r * Math.sin(a)];
    });

  const far = ring(v0, radius);
  const near = ring(v1, radius);
  const prims: Prim[] = [];

  for (let i = 0; i < steps; i++) {
    const j = (i + 1) % steps;
    const a = ((i + 0.5) / steps) * Math.PI * 2;
    if (Math.cos(a) + Math.sin(a) <= 0) continue;
    prims.push(
      facet(
        project([far[i], far[j], near[j], near[i]]),
        shade(Math.sin(a), "var(--v-wheel-top)", "var(--v-wheel-front)"),
      ),
    );
  }

  prims.push(outline(project([...far, ...near])));
  prims.push({
    d: pathOf(project(near), true),
    fill: "var(--v-wheel-side)",
    stroked: true,
  });
  prims.push({
    d: pathOf(project(ring(v1, radius * 0.6)), true),
    fill: "var(--v-wheel)",
    stroked: false,
  });
  prims.push({
    d: pathOf(project(ring(v1, radius * 0.2)), true),
    fill: "var(--v-stroke)",
    stroked: false,
  });
  return prims;
}

/** A flat ellipse lying in the (u, v) plane at height w. */
function disc(
  [uc, vc, w]: Vec3,
  [ru, rv]: [number, number],
  fill: string,
  stroked = false,
): Prim {
  const steps = 20;
  const pts = Array.from({ length: steps }, (_, i): Vec3 => {
    const a = (i / steps) * Math.PI * 2;
    return [uc + ru * Math.cos(a), vc + rv * Math.sin(a), w];
  });
  return { d: pathOf(project(pts), true), fill, stroked };
}

export function buildF1Car(): Prim[] {
  const c = 0.05;
  const dark = {
    side: "var(--v-bumper)",
    front: "var(--v-bumper)",
    top: "var(--v-bumper)",
  };
  const arm = "var(--v-wheel-side)";

  const plate = (
    u: [number, number],
    v: [number, number],
    w: [number, number],
  ) => boxPrims({ u, v: [c + v[0], c + v[1]], w }, dark);

  const wishbones = (side: 1 | -1): Prim[] => [
    line(
      [
        [0.32, c + side * 0.06, 0.11],
        [0.4, c + side * 0.2, 0.085],
        [0.46, c + side * 0.04, 0.1],
      ],
      arm,
      1.1,
    ),
    line(
      [
        [-0.29, c + side * 0.07, 0.1],
        [-0.37, c + side * 0.2, 0.095],
        [-0.44, c + side * 0.05, 0.1],
      ],
      arm,
      1.1,
    ),
  ];

  const sidepod = (side: 1 | -1) =>
    roundedBar({
      u: [-0.3, 0.06],
      v: c + side * 0.12,
      half: [0.035, 0.05],
      w0: 0.04,
      top: [0.095, 0.13],
      r: 0.035,
      cap: "var(--v-window)",
    });

  const rear: [number, number] = [0.18, 0.31];
  const front: [number, number] = [0.185, 0.29];

  return [
    // Far side first, so nearer parts paint over it.
    ...tyre(-0.37, 0.095, [c - rear[1], c - rear[0]]),
    ...tyre(0.4, 0.085, [c - front[1], c - front[0]]),
    ...wishbones(-1),

    // Rear wing: far endplate, pillar, flap, main plane.
    ...plate([-0.63, -0.49], [-0.25, -0.225], [0.1, 0.285]),
    ...plate([-0.555, -0.525], [-0.012, 0.012], [0.09, 0.21]),
    ...plate([-0.63, -0.57], [-0.225, 0.225], [0.25, 0.275]),
    ...boxPrims({
      u: [-0.6, -0.5],
      v: [c - 0.225, c + 0.225],
      w: [0.205, 0.24],
    }),

    // Gearbox, floor, far sidepod.
    ...plate([-0.5, -0.4], [-0.06, 0.06], [0.03, 0.1]),
    ...plate([-0.42, 0.3], [-0.17, 0.17], [0.02, 0.04]),
    ...sidepod(-1),

    // Engine cover with its fin and airbox.
    ...roundedBar({
      u: [-0.42, 0.06],
      v: c,
      half: [0.035, 0.075],
      w0: 0.04,
      top: [0.12, 0.2],
      r: 0.035,
    }),
    {
      d: pathOf(
        project([
          [-0.08, c, 0.175],
          [-0.42, c, 0.19],
          [-0.42, c, 0.12],
        ]),
        true,
      ),
      fill: "var(--v-side)",
      stroked: true,
    },
    ...sidepod(1),

    // Cockpit: tub, opening, helmet, halo.
    ...roundedBar({
      u: [0.04, 0.32],
      v: c,
      half: [0.075, 0.055],
      w0: 0.04,
      top: [0.155, 0.13],
      r: 0.035,
    }),
    disc([0.165, c, 0.146], [0.07, 0.04], "var(--v-window)"),
    disc([0.145, c, 0.175], [0.03, 0.03], "var(--v-light-front)", true),
    line(
      [
        [0.08, c - 0.055, 0.15],
        [0.1, c - 0.055, 0.2],
        [0.2, c - 0.03, 0.205],
        [0.245, c, 0.195],
        [0.2, c + 0.03, 0.205],
        [0.1, c + 0.055, 0.2],
        [0.08, c + 0.055, 0.15],
      ],
      arm,
      1.6,
    ),
    line(
      [
        [0.245, c, 0.195],
        [0.27, c, 0.135],
      ],
      arm,
      1.6,
    ),

    // Front wing under a tapered nose.
    ...plate([0.52, 0.65], [-0.3, -0.275], [0.02, 0.085]),
    ...plate([0.52, 0.64], [-0.275, 0.275], [0.02, 0.04]),
    ...plate([0.5, 0.56], [-0.26, 0.26], [0.04, 0.06]),
    ...roundedBar({
      u: [0.3, 0.6],
      v: c,
      half: [0.05, 0.022],
      w0: 0.05,
      top: [0.13, 0.08],
      r: 0.02,
    }),
    ...plate([0.52, 0.65], [0.275, 0.3], [0.02, 0.085]),
    ...plate([-0.63, -0.49], [0.225, 0.25], [0.1, 0.285]),

    ...wishbones(1),
    ...tyre(-0.37, 0.095, [c + rear[0], c + rear[1]]),
    ...tyre(0.4, 0.085, [c + front[0], c + front[1]]),
  ];
}

export function buildTruck(): Prim[] {
  const vOffset = 0.1;
  const off = (arr: [number, number]): [number, number] => [
    arr[0] + vOffset,
    arr[1] + vOffset,
  ];
  const dark = {
    side: "var(--v-bumper)",
    front: "var(--v-bumper)",
    top: "var(--v-bumper)",
  };
  const metal = {
    side: "var(--v-wheel-side)",
    front: "var(--v-wheel-front)",
    top: "var(--v-wheel-top)",
  };

  const bodyBase: Box = {
    u: [-0.52, 0.5],
    v: off([-0.22, 0.22]),
    w: [0.07, 0.2],
  };
  const cab: Box = {
    u: [-0.02, 0.26],
    v: off([-0.19, 0.19]),
    w: [0.2, 0.4],
  };
  const bedWallFar: Box = {
    u: [-0.5, -0.04],
    v: off([-0.22, -0.17]),
    w: [0.2, 0.3],
  };
  const bedWallNear: Box = {
    u: [-0.5, -0.04],
    v: off([0.17, 0.22]),
    w: [0.2, 0.3],
  };
  const tailgate: Box = {
    u: [-0.5, -0.45],
    v: off([-0.22, 0.22]),
    w: [0.2, 0.3],
  };
  const rollBar: Box = {
    u: [-0.09, -0.05],
    v: off([-0.17, 0.17]),
    w: [0.2, 0.34],
  };
  const frontBumper: Box = {
    u: [0.5, 0.55],
    v: off([-0.21, 0.21]),
    w: [0.06, 0.14],
  };
  const rearBumper: Box = {
    u: [-0.57, -0.52],
    v: off([-0.21, 0.21]),
    w: [0.06, 0.14],
  };
  const stepFar: Box = {
    u: [-0.16, 0.18],
    v: off([-0.245, -0.22]),
    w: [0.05, 0.07],
  };
  const stepNear: Box = {
    u: [-0.16, 0.18],
    v: off([0.22, 0.245]),
    w: [0.05, 0.07],
  };

  const wheelFrontFar = wheelPrims([0.24, 0.4], off([-0.26, -0.18]), [0, 0.13]);
  const wheelRearFar = wheelPrims(
    [-0.4, -0.24],
    off([-0.26, -0.18]),
    [0, 0.13],
  );
  const wheelFrontNear = wheelPrims([0.24, 0.4], off([0.18, 0.26]), [0, 0.13]);
  const wheelRearNear = wheelPrims([-0.4, -0.24], off([0.18, 0.26]), [0, 0.13]);

  const rimOuterV = 0.26 + vOffset;
  const rims = [
    sidePoly(rimOuterV, [0.275, 0.365], [0.03, 0.1], "var(--v-wheel)"),
    sidePoly(rimOuterV, [0.305, 0.335], [0.05, 0.08], "var(--v-stroke)"),
    sidePoly(rimOuterV, [-0.365, -0.275], [0.03, 0.1], "var(--v-wheel)"),
    sidePoly(rimOuterV, [-0.335, -0.305], [0.05, 0.08], "var(--v-stroke)"),
  ];

  return [
    ...wheelFrontFar,
    ...wheelRearFar,
    ...boxPrims(stepFar, dark),

    ...boxPrims(rearBumper, metal),
    ...boxPrims(bodyBase),

    ...boxPrims(bedWallFar),
    ...boxPrims(tailgate),
    topPoly(0.2, [-0.45, -0.04], off([-0.17, 0.17]), "var(--v-bumper)"),
    ...boxPrims(rollBar, metal),
    ...boxPrims(bedWallNear),

    sidePoly(0.22 + vOffset, [-0.52, 0.5], [0.14, 0.16], "var(--v-bumper)"),

    ...boxPrims(cab),
    frontPoly(0.26, off([-0.15, 0.15]), [0.24, 0.38], "var(--v-window)"),
    sidePoly(0.19 + vOffset, [0.0, 0.22], [0.24, 0.37], "var(--v-window)"),
    topPoly(0.4, [0.03, 0.21], off([-0.14, 0.14]), "var(--v-window)"),

    frontPoly(0.5, off([0.12, 0.2]), [0.14, 0.18], "var(--v-light-front)"),
    frontPoly(0.5, off([-0.2, -0.12]), [0.14, 0.18], "var(--v-light-front)"),
    frontPoly(0.5, off([-0.09, 0.09]), [0.13, 0.18], "var(--v-window)"),
    ...boxPrims(frontBumper, metal),
    ...boxPrims(stepNear, dark),

    ...wheelFrontNear,
    ...wheelRearNear,
    ...rims,
  ];
}

export function buildSupercar(): Prim[] {
  const vOffset = 0.05;
  const off = (arr: [number, number]): [number, number] => [
    arr[0] + vOffset,
    arr[1] + vOffset,
  ];
  const dark = {
    side: "var(--v-bumper)",
    front: "var(--v-bumper)",
    top: "var(--v-bumper)",
  };
  const metal = {
    side: "var(--v-wheel-side)",
    front: "var(--v-wheel-front)",
    top: "var(--v-wheel-top)",
  };

  // free-form quads on a single front (u), top (w) or side (v) plane,
  // for the angled Y-signature lights and sculpted creases
  const frontQuad = (
    u: number,
    pts: Array<[number, number]>, // [v, w]
    fill: string,
  ): Prim => ({
    d: poly(pts.map(([pv, pw]) => vproj(u, pv + vOffset, pw))),
    fill,
    stroked: false,
  });
  const topQuad = (
    w: number,
    pts: Array<[number, number]>, // [u, v]
    fill: string,
  ): Prim => ({
    d: poly(pts.map(([pu, pv]) => vproj(pu, pv + vOffset, w))),
    fill,
    stroked: false,
  });
  const sideQuad = (
    v: number,
    pts: Array<[number, number]>, // [u, w]
    fill: string,
  ): Prim => ({
    d: poly(pts.map(([pu, pw]) => vproj(pu, v, pw))),
    fill,
    stroked: false,
  });

  // low wedge profile: tall mid-body, lower nose, lowest splitter
  const bodyMid: Box = {
    u: [-0.42, 0.24],
    v: off([-0.22, 0.22]),
    w: [0.05, 0.16],
  };
  const noseLow: Box = {
    u: [0.24, 0.52],
    v: off([-0.2, 0.2]),
    w: [0.05, 0.12],
  };
  const splitter: Box = {
    u: [0.5, 0.56],
    v: off([-0.19, 0.19]),
    w: [0.03, 0.06],
  };
  // low raked cabin, pushed forward (mid-engine layout)
  const cabin: Box = {
    u: [-0.14, 0.16],
    v: off([-0.16, 0.16]),
    w: [0.16, 0.27],
  };
  // engine deck behind the cabin
  const engineDeck: Box = {
    u: [-0.4, -0.14],
    v: off([-0.15, 0.15]),
    w: [0.16, 0.19],
  };
  const rearWing: Box = {
    u: [-0.5, -0.42],
    v: off([-0.19, 0.19]),
    w: [0.21, 0.24],
  };
  const wingStrutFar: Box = {
    u: [-0.47, -0.44],
    v: off([-0.13, -0.09]),
    w: [0.16, 0.21],
  };
  const wingStrutNear: Box = {
    u: [-0.47, -0.44],
    v: off([0.09, 0.13]),
    w: [0.16, 0.21],
  };
  const diffuser: Box = {
    u: [-0.47, -0.42],
    v: off([-0.18, 0.18]),
    w: [0.03, 0.08],
  };
  const exhaust: Box = {
    u: [-0.455, -0.42],
    v: off([-0.05, 0.05]),
    w: [0.08, 0.11],
  };
  // shoulder snorkel intakes flanking the engine deck
  const scoopFar: Box = {
    u: [-0.26, -0.14],
    v: off([-0.2, -0.13]),
    w: [0.16, 0.205],
  };
  const scoopNear: Box = {
    u: [-0.26, -0.14],
    v: off([0.13, 0.2]),
    w: [0.16, 0.205],
  };
  const mirrorFar: Box = {
    u: [0.1, 0.14],
    v: off([-0.22, -0.17]),
    w: [0.19, 0.225],
  };
  const mirrorNear: Box = {
    u: [0.1, 0.14],
    v: off([0.17, 0.22]),
    w: [0.19, 0.225],
  };

  // Y-signature DRLs: twin chevrons opening toward the centre of the nose
  const yLightNear = [
    frontQuad(
      0.52,
      [
        [0.19, 0.092],
        [0.105, 0.106],
        [0.105, 0.12],
        [0.19, 0.106],
      ],
      "var(--v-light-front)",
    ),
    frontQuad(
      0.52,
      [
        [0.19, 0.092],
        [0.105, 0.064],
        [0.105, 0.078],
        [0.19, 0.106],
      ],
      "var(--v-light-front)",
    ),
  ];
  const yLightFar = [
    frontQuad(
      0.52,
      [
        [-0.19, 0.092],
        [-0.105, 0.106],
        [-0.105, 0.12],
        [-0.19, 0.106],
      ],
      "var(--v-light-front)",
    ),
    frontQuad(
      0.52,
      [
        [-0.19, 0.092],
        [-0.105, 0.064],
        [-0.105, 0.078],
        [-0.19, 0.106],
      ],
      "var(--v-light-front)",
    ),
  ];

  const wheelFrontFar = wheelPrims(
    [0.26, 0.38],
    off([-0.25, -0.18]),
    [0, 0.115],
  );
  const wheelRearFar = wheelPrims(
    [-0.38, -0.26],
    off([-0.25, -0.18]),
    [0, 0.115],
  );
  const wheelFrontNear = wheelPrims(
    [0.26, 0.38],
    off([0.18, 0.25]),
    [0, 0.115],
  );
  const wheelRearNear = wheelPrims(
    [-0.38, -0.26],
    off([0.18, 0.25]),
    [0, 0.115],
  );

  const rimOuterV = 0.25 + vOffset;
  const rims = [
    sidePoly(rimOuterV, [0.285, 0.355], [0.025, 0.09], "var(--v-wheel)"),
    sidePoly(rimOuterV, [0.313, 0.327], [0.032, 0.083], "var(--v-stroke)"),
    sidePoly(rimOuterV, [0.292, 0.348], [0.051, 0.064], "var(--v-stroke)"),
    sidePoly(rimOuterV, [-0.355, -0.285], [0.025, 0.09], "var(--v-wheel)"),
    sidePoly(rimOuterV, [-0.327, -0.313], [0.032, 0.083], "var(--v-stroke)"),
    sidePoly(rimOuterV, [-0.348, -0.292], [0.051, 0.064], "var(--v-stroke)"),
  ];

  return [
    ...wheelFrontFar,
    ...wheelRearFar,

    ...boxPrims(rearWing, dark),
    ...boxPrims(wingStrutFar, dark),
    ...boxPrims(wingStrutNear, dark),
    ...boxPrims(diffuser, dark),
    ...boxPrims(exhaust, metal),

    ...boxPrims(bodyMid),
    // angular side intake behind the door, rocker blade and character crease
    sideQuad(
      0.22 + vOffset,
      [
        [-0.12, 0.08],
        [-0.12, 0.155],
        [-0.28, 0.155],
        [-0.33, 0.08],
      ],
      "var(--v-window)",
    ),
    sidePoly(0.22 + vOffset, [-0.42, 0.24], [0.05, 0.07], "var(--v-bumper)"),
    sideQuad(
      0.22 + vOffset,
      [
        [0.24, 0.1],
        [-0.12, 0.128],
        [-0.12, 0.141],
        [0.24, 0.113],
      ],
      "var(--v-bumper)",
    ),

    ...boxPrims(scoopFar, dark),
    ...boxPrims(engineDeck),
    // louvred engine cover glass
    topPoly(0.19, [-0.36, -0.3], off([-0.12, 0.12]), "var(--v-window)"),
    topPoly(0.19, [-0.28, -0.22], off([-0.12, 0.12]), "var(--v-window)"),
    topPoly(0.19, [-0.2, -0.16], off([-0.12, 0.12]), "var(--v-window)"),
    ...boxPrims(scoopNear, dark),

    ...boxPrims(mirrorFar, dark),
    ...boxPrims(cabin),
    frontPoly(0.16, off([-0.14, 0.14]), [0.18, 0.26], "var(--v-window)"),
    sidePoly(0.16 + vOffset, [-0.12, 0.1], [0.18, 0.255], "var(--v-window)"),
    topPoly(0.27, [-0.11, 0.11], off([-0.12, 0.12]), "var(--v-window)"),
    ...boxPrims(mirrorNear, dark),

    ...boxPrims(noseLow),
    // full-width lower intake with vertical fins + Y-signature DRLs
    frontPoly(0.52, off([-0.17, 0.17]), [0.05, 0.082], "var(--v-window)"),
    frontPoly(0.52, off([-0.062, -0.042]), [0.05, 0.082], "var(--v-front)"),
    frontPoly(0.52, off([0.042, 0.062]), [0.05, 0.082], "var(--v-front)"),
    ...yLightFar,
    ...yLightNear,
    // sculpted bonnet: converging crease lines + slim centre channel + badge
    topQuad(
      0.12,
      [
        [0.27, -0.17],
        [0.5, -0.065],
        [0.5, -0.045],
        [0.27, -0.14],
      ],
      "var(--v-bumper)",
    ),
    topQuad(
      0.12,
      [
        [0.27, 0.14],
        [0.5, 0.045],
        [0.5, 0.065],
        [0.27, 0.17],
      ],
      "var(--v-bumper)",
    ),
    topQuad(
      0.12,
      [
        [0.27, -0.055],
        [0.5, -0.022],
        [0.5, 0.022],
        [0.27, 0.055],
      ],
      "var(--v-bumper)",
    ),
    topPoly(0.12, [0.455, 0.485], off([-0.015, 0.015]), "var(--v-light-front)"),
    ...boxPrims(splitter, dark),

    ...wheelFrontNear,
    ...wheelRearNear,
    ...rims,
  ];
}

export function buildGTCar(): Prim[] {
  const vOffset = 0.05;
  const off = (arr: [number, number]): [number, number] => [
    arr[0] + vOffset,
    arr[1] + vOffset,
  ];
  const dark = {
    side: "var(--v-bumper)",
    front: "var(--v-bumper)",
    top: "var(--v-bumper)",
  };

  // free-form quads on a single front (u), top (w) or side (v) plane
  const frontQuad = (
    u: number,
    pts: Array<[number, number]>, // [v, w]
    fill: string,
  ): Prim => ({
    d: poly(pts.map(([pv, pw]) => vproj(u, pv + vOffset, pw))),
    fill,
    stroked: false,
  });
  const topQuad = (
    w: number,
    pts: Array<[number, number]>, // [u, v]
    fill: string,
  ): Prim => ({
    d: poly(pts.map(([pu, pv]) => vproj(pu, pv + vOffset, w))),
    fill,
    stroked: false,
  });
  const sideQuad = (
    v: number,
    pts: Array<[number, number]>, // [u, w]
    fill: string,
  ): Prim => ({
    d: poly(pts.map(([pu, pw]) => vproj(pu, v, pw))),
    fill,
    stroked: false,
  });

  // front-engine GT proportions: long bonnet, cabin pushed rearward
  const bodyMain: Box = {
    u: [-0.48, 0.06],
    v: off([-0.22, 0.22]),
    w: [0.05, 0.16],
  };
  const bonnet: Box = {
    u: [0.06, 0.5],
    v: off([-0.21, 0.21]),
    w: [0.05, 0.135],
  };
  const splitter: Box = {
    u: [0.48, 0.58],
    v: off([-0.22, 0.22]),
    w: [0.03, 0.055],
  };
  const cabin: Box = {
    u: [-0.32, -0.02],
    v: off([-0.15, 0.15]),
    w: [0.16, 0.28],
  };
  // swan-neck rear wing: high main plane on centre struts + endplates
  const wingMain: Box = {
    u: [-0.54, -0.45],
    v: off([-0.21, 0.21]),
    w: [0.275, 0.3],
  };
  const wingStrutFar: Box = {
    u: [-0.46, -0.43],
    v: off([-0.06, -0.02]),
    w: [0.16, 0.295],
  };
  const wingStrutNear: Box = {
    u: [-0.46, -0.43],
    v: off([0.02, 0.06]),
    w: [0.16, 0.295],
  };
  const endplateFar: Box = {
    u: [-0.56, -0.43],
    v: off([-0.215, -0.185]),
    w: [0.25, 0.315],
  };
  const endplateNear: Box = {
    u: [-0.56, -0.43],
    v: off([0.185, 0.215]),
    w: [0.25, 0.315],
  };
  const diffuser: Box = {
    u: [-0.53, -0.47],
    v: off([-0.18, 0.18]),
    w: [0.02, 0.06],
  };
  const aerial: Box = {
    u: [-0.28, -0.25],
    v: off([-0.015, 0.015]),
    w: [0.28, 0.315],
  };
  const mirrorFar: Box = {
    u: [-0.08, -0.04],
    v: off([-0.22, -0.17]),
    w: [0.2, 0.235],
  };
  const mirrorNear: Box = {
    u: [-0.08, -0.04],
    v: off([0.17, 0.22]),
    w: [0.2, 0.235],
  };

  const wheelFrontFar = wheelPrims(
    [0.26, 0.38],
    off([-0.25, -0.18]),
    [0, 0.12],
  );
  const wheelRearFar = wheelPrims(
    [-0.38, -0.26],
    off([-0.25, -0.18]),
    [0, 0.12],
  );
  const wheelFrontNear = wheelPrims([0.26, 0.38], off([0.18, 0.25]), [0, 0.12]);
  const wheelRearNear = wheelPrims(
    [-0.38, -0.26],
    off([0.18, 0.25]),
    [0, 0.12],
  );

  const rimOuterV = 0.25 + vOffset;
  const rims = [
    sidePoly(rimOuterV, [0.285, 0.355], [0.025, 0.095], "var(--v-wheel)"),
    sidePoly(rimOuterV, [0.313, 0.327], [0.033, 0.087], "var(--v-stroke)"),
    sidePoly(rimOuterV, [0.292, 0.348], [0.053, 0.067], "var(--v-stroke)"),
    sidePoly(rimOuterV, [-0.355, -0.285], [0.025, 0.095], "var(--v-wheel)"),
    sidePoly(rimOuterV, [-0.327, -0.313], [0.033, 0.087], "var(--v-stroke)"),
    sidePoly(rimOuterV, [-0.348, -0.292], [0.053, 0.067], "var(--v-stroke)"),
  ];

  return [
    ...wheelFrontFar,
    ...wheelRearFar,

    ...boxPrims(diffuser, dark),
    ...boxPrims(bodyMain),

    // side skirt and door number panel
    sidePoly(0.22 + vOffset, [-0.48, 0.06], [0.05, 0.07], "var(--v-bumper)"),
    sidePoly(
      0.22 + vOffset,
      [-0.09, 0.03],
      [0.085, 0.15],
      "var(--v-light-front)",
    ),
    sidePoly(0.22 + vOffset, [-0.055, -0.041], [0.1, 0.135], "var(--v-bumper)"),
    sidePoly(0.22 + vOffset, [-0.019, -0.005], [0.1, 0.135], "var(--v-bumper)"),

    // rear wing assembly rises off the deck
    ...boxPrims(endplateFar, dark),
    ...boxPrims(wingStrutFar, dark),
    ...boxPrims(wingStrutNear, dark),
    ...boxPrims(wingMain, dark),
    ...boxPrims(endplateNear, dark),

    ...boxPrims(mirrorFar, dark),
    ...boxPrims(cabin),
    frontPoly(-0.02, off([-0.13, 0.13]), [0.18, 0.27], "var(--v-window)"),
    frontPoly(-0.02, off([-0.13, 0.13]), [0.245, 0.27], "var(--v-bumper)"),
    sidePoly(0.15 + vOffset, [-0.3, -0.06], [0.18, 0.265], "var(--v-window)"),
    ...boxPrims(aerial, dark),
    ...boxPrims(mirrorNear, dark),

    ...boxPrims(bonnet),
    // front-fender vent behind the wheel
    sideQuad(
      0.21 + vOffset,
      [
        [0.14, 0.08],
        [0.17, 0.08],
        [0.23, 0.13],
        [0.2, 0.13],
      ],
      "var(--v-bumper)",
    ),
    // central bonnet vent + angled fender louvres
    topPoly(0.135, [0.26, 0.38], off([-0.05, 0.05]), "var(--v-bumper)"),
    topQuad(
      0.135,
      [
        [0.18, -0.19],
        [0.3, -0.13],
        [0.3, -0.1],
        [0.18, -0.16],
      ],
      "var(--v-bumper)",
    ),
    topQuad(
      0.135,
      [
        [0.18, 0.16],
        [0.3, 0.1],
        [0.3, 0.13],
        [0.18, 0.19],
      ],
      "var(--v-bumper)",
    ),
    // wide grille + slim headlights
    frontQuad(
      0.5,
      [
        [-0.14, 0.055],
        [0.14, 0.055],
        [0.1, 0.11],
        [-0.1, 0.11],
      ],
      "var(--v-bumper)",
    ),
    frontPoly(0.5, off([0.13, 0.2]), [0.105, 0.12], "var(--v-light-front)"),
    frontPoly(0.5, off([-0.2, -0.13]), [0.105, 0.12], "var(--v-light-front)"),
    ...boxPrims(splitter, dark),
    // stacked canards on the near front corner
    sideQuad(
      0.21 + vOffset,
      [
        [0.5, 0.065],
        [0.41, 0.09],
        [0.41, 0.1],
        [0.5, 0.075],
      ],
      "var(--v-bumper)",
    ),
    sideQuad(
      0.21 + vOffset,
      [
        [0.5, 0.09],
        [0.41, 0.115],
        [0.41, 0.125],
        [0.5, 0.1],
      ],
      "var(--v-bumper)",
    ),

    ...wheelFrontNear,
    ...wheelRearNear,
    ...rims,
  ];
}

export const DETAILED_CAR_PRIMS = buildDetailedCar();
export const F1_CAR_PRIMS = buildF1Car();
export const TRUCK_PRIMS = buildTruck();
export const SUPERCAR_PRIMS = buildSupercar();
export const GT_CAR_PRIMS = buildGTCar();

export type CarModel = "detailed" | "f1" | "truck" | "supercar" | "gt";

/** Readable name for each model, as sent with analytics events. */
export const CAR_MODEL_NAMES: Record<CarModel, string> = {
  detailed: "sedan",
  f1: "f1",
  truck: "truck",
  supercar: "lamborghini",
  gt: "gt",
};

const MODEL_PRIMS: Record<CarModel, Prim[]> = {
  detailed: DETAILED_CAR_PRIMS,
  f1: F1_CAR_PRIMS,
  truck: TRUCK_PRIMS,
  supercar: SUPERCAR_PRIMS,
  gt: GT_CAR_PRIMS,
};

export function VehicleShape({
  kind: _kind,
  model,
}: {
  kind: "car";
  model: CarModel;
}) {
  const prims = MODEL_PRIMS[model];
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {prims.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill={p.fill}
          stroke={p.stroked ? (p.stroke ?? "var(--v-stroke)") : "none"}
          strokeWidth={p.stroked ? (p.width ?? 0.9) : 0}
        />
      ))}
    </g>
  );
}

export function CarPreview({
  model,
  selected,
}: {
  model: CarModel;
  selected: boolean;
}) {
  const activeVars = selected
    ? "[--v-front:color-mix(in_oklab,var(--foreground)_16%,var(--background))] [--v-side:color-mix(in_oklab,var(--foreground)_10%,var(--background))] [--v-stroke:color-mix(in_oklab,var(--foreground)_45%,var(--background))] [--v-top:color-mix(in_oklab,var(--foreground)_26%,var(--background))] [--v-wheel:color-mix(in_oklab,var(--foreground)_40%,var(--background))] [--v-wheel-side:color-mix(in_oklab,var(--foreground)_50%,var(--background))] [--v-wheel-front:color-mix(in_oklab,var(--foreground)_55%,var(--background))] [--v-wheel-top:color-mix(in_oklab,var(--foreground)_60%,var(--background))] [--v-window:color-mix(in_oklab,var(--foreground)_70%,var(--background))] [--v-bumper:color-mix(in_oklab,var(--foreground)_32%,var(--background))] [--v-light-front:color-mix(in_oklab,var(--foreground)_95%,var(--background))]"
    : "[--v-front:color-mix(in_oklab,var(--foreground)_10%,var(--background))] [--v-side:color-mix(in_oklab,var(--foreground)_5%,var(--background))] [--v-stroke:color-mix(in_oklab,var(--foreground)_28%,var(--background))] [--v-top:color-mix(in_oklab,var(--foreground)_16%,var(--background))] [--v-wheel:color-mix(in_oklab,var(--foreground)_22%,var(--background))] [--v-wheel-side:color-mix(in_oklab,var(--foreground)_30%,var(--background))] [--v-wheel-front:color-mix(in_oklab,var(--foreground)_35%,var(--background))] [--v-wheel-top:color-mix(in_oklab,var(--foreground)_40%,var(--background))] [--v-window:color-mix(in_oklab,var(--foreground)_48%,var(--background))] [--v-bumper:color-mix(in_oklab,var(--foreground)_18%,var(--background))] [--v-light-front:color-mix(in_oklab,var(--foreground)_75%,var(--background))] ";

  return (
    <svg
      viewBox="-50 -50 100 100"
      className={`size-20 overflow-visible transition-all duration-300 ${activeVars}`}
    >
      <g transform="translate(3, 9) scale(1.2)">
        <VehicleShape kind="car" model={model} />
      </g>
    </svg>
  );
}
