/* Piezas 3D compartidas (three.js): estudio de luces, lata sleek 355 mL y sombra de contacto.
   Las usan Can3D (hero) y la escena del vaso. Unidades: centímetros. */

export const R = 2.9; // radio del cuerpo
const LABEL_ASPECT = 580 / 377; // alto / medio perímetro de la etiqueta
export const H = LABEL_ASPECT * Math.PI * R; // alto de la zona impresa
export const Y_TOP = H / 2;
export const Y_BOT = -H / 2;
export const Y_PISO = Y_BOT - 0.76; // apoyo de la lata

/* Estudio para los reflejos: caja gris con softboxes verticales. Devuelve el environment map. */
export function crearEstudio(THREE, renderer, { mate = false } = {}) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const studio = new THREE.Scene();
  studio.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(40, 30, 40),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(0.34, 0.34, 0.35), side: THREE.BackSide })
    )
  );
  const softbox = (w, h, pos, intensity) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(intensity, intensity, intensity), side: THREE.DoubleSide })
    );
    m.position.set(...pos);
    m.lookAt(0, pos[1] * 0.2, 0);
    studio.add(m);
  };
  softbox(mate ? 8 : 1.6, 22, [-10, 1, 9], mate ? 4 : 34); // principal, izquierda al frente
  softbox(mate ? 6 : 1.0, 22, [12, 1, -2], mate ? 2.5 : 22); // recorte, derecha atrás
  softbox(7, 14, [8, 0, 12], 2.6); // relleno, derecha al frente
  softbox(16, 16, [0, 13, 0], 3.2); // cenital
  softbox(24, 8, [0, -11, 6], 1.1); // rebote del piso
  const envRT = pmrem.fromScene(studio, 0.03);
  const dispose = () => {
    studio.traverse((o) => {
      o.geometry?.dispose();
      o.material?.dispose();
    });
    envRT.dispose();
    pmrem.dispose();
  };
  return { texture: envRT.texture, dispose };
}

const rounded = (s, x, y, w, h, r) => {
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
};

/* Lata completa. `boca`: hacia dónde mira la apertura (rad, desde el frente +z hacia +x);
   si se pasa, la lata se dibuja abierta (apertura oscura) y devuelve el punto local por donde sale el líquido.
   Sin `boca`, la tapa queda como en el hero (la apertura, cerrada, mira hacia atrás). */
