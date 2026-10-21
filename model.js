// Kasteel Hulhuizen, buildings only (no ground, water, trees or dike).
// Units are metres. Origin = centre of the main castle at ground level.
// Axes: +X east, -Z north, +Y up. Sizes are estimates; the layout follows the
// 17th-century maps (square castle, tower on each corner, voorburcht at the
// entrance, chapel "Cappel" outside the moat).
window.buildHulhuizen = function (THREE) {
  const root = new THREE.Group();

  function rnd(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
  const r = rnd(42);
  function canvasTex(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
    return t;
  }
  const brickTex = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#b9a58a'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 8) for (let x = -24; x < w; x += 24) {
      const off = (y / 8) % 2 ? 12 : 0, v = 0.85 + r() * 0.25;
      g.fillStyle = `rgb(${168 * v | 0},${74 * v | 0},${48 * v | 0})`;
      g.fillRect(x + off + 1, y + 1, 22, 6);
    }
  });
  const slateTex = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#3e4c58'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 8) for (let x = 0; x < w; x += 12) {
      const v = 0.8 + r() * 0.35;
      g.fillStyle = `rgb(${76 * v | 0},${92 * v | 0},${108 * v | 0})`;
      g.fillRect(x + ((y / 8) % 2 ? 6 : 0), y, 11, 7);
    }
  }); slateTex.repeat.set(6, 6);
  const tileTex = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#7a2e1f'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 8) for (let x = 0; x < w; x += 10) {
      const v = 0.85 + r() * 0.3;
      g.fillStyle = `rgb(${160 * v | 0},${66 * v | 0},${42 * v | 0})`;
      g.fillRect(x, y, 9, 7);
    }
  }); tileTex.repeat.set(6, 6);

  const M = {
    brick: new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.92 }),
    slate: new THREE.MeshStandardMaterial({ map: slateTex, roughness: 0.7, metalness: 0.05 }),
    tile: new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.85 }),
    stone: new THREE.MeshStandardMaterial({ color: 0xcfc6b1, roughness: 0.9 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x1d1a16, roughness: 1 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 0.9 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xb8913d, roughness: 0.4, metalness: 0.6 }),
  };

  function scaleUV(geo, w, h, d) {
    const uv = geo.attributes.uv, n = geo.attributes.normal;
    for (let i = 0; i < uv.count; i++) {
      const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
      uv.setXY(i, uv.getX(i) * (ax > 0.5 ? d : w) / 4, uv.getY(i) * (ay > 0.5 ? d : h) / 4);
    }
  }
  function box(w, h, d, mat, x, y, z, parent) {
    const geo = new THREE.BoxGeometry(w, h, d);
    if (mat === M.brick) scaleUV(geo, w, h, d);
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    (parent || root).add(m); return m;
  }
  function gable(w, d, h, mat, x, y, z, rotY, parent) {
    const s = new THREE.Shape();
    s.moveTo(-d / 2 - 0.6, 0); s.lineTo(0, h); s.lineTo(d / 2 + 0.6, 0); s.lineTo(-d / 2 - 0.6, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: w + 1.2, bevelEnabled: false });
    g.translate(0, 0, -(w + 1.2) / 2); g.rotateY(Math.PI / 2);
    const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); m.rotation.y = rotY || 0;
    (parent || root).add(m); return m;
  }
  function gableWall(d, h, x, y, z, rotY, parent) {
    const s = new THREE.Shape(); s.moveTo(-d / 2, 0); s.lineTo(0, h); s.lineTo(d / 2, 0); s.lineTo(-d / 2, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.8, bevelEnabled: false }); g.translate(0, 0, -0.4);
    const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 4, uv.getY(i) / 4);
    const m = new THREE.Mesh(g, M.brick); m.position.set(x, y, z); m.rotation.y = rotY || 0;
    (parent || root).add(m); return m;
  }
  function roundTower(x, z, rad, h, roofH, parent) {
    const g = new THREE.CylinderGeometry(rad, rad * 1.08, h, 28, 1, true);
    const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * rad * 6.28 / 4, uv.getY(i) * h / 4);
    const t = new THREE.Mesh(g, M.brick); t.position.set(x, h / 2, z); parent.add(t);
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(rad + 0.35, rad + 0.35, 0.6, 28), M.stone);
    ring.position.set(x, h, z); parent.add(ring);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(rad + 0.8, roofH, 28), M.slate);
    roof.position.set(x, h + roofH / 2, z); parent.add(roof);
    const spike = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 2.4, 6), M.gold);
    spike.position.set(x, h + roofH + 1.1, z); parent.add(spike);
  }
  function squareTower(x, z, s, h, roofH, parent) {
    box(s, h, s, M.brick, x, h / 2, z, parent);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(s * 0.78, roofH, 4), M.slate);
    roof.rotation.y = Math.PI / 4; roof.position.set(x, h + roofH / 2, z); parent.add(roof);
    const spike = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 2.6, 6), M.gold);
    spike.position.set(x, h + roofH + 1.2, z); parent.add(spike);
  }
  const windows = [];
  const win = (x, y, z, rotY) => windows.push([x, y, z, rotY]);
  const tmp = new THREE.Object3D();

  // ---- main castle ----
  const W = 19, WALL_H = 9, WALL_T = 1.6;
  box(2 * W, WALL_H, WALL_T, M.brick, 0, WALL_H / 2, -W);
  box(2 * W, WALL_H, WALL_T, M.brick, 0, WALL_H / 2, W);
  box(WALL_T, WALL_H, 2 * W, M.brick, W, WALL_H / 2, 0);
  box(WALL_T, WALL_H, W - 3, M.brick, -W, WALL_H / 2, -(W + 3) / 2);
  box(WALL_T, WALL_H, W - 3, M.brick, -W, WALL_H / 2, (W + 3) / 2);
  box(6, 13, 9, M.brick, -W, 6.5, 0);                       // gatehouse
  box(0.6, 5, 3.4, M.dark, -W - 3.05, 2.5, 0);
  gable(9, 6, 5, M.slate, -W, 13, 0, Math.PI / 2);
  const merlons = [];
  for (let i = -W + 4; i <= W - 4; i += 2) {
    merlons.push([i, -W, 0], [i, W, 0], [W, i, Math.PI / 2]);
    if (Math.abs(i) > 5) merlons.push([-W, i, Math.PI / 2]);
  }
  const mInst = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1.1, WALL_T), M.brick, merlons.length);
  merlons.forEach((m, i) => { tmp.position.set(m[0], WALL_H + 0.55, m[1]); tmp.rotation.set(0, m[2], 0); tmp.updateMatrix(); mInst.setMatrixAt(i, tmp.matrix); });
  root.add(mInst);
  [[-W, -W], [W, -W], [W, W], [-W, W]].forEach(([x, z], i) => roundTower(x, z, 3.8, i === 0 ? 19 : 16, i === 0 ? 12 : 9.5, root));

  const HX = 2, HZ = -W + 7.5, HW = 28, HD = 12, HH = 13;   // main house
  box(HW, HH, HD, M.brick, HX, HH / 2, HZ);
  gable(HW, HD, 9, M.slate, HX, HH, HZ, 0);
  gableWall(HD, 9, HX - HW / 2 + 0.3, HH, HZ, Math.PI / 2);
  gableWall(HD, 9, HX + HW / 2 - 0.3, HH, HZ, Math.PI / 2);
  for (let i = 0; i < 6; i++) { const x = HX - HW / 2 + 3 + i * 4.4; win(x, 4.5, HZ + HD / 2 + 0.05, 0); win(x, 9.2, HZ + HD / 2 + 0.05, 0); }
  for (let i = 0; i < 3; i++) {
    const x = HX - 8 + i * 8;
    box(2.4, 2.6, 2.6, M.brick, x, HH + 1.6, HZ + 4.8);
    gable(2.6, 2.4, 1.6, M.slate, x, HH + 2.9, HZ + 4.8, Math.PI / 2);
  }
  squareTower(HX + HW / 2 - 4, HZ + HD / 2 + 2, 4.6, 24, 11, root);
  win(HX + HW / 2 - 4, 16, HZ + HD / 2 + 4.35, 0); win(HX + HW / 2 - 4, 20, HZ + HD / 2 + 4.35, 0);
  box(8, 9.5, 20, M.brick, W - 4.8, 4.75, 4);                // east wing
  gable(20, 8, 6, M.tile, W - 4.8, 9.5, 4, Math.PI / 2);
  for (let i = 0; i < 4; i++) win(W - 8.85, 4.5, -3 + i * 4.6, Math.PI / 2);
  for (let i = -2; i <= 2; i++) { win(i * 6, 5, W + 0.85, 0); win(W + 0.85, 5, i * 6, Math.PI / 2); }

  // ---- voorburcht west of the castle ----
  const FORE = { x0: -86, x1: -52, z0: -15, z1: 15 };
  const FCX = (FORE.x0 + FORE.x1) / 2, FW = (FORE.x1 - FORE.x0) / 2 - 2, FD = (FORE.z1 - FORE.z0) / 2 - 2;
  box(2 * FW, 4.5, 1, M.brick, FCX, 2.25, -FD);
  box(2 * FW, 4.5, 1, M.brick, FCX, 2.25, FD);
  box(1, 4.5, 2 * FD, M.brick, FCX + FW, 2.25, 0);
  box(1, 4.5, FD - 3, M.brick, FCX - FW, 2.25, -(FD + 3) / 2);
  box(1, 4.5, FD - 3, M.brick, FCX - FW, 2.25, (FD + 3) / 2);
  squareTower(FCX - FW, 0, 6, 12, 7, root);
  box(0.6, 4.2, 3, M.dark, FCX - FW - 3.05, 2.1, 0);
  box(18, 6, 7, M.brick, FCX + 2, 3, -FD + 4.5);
  gable(18, 7, 4.5, M.tile, FCX + 2, 6, -FD + 4.5, 0);
  roundTower(FCX + FW, FD, 2.4, 7.5, 5, root);
  roundTower(FCX + FW, -FD, 2.4, 7.5, 5, root);

  // ---- bridges (deck and rails only) ----
  function bridge(x0, x1, z, wdt) {
    const len = x1 - x0, cx = (x0 + x1) / 2;
    box(len, 0.5, wdt, M.wood, cx, 0.25, z);
    box(len, 0.9, 0.2, M.wood, cx, 0.95, z - wdt / 2);
    box(len, 0.9, 0.2, M.wood, cx, 0.95, z + wdt / 2);
  }
  bridge(-105, FORE.x0 + 0.5, 0, 3.4);
  bridge(FORE.x1 - 0.5, -24.5, 0, 3.6);

  // ---- chapel ("Cappel") ----
  const CX = -70, CZ = -92;
  box(16, 7, 8, M.brick, CX, 3.5, CZ);
  gable(16, 8, 5.5, M.tile, CX, 7, CZ, 0);
  gableWall(8, 5.5, CX + 7.7, 7, CZ, Math.PI / 2);
  box(4.4, 3.5, 6, M.brick, CX + 9.5, 1.75, CZ);
  squareTower(CX - 9.5, CZ, 4, 13, 9, root);
  for (let i = 0; i < 3; i++) { win(CX - 4 + i * 4, 3.8, CZ + 4.06, 0); win(CX - 4 + i * 4, 3.8, CZ - 4.06, 0); }

  // ---- farmstead ----
  box(14, 4, 9, M.brick, 92, 2, 70); gable(14, 9, 6, M.tile, 92, 4, 70, 0);
  box(10, 3, 7, M.wood, 108, 1.5, 62); gable(10, 7, 4, M.tile, 108, 3, 62, Math.PI / 2);

  const wInst = new THREE.InstancedMesh(new THREE.BoxGeometry(1.1, 1.9, 0.12), M.dark, windows.length);
  windows.forEach((w, i) => { tmp.position.set(w[0], w[1], w[2]); tmp.rotation.set(0, w[3], 0); tmp.updateMatrix(); wInst.setMatrixAt(i, tmp.matrix); });
  root.add(wInst);

  return root;
};
