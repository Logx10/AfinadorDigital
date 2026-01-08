/* ================================
   AFINADOR – CAPTAÇÃO DE ÁUDIO
   + DETECÇÃO DE FREQUÊNCIA (Hz)
   usando AUTOCORRELAÇÃO
================================ */

/* ========= VARIÁVEIS GLOBAIS ========= */
let audioContext;
let analyser;
let dataArray;

/* ========= FUNÇÃO PRINCIPAL ========= */
async function iniciarMicrofone() {
  try {
    /*Pede acesso ao microfone */
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    /*Cria o contexto de áudio */
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    /*Conecta o microfone ao contexto */
    const fonte = audioContext.createMediaStreamSource(stream);

    /*Cria o analisador */
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    /*Liga tudo */
    fonte.connect(analyser);

    /*Buffer para armazenar a onda sonora */
    dataArray = new Float32Array(analyser.fftSize);

    /*Inicia o loop de análise */
    atualizarAudio();

    console.log('Microfone iniciado com sucesso!');
  } catch (erro) {
    console.error('Erro ao acessar microfone:', erro);
  }
}

/* ========= LOOP DE ATUALIZAÇÃO ========= */
function atualizarAudio() {
  analyser.getFloatTimeDomainData(dataArray);

  /* Volume do som (ignora silêncio) */
  const rms = calcularRMS(dataArray);

  if (rms > 0.01) {
    const frequencia = detectarFrequencia(dataArray, audioContext.sampleRate);

    if (frequencia) {
      console.log('Frequência detectada:', frequencia.toFixed(2), 'Hz');
    }
  }

  requestAnimationFrame(atualizarAudio);
}

/* ========= CÁLCULO DE VOLUME (RMS) ========= */
function calcularRMS(buffer) {
  let soma = 0;

  for (let i = 0; i < buffer.length; i++) {
    soma += buffer[i] * buffer[i];
  }

  return Math.sqrt(soma / buffer.length);
}

/* ========= AUTOCORRELAÇÃO ========= */
function detectarFrequencia(buffer, sampleRate) {
  let tamanho = buffer.length;

  /*Remove silêncio das extremidades */
  let inicio = 0;
  let fim = tamanho - 1;
  const limiar = 0.01;

  while (inicio < tamanho && Math.abs(buffer[inicio]) < limiar) {
    inicio++;
  }

  while (fim > inicio && Math.abs(buffer[fim]) < limiar) {
    fim--;
  }

  buffer = buffer.slice(inicio, fim);
  tamanho = buffer.length;

  if (tamanho < 2) return null;

  /* 2️⃣ Autocorrelação */
  let melhorOffset = -1;
  let melhorCorrelacao = 0;

  for (let offset = 1; offset < tamanho; offset++) {
    let soma = 0;

    for (let i = 0; i < tamanho - offset; i++) {
      soma += buffer[i] * buffer[i + offset];
    }

    if (soma > melhorCorrelacao) {
      melhorCorrelacao = soma;
      melhorOffset = offset;
    }
  }

  /* Converte período em frequência */
  if (melhorOffset > 0) {
    return sampleRate / melhorOffset;
  }

  return null;
}

/* ========= INICIA TUDO ========= */
iniciarMicrofone();