export function crearLata(THREE, { mate = false, boca = null } = {}) {
  const can = new THREE.Group();
  const yT = Y_TOP;
  const yB = Y_BOT;

  const labelMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: mate ? 0.75 : 0.42,
    metalness: 0.0,
    clearcoat: mate ? 0 : 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 0.6,
  });
  can.add(new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 192, 1, true, -Math.PI / 2, Math.PI * 2), labelMat));

  const metal = new THREE.MeshPhysicalMaterial({
    color: 0xeceef0,
    metalness: 1,
    roughness: mate ? 0.42 : 0.26,
    envMapIntensity: 1.5,
    side: THREE.DoubleSide,
  });
  const metalDark = new THREE.MeshPhysicalMaterial({ color: 0xdcdde0, metalness: 1, roughness: 0.32, envMapIntensity: 1.4, side: THREE.DoubleSide });

  const V = (x, y) => new THREE.Vector2(x, y);
  const top = [
    V(R, yT), V(R - 0.004, yT + 0.1), V(R - 0.025, yT + 0.25), V(R - 0.08, yT + 0.43), V(R - 0.16, yT + 0.6),
    V(R - 0.235, yT + 0.75), V(R - 0.275, yT + 0.87), V(R - 0.28, yT + 0.97), V(R - 0.255, yT + 1.04),
    V(R - 0.232, yT + 1.11), V(R - 0.238, yT + 1.19), V(R - 0.275, yT + 1.235), V(R - 0.33, yT + 1.24),
    V(R - 0.37, yT + 1.21), V(R - 0.385, yT + 1.1), V(R - 0.4, yT + 0.99), V(R - 0.45, yT + 0.975),
    V(R - 0.5, yT + 1.0), V(R - 0.9, yT + 1.012), V(0, yT + 1.015),
  ];
  can.add(new THREE.Mesh(new THREE.LatheGeometry(top, 160), metal));

  const bottom = [
    V(0, yB - 0.32), V(1.2, yB - 0.4), V(1.9, yB - 0.58), V(2.2, yB - 0.7), V(2.3, yB - 0.74),
    V(2.42, yB - 0.72), V(2.62, yB - 0.55), V(2.8, yB - 0.3), V(2.88, yB - 0.12), V(R, yB),
  ];
  can.add(new THREE.Mesh(new THREE.LatheGeometry(bottom, 160), metalDark));

  // Anilla, contorno de la apertura y remache. La apertura mira hacia `boca` (por defecto, al frente).
  // la apertura está modelada mirando a -z (ángulo π); se gira la tapa para orientarla
  const giro = boca === null ? 0 : boca - Math.PI;
  const tapa = new THREE.Group();
  tapa.rotation.y = giro;
  can.add(tapa);

  const tabShape = new THREE.Shape();
  rounded(tabShape, -0.62, -1.15, 1.24, 1.95, 0.5);
  const hole = new THREE.Path();
  rounded(hole, -0.4, -1.0, 0.8, 0.82, 0.34);
  tabShape.holes.push(hole);
  const tabGeo = new THREE.ExtrudeGeometry(tabShape, {
    depth: 0.02, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.03, bevelSegments: 3, curveSegments: 20,
  });
  tabGeo.rotateX(-Math.PI / 2);
  const tab = new THREE.Mesh(tabGeo, metal);
  tab.position.set(0, yT + 1.03, 0.15);
  tapa.add(tab);

  const score = new THREE.Shape();
  rounded(score, -0.55, 0.55, 1.1, 1.05, 0.5);
  const scoreIn = new THREE.Path();
  rounded(scoreIn, -0.49, 0.61, 0.98, 0.93, 0.45);
  score.holes.push(scoreIn);
  const scoreGeo = new THREE.ExtrudeGeometry(score, { depth: 0.012, bevelEnabled: false, curveSegments: 20 });
  scoreGeo.rotateX(-Math.PI / 2);
  const scoreMesh = new THREE.Mesh(scoreGeo, metalDark);
  scoreMesh.position.set(0, yT + 1.016, 0.35);
  tapa.add(scoreMesh);

  let bocaLocal = null;
  if (boca !== null) {
    // Lata abierta: la apertura es un hueco oscuro dentro del contorno
    const apertura = new THREE.Shape();
    rounded(apertura, -0.49, 0.61, 0.98, 0.93, 0.45);
    const aperturaGeo = new THREE.ShapeGeometry(apertura, 20);
    aperturaGeo.rotateX(-Math.PI / 2);
    const aperturaMesh = new THREE.Mesh(aperturaGeo, new THREE.MeshStandardMaterial({ color: 0x1a1214, roughness: 0.6 }));
    aperturaMesh.position.set(0, yT + 1.02, 0.35);
    tapa.add(aperturaMesh);
    // punto por donde sale el líquido: el borde de la apertura más cercano al reborde
    bocaLocal = new THREE.Vector3(0, yT + 1.08, 0.35 - 1.62);
    bocaLocal.applyAxisAngle(new THREE.Vector3(0, 1, 0), giro);
  }

  const rivet = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.06, 32), metal);
  rivet.position.set(0, yT + 1.05, 0);
  can.add(rivet);

  return { group: can, labelMat, bocaLocal };
}

/* Sombra de contacto: plano con un degradé radial */
export function crearSombra(THREE, size = 10, fuerza = 0.55) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, `rgba(0,0,0,${fuerza})`);
  grd.addColorStop(0.35, `rgba(0,0,0,${fuerza * 0.5})`);
  grd.addColorStop(0.7, `rgba(0,0,0,${fuerza * 0.11})`);
  grd.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false })
  );
  m.rotation.x = -Math.PI / 2;
  return m;
}

/* Libera geometrías, materiales y texturas de una escena */
export function liberar(scene) {
  scene.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
    }
  });
}
