document.addEventListener('DOMContentLoaded', () => {
  // =======================
  // CONFIGURAÇÕES
  // =======================
  const LIMIAR_VOLUME = 0.015;
  const SUAVIZACAO = 0.85;
  const TOLERANCIA = 5; // Hz para considerar afinado

  const FREQ_MIN = 70;
  const FREQ_MAX = 350;

  // =======================
  // DOM
  // =======================
  const notaEl = document.getElementById('nota');
  const freqEl = document.getElementById('frequencia');
  const barra = document.querySelector('.indicador-afinacao');

  if (!notaEl || !freqEl || !barra) {
    console.error('DOM inválido');
    return;
  }

  // =======================
  // NOTAS DO VIOLÃO
  // =======================
  const notas = [
    { nome: 'E2', freq: 82.41 },
    { nome: 'A2', freq: 110.0 },
    { nome: 'D3', freq: 146.83 },
    { nome: 'G3', freq: 196.0 },
    { nome: 'B3', freq: 246.94 },
    { nome: 'E4', freq: 329.63 },
  ];

  // =======================
  // VARIÁVEIS
  // =======================
  let audioContext;
  let analyser;
  let buffer;
  let freqSuavizada = null;
  let notaAtual = null;

  // =======================
  // MICROFONE
  // =======================
  async function iniciarAfinador() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 4096;
    analyser.smoothingTimeConstant = 0;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    buffer = new Float32Array(analyser.fftSize);

    console.log('🎤 Microfone OK');
    console.log(audioContext.state);

    loop();
  }

  // =======================
  // LOOP
  // =======================
  function loop() {
    requestAnimationFrame(loop);

    analyser.getFloatTimeDomainData(buffer);

    const volume = calcularVolume(buffer);
    if (volume < LIMIAR_VOLUME) return;

    const freq = autoCorrelate(buffer, audioContext.sampleRate);
    if (!freq || freq < FREQ_MIN || freq > FREQ_MAX) return;

    freqSuavizada = freqSuavizada
      ? SUAVIZACAO * freqSuavizada + (1 - SUAVIZACAO) * freq
      : freq;

    atualizarInterface(freqSuavizada);
  }

  // =======================
  // INTERFACE
  // =======================
  function atualizarInterface(freq) {
    const notaDetectada = encontrarNotaMaisProxima(freq);

    if (!notaAtual) {
      // primeira vez que toca uma corda
      notaAtual = notaDetectada;
    } else {
      // só troca a corda se estiver MUITO distante
      const distancia = Math.abs(freq - notaAtual.freq);

      if (distancia > 30) {
        // usuário mudou de corda
        notaAtual = notaDetectada;
      }
    }

    notaEl.innerText = notaAtual.nome;
    freqEl.innerText = freq.toFixed(1) + ' Hz';

    moverSeta(freq, notaAtual.freq);
  }

  // =======================
  // SETA (usa seu CSS)
  // =======================
  function moverSeta(freq, alvo) {
    const diff = freq - alvo;
    const limite = 20;

    let pct = (diff / limite) * 50;
    pct = Math.max(-50, Math.min(50, pct));

    barra.style.setProperty('--pos-seta', `${50 + pct}%`);
  }

  // =======================
  // AUTO-CORRELAÇÃO (do script que você mandou)
  // =======================
  function autoCorrelate(buf, sampleRate) {
    let size = buf.length;
    let rms = 0;

    for (let i = 0; i < size; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / size);
    if (rms < LIMIAR_VOLUME) return null;

    let r1 = 0,
      r2 = size - 1,
      threshold = 0.2;

    for (let i = 0; i < size / 2; i++) {
      if (Math.abs(buf[i]) < threshold) {
        r1 = i;
        break;
      }
    }
    for (let i = 1; i < size / 2; i++) {
      if (Math.abs(buf[size - i]) < threshold) {
        r2 = size - i;
        break;
      }
    }

    buf = buf.slice(r1, r2);
    size = buf.length;

    const c = new Array(size).fill(0);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size - i; j++) {
        c[i] += buf[j] * buf[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;

    let maxval = -1,
      maxpos = -1;
    for (let i = d; i < size; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }

    return sampleRate / maxpos;
  }

  // =======================
  // UTIL
  // =======================
  function calcularVolume(buf) {
    return Math.sqrt(buf.reduce((s, v) => s + v * v, 0) / buf.length);
  }

  function encontrarNotaMaisProxima(freq) {
    return notas.reduce((a, b) =>
      Math.abs(b.freq - freq) < Math.abs(a.freq - freq) ? b : a,
    );
  }

  // =======================
  // START
  // =======================
  document.getElementById('btnIniciar').addEventListener('click', () => {
    iniciarAfinador();
  });
});
