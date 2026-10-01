/* Sonido de una soda sirviéndose, sintetizado con Web Audio (sin archivos).
   Capas:
   - chorro: ruido filtrado con dos resonancias que suben de tono a medida que el vaso se llena
     (la columna de aire que queda arriba del líquido se acorta: ~690 Hz con el vaso vacío, ~2,3 kHz casi lleno);
   - burbujas: "plops" cortos de frecuencia ascendente, más seguidos cuanto más caudal;
   - gas: crepitar agudo que sigue un rato después de servir.
   Se crea dentro de un gesto del usuario (click), como piden los navegadores. */

export function crearSonidoVertido() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  const ctx = new Ctx();

  const master = ctx.createGain();
  master.gain.value = 0;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 3;
  master.connect(comp).connect(ctx.destination);

  // Ruido rosado aproximado (filtro de Paul Kellet) en un buffer en loop
  const n = ctx.sampleRate * 3;
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < n; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856;
    b4 = 0.55 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.016898;
    d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
    b6 = w * 0.115926;
  }
  const ruido = ctx.createBufferSource();
  ruido.buffer = buf;
  ruido.loop = true;

  // Chorro: dos bandas resonantes + cuerpo grave
  const chorro = ctx.createGain();
  chorro.gain.value = 0;
  const res1 = ctx.createBiquadFilter();
  res1.type = "bandpass";
  res1.frequency.value = 520;
  res1.Q.value = 4.5;
  const res2 = ctx.createBiquadFilter();
  res2.type = "bandpass";
  res2.frequency.value = 1300;
  res2.Q.value = 7;
  const cuerpo = ctx.createBiquadFilter();
  cuerpo.type = "lowpass";
  cuerpo.frequency.value = 900;
  const g1 = ctx.createGain();
  g1.gain.value = 0.9;
  const g2 = ctx.createGain();
  g2.gain.value = 0.45;
  const g3 = ctx.createGain();
  g3.gain.value = 0.35;
  ruido.connect(res1).connect(g1).connect(chorro);
  ruido.connect(res2).connect(g2).connect(chorro);
  ruido.connect(cuerpo).connect(g3).connect(chorro);
  chorro.connect(master);

  // Gas: agudos con "granos" de crepitar
  const gas = ctx.createGain();
  gas.gain.value = 0;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 4200;
  const crepitar = ctx.createGain();
  crepitar.gain.value = 0;
  ruido.connect(hp).connect(crepitar).connect(gas);
  gas.connect(master);

  ruido.start();

  let flujo = 0;
  let nivel = 0;
  let burbujeo = 0;
  let activo = true;

  function plop(t, f0, dur, vol) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f0 * (1.6 + Math.random() * 0.8), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  // Planificador: cada 30 ms ajusta parámetros con un poco de azar (el caudal nunca es parejo)
  const tick = setInterval(() => {
    if (!activo) return;
    const t = ctx.currentTime;
    const jit = 0.75 + Math.random() * 0.5;
    chorro.gain.setTargetAtTime(flujo * 0.9 * jit, t, 0.03);
    // el tono sube con el nivel: la columna de aire del vaso resuena como un tubo cerrado de un lado
    // (f = c / 4L, con L el aire que queda arriba del líquido); sube cada vez más rápido al final
    const L = 0.105 * (1 - 0.84 * nivel) + 0.02; // m, con corrección de boca
    const f = (343 / (4 * L)) * (1 + (Math.random() - 0.5) * 0.04);
    res1.frequency.setTargetAtTime(f, t, 0.05);
    res2.frequency.setTargetAtTime(f * 3, t, 0.05); // los tubos cerrados sólo tienen armónicos impares
    // gas
    gas.gain.setTargetAtTime(0.18 * Math.max(burbujeo, flujo * 0.6), t, 0.2);
    crepitar.gain.setValueAtTime(Math.random() < 0.35 ? 0.4 + Math.random() * 0.6 : 0.05, t);
    // burbujas
    const tasa = flujo * 26 + burbujeo * 5; // por segundo
    let k = tasa * 0.03;
    while (k > 0) {
      if (Math.random() < k) {
        const fb = 600 + Math.random() * 1400 + nivel * 500;
        plop(t + Math.random() * 0.03, fb, 0.025 + Math.random() * 0.05, 0.02 + Math.random() * 0.05 * (flujo + 0.3));
      }
      k -= 1;
    }
  }, 30);

  return {
    /* flujo y nivel de 0 a 1; burbujeo: gas residual después de servir */
    actualizar(f, nv, bur) {
      flujo = Math.max(0, Math.min(1, f));
      nivel = Math.max(0, Math.min(1, nv));
      burbujeo = Math.max(0, Math.min(1, bur));
    },
    encender() {
      activo = true;
      ctx.resume();
      master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.1);
    },
    apagar() {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
    },
    cerrar() {
      activo = false;
      clearInterval(tick);
      try {
        ruido.stop();
      } catch {}
      ctx.close();
    },
  };
}
