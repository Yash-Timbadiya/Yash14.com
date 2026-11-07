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

export type Prim = { d: string; fill: string; stroked: boolean };

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

export function buildF1Car(): Prim[] {
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

  const floor: Box = {
    u: [-0.4, 0.32],
    v: off([-0.18, 0.18]),
    w: [0.02, 0.045],
  };
  const monocoque: Box = {
    u: [-0.36, 0.32],
    v: off([-0.09, 0.09]),
    w: [0.045, 0.15],
  };
  const sidepodFar: Box = {
    u: [-0.32, 0.04],
    v: off([-0.17, -0.09]),
    w: [0.045, 0.135],
  };
  const sidepodNear: Box = {
    u: [-0.32, 0.04],
    v: off([0.09, 0.17]),
    w: [0.045, 0.135],
  };
  const engineCover: Box = {
    u: [-0.34, 0.02],
    v: off([-0.045, 0.045]),
    w: [0.15, 0.22],
  };
  const sharkFin: Box = {
    u: [-0.5, -0.3],
    v: off([-0.015, 0.015]),
    w: [0.1, 0.21],
  };
  const gearbox: Box = {
    u: [-0.48, -0.34],
    v: off([-0.05, 0.05]),
    w: [0.045, 0.12],
  };
  const halo: Box = {
    u: [0.16, 0.2],
    v: off([-0.06, 0.06]),
    w: [0.15, 0.19],
  };
  const nose: Box = {
    u: [0.3, 0.5],
    v: off([-0.05, 0.05]),
    w: [0.06, 0.125],
  };
  const noseTip: Box = {
    u: [0.5, 0.58],
    v: off([-0.03, 0.03]),
    w: [0.055, 0.1],
  };

  const rearWingMain: Box = {
    u: [-0.56, -0.47],
    v: off([-0.24, 0.24]),
    w: [0.19, 0.235],
  };
  const rearWingFlap: Box = {
    u: [-0.58, -0.52],
    v: off([-0.24, 0.24]),
    w: [0.245, 0.275],
  };
  const rearEndplateFar: Box = {
    u: [-0.58, -0.44],
    v: off([-0.25, -0.22]),
    w: [0.1, 0.28],
  };
  const rearEndplateNear: Box = {
    u: [-0.58, -0.44],
    v: off([0.22, 0.25]),
    w: [0.1, 0.28],
  };

  const frontWingMain: Box = {
    u: [0.54, 0.63],
    v: off([-0.29, 0.29]),
    w: [0.02, 0.05],
  };
  const frontWingFlap: Box = {
    u: [0.5, 0.56],
    v: off([-0.28, 0.28]),
    w: [0.05, 0.075],
  };
  const frontEndplateFar: Box = {
    u: [0.52, 0.64],
    v: off([-0.3, -0.27]),
    w: [0.02, 0.09],
  };
  const frontEndplateNear: Box = {
    u: [0.52, 0.64],
    v: off([0.27, 0.3]),
    w: [0.02, 0.09],
  };

  const diffuser: Box = {
    u: [-0.49, -0.4],
    v: off([-0.13, 0.13]),
    w: [0.02, 0.05],
  };
  const exhaust: Box = {
    u: [-0.51, -0.48],
    v: off([-0.02, 0.02]),
    w: [0.06, 0.09],
  };
  const drsActuator: Box = {
    u: [-0.56, -0.53],
    v: off([-0.02, 0.02]),
    w: [0.235, 0.245],
  };
  const airboxIntake = frontPoly(
    0.02,
    off([-0.03, 0.03]),
    [0.16, 0.2],
    "var(--v-window)",
  );
  const tCam: Box = {
    u: [-0.06, -0.02],
    v: off([-0.015, 0.015]),
    w: [0.22, 0.245],
  };
  const mirrorFar: Box = {
    u: [0.18, 0.21],
    v: off([-0.13, -0.1]),
    w: [0.13, 0.155],
  };
  const mirrorNear: Box = {
    u: [0.18, 0.21],
    v: off([0.1, 0.13]),
    w: [0.13, 0.155],
  };
  const bargeboardFar: Box = {
    u: [0.06, 0.16],
    v: off([-0.185, -0.16]),
    w: [0.05, 0.12],
  };
  const bargeboardNear: Box = {
    u: [0.06, 0.16],
    v: off([0.16, 0.185]),
    w: [0.05, 0.12],
  };

  const armFrontFar: Box = {
    u: [0.36, 0.39],
    v: off([-0.19, -0.04]),
    w: [0.09, 0.11],
  };
  const armFrontNear: Box = {
    u: [0.36, 0.39],
    v: off([0.04, 0.19]),
    w: [0.09, 0.11],
  };
  const armRearFar: Box = {
    u: [-0.4, -0.37],
    v: off([-0.19, -0.05]),
    w: [0.07, 0.09],
  };
  const armRearNear: Box = {
    u: [-0.4, -0.37],
    v: off([0.05, 0.19]),
    w: [0.07, 0.09],
  };

  const wheelFrontFar = wheelPrims([0.3, 0.46], off([-0.28, -0.19]), [0, 0.14]);
  const wheelRearFar = wheelPrims(
    [-0.46, -0.3],
    off([-0.28, -0.19]),
    [0, 0.15],
  );
  const wheelFrontNear = wheelPrims([0.3, 0.46], off([0.19, 0.28]), [0, 0.14]);
  const wheelRearNear = wheelPrims([-0.46, -0.3], off([0.19, 0.28]), [0, 0.15]);

  const rimOuterV = 0.28 + vOffset;
  const rimFrontNear = [
    sidePoly(rimOuterV, [0.335, 0.425], [0.035, 0.105], "var(--v-wheel)"),
    sidePoly(rimOuterV, [0.365, 0.395], [0.055, 0.085], "var(--v-stroke)"),
  ];
  const rimRearNear = [
    sidePoly(rimOuterV, [-0.425, -0.335], [0.04, 0.11], "var(--v-wheel)"),
    sidePoly(rimOuterV, [-0.395, -0.365], [0.06, 0.09], "var(--v-stroke)"),
  ];

  return [
    ...wheelFrontFar,
    ...wheelRearFar,
    ...boxPrims(armFrontFar, dark),
    ...boxPrims(armRearFar, dark),

    ...boxPrims(rearEndplateFar, dark),
    ...boxPrims(rearWingFlap, dark),
    ...boxPrims(drsActuator, {
      side: "var(--v-wheel-side)",
      front: "var(--v-wheel-front)",
      top: "var(--v-wheel-top)",
    }),
    ...boxPrims(rearWingMain, dark),
    ...boxPrims(rearEndplateNear, dark),

    ...boxPrims(diffuser, dark),
    ...boxPrims(exhaust, {
      side: "var(--v-wheel-side)",
      front: "var(--v-wheel-front)",
      top: "var(--v-wheel-top)",
    }),
    ...boxPrims(gearbox, dark),
    ...boxPrims(floor, dark),

    ...boxPrims(bargeboardFar, dark),
    ...boxPrims(sidepodFar),
    frontPoly(0.04, off([-0.16, -0.1]), [0.06, 0.12], "var(--v-window)"),
    ...boxPrims(mirrorFar, dark),

    ...boxPrims(monocoque),

    ...boxPrims(sidepodNear),
    frontPoly(0.04, off([0.1, 0.16]), [0.06, 0.12], "var(--v-window)"),
    sidePoly(0.17 + vOffset, [-0.26, -0.04], [0.07, 0.115], "var(--v-window)"),
    ...boxPrims(bargeboardNear, dark),

    ...boxPrims(engineCover),
    airboxIntake,
    ...boxPrims(sharkFin),
    ...boxPrims(tCam, {
      side: "var(--v-wheel-side)",
      front: "var(--v-wheel-front)",
      top: "var(--v-wheel-top)",
    }),

    topPoly(0.15, [0.04, 0.18], off([-0.05, 0.05]), "var(--v-window)"),
    ...boxPrims(halo, {
      side: "var(--v-wheel-side)",
      front: "var(--v-wheel-front)",
      top: "var(--v-wheel-top)",
    }),
    ...boxPrims(mirrorNear, dark),

    ...boxPrims(nose),
    topPoly(0.125, [0.32, 0.48], off([-0.03, 0.03]), "var(--v-light-front)"),
    ...boxPrims(noseTip),
    ...boxPrims(armFrontNear, dark),
    ...boxPrims(armRearNear, dark),

    ...boxPrims(frontEndplateFar, dark),
    ...boxPrims(frontWingFlap, dark),
    ...boxPrims(frontWingMain, dark),
    ...boxPrims(frontEndplateNear, dark),

    ...wheelFrontNear,
    ...rimFrontNear,
    ...wheelRearNear,
    ...rimRearNear,
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
    <g strokeLinejoin="round">
      {prims.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill={p.fill}
          stroke={p.stroked ? "var(--v-stroke)" : "none"}
          strokeWidth={p.stroked ? 0.9 : 0}
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
