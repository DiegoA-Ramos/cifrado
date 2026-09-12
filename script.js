// Frecuencias relativas esperadas en idioma español para análisis Chi-Cuadrado (Al-Kindi)
const SPANISH_FREQUENCIES = {
  'a': 12.53, 'b': 1.42, 'c': 4.68, 'd': 5.86, 'e': 13.68, 'f': 0.69, 'g': 1.01,
  'h': 0.70, 'i': 6.25, 'j': 0.44, 'k': 0.02, 'l': 4.97, 'm': 3.15, 'n': 6.71,
  'ñ': 0.31, 'o': 8.68, 'p': 2.51, 'q': 0.88, 'r': 6.87, 's': 7.98, 't': 4.63,
  'u': 3.93, 'v': 0.90, 'w': 0.01, 'x': 0.22, 'y': 0.90, 'z': 0.52, ' ': 15.00
};

// --- UTILIDADES DE ALFABETO ---
//
// Las letras, los dígitos y los símbolos/puntuación se tratan como TRES grupos
// separados que nunca se mezclan entre sí, y el espacio en blanco NUNCA se
// cifra (se preserva siempre como separador de palabras). Esto evita dos
// problemas: que una letra "cruce" de mayúscula a minúscula, y que un
// desplazamiento grande haga que una letra termine convertida en un dígito o
// un signo de puntuación.

function isLetterChar(ch) {
  // Una letra es cualquier carácter cuya versión mayúscula difiere de la minúscula
  return ch.toLowerCase() !== ch.toUpperCase();
}

function classifyChar(ch) {
  if (ch === ' ') return 'space';
  if (isLetterChar(ch)) return 'letter';
  if (ch >= '0' && ch <= '9') return 'digit';
  return 'other';
}

// Construye los tres grupos de símbolos (letras, dígitos, otros) a partir del
// alfabeto que escribió el usuario. Las letras se guardan una sola vez, en
// minúscula (mayúsculas y minúsculas cuentan como la misma letra). El espacio
// se descarta por completo: nunca forma parte de ningún grupo cifrable.
function buildAlphabetGroups(rawAlphabet) {
  const groups = { letter: [], digit: [], other: [] };
  const seen = { letter: new Set(), digit: new Set(), other: new Set() };

  for (const ch of rawAlphabet) {
    const cat = classifyChar(ch);
    if (cat === 'space') continue;
    const key = cat === 'letter' ? ch.toLowerCase() : ch;
    if (!seen[cat].has(key)) {
      seen[cat].add(key);
      groups[cat].push(key);
    }
  }
  return groups;
}

function updateAlphabetLength() {
  const raw = document.getElementById('alphabetInput').value;
  const groups = buildAlphabetGroups(raw);
  document.getElementById('alphabetLength').innerText = groups.letter.length;
}

function toggleShiftInput() {
  const cipher = document.getElementById('cipherSelect').value;
  document.getElementById('shiftGroup').style.display = cipher === 'cesar' ? 'block' : 'none';
}

// --- ALGORITMOS DE CIFRADO Y DESCIFRADO ---
// El espacio pasa siempre intacto. Cada carácter cifrable rota solo dentro de
// su propio grupo (letras con letras, dígitos con dígitos, símbolos con
// símbolos), preservando mayúsculas/minúsculas.

function cipherCesar(text, shift, groups, decrypt = false) {
  let result = "";
  for (const char of text) {
    const cat = classifyChar(char);
    if (cat === 'space') { result += char; continue; }

    const list = groups[cat];
    const N = list.length;
    if (N === 0) { result += char; continue; }

    const isUpper = cat === 'letter' && char === char.toUpperCase();
    const key = cat === 'letter' ? char.toLowerCase() : char;
    const idx = list.indexOf(key);

    if (idx !== -1) {
      const effectiveShift = decrypt ? (N - (shift % N)) % N : shift % N;
      const newIdx = (idx + effectiveShift) % N;
      let newChar = list[newIdx];
      if (isUpper) newChar = newChar.toUpperCase();
      result += newChar;
    } else {
      result += char; // Preserva el carácter si no pertenece al alfabeto
    }
  }
  return result;
}

function cipherAtbash(text, groups) {
  let result = "";
  for (const char of text) {
    const cat = classifyChar(char);
    if (cat === 'space') { result += char; continue; }

    const list = groups[cat];
    const N = list.length;
    if (N === 0) { result += char; continue; }

    const isUpper = cat === 'letter' && char === char.toUpperCase();
    const key = cat === 'letter' ? char.toLowerCase() : char;
    const idx = list.indexOf(key);

    if (idx !== -1) {
      const newIdx = N - 1 - idx;
      let newChar = list[newIdx];
      if (isUpper) newChar = newChar.toUpperCase();
      result += newChar;
    } else {
      result += char;
    }
  }
  return result;
}

function executeEncryption() {
  const text = document.getElementById('encryptInput').value;
  const rawAlphabet = document.getElementById('alphabetInput').value;
  const cipher = document.getElementById('cipherSelect').value;
  const shift = parseInt(document.getElementById('shiftInput').value) || 0;

  if (!text || !rawAlphabet) {
    alert("Por favor ingresa el texto y el alfabeto.");
    return;
  }

  const groups = buildAlphabetGroups(rawAlphabet);

  let cipheredText = "";
  if (cipher === 'cesar') {
    cipheredText = cipherCesar(text, shift, groups);
  } else if (cipher === 'atbash') {
    cipheredText = cipherAtbash(text, groups);
  }

  document.getElementById('encryptResult').innerText = cipheredText;
  document.getElementById('encryptOutput').hidden = false;
}

// --- MOTOR DE ANÁLISIS ESTADÍSTICO (AL-KINDI) ---

function calculateChiSquared(text) {
  const cleanText = text.toLowerCase();
  const totalChars = cleanText.length;
  if (totalChars === 0) return Infinity;

  const counts = {};
  for (const char of cleanText) {
    counts[char] = (counts[char] || 0) + 1;
  }

  let chiSquared = 0;
  for (const char in SPANISH_FREQUENCIES) {
    const expectedFreq = SPANISH_FREQUENCIES[char];
    const expectedCount = (expectedFreq / 100) * totalChars;
    const observedCount = counts[char] || 0;

    chiSquared += Math.pow(observedCount - expectedCount, 2) / (expectedCount + 0.0001);
  }

  return chiSquared;
}

function executeAutoDecryption() {
  const text = document.getElementById('decryptInput').value;
  const rawAlphabet = document.getElementById('alphabetInput').value;

  if (!text || !rawAlphabet) {
    alert("Por favor ingresa el texto cifrado y el alfabeto.");
    return;
  }

  const groups = buildAlphabetGroups(rawAlphabet);
  const N = groups.letter.length;

  if (N === 0) {
    alert("El alfabeto debe incluir al menos una letra.");
    return;
  }

  let bestCandidate = { text: "", method: "", score: Infinity };

  // 1. Probar Atbash
  const atbashText = cipherAtbash(text, groups);
  const atbashScore = calculateChiSquared(atbashText);
  if (atbashScore < bestCandidate.score) {
    bestCandidate = { text: atbashText, method: "Atbash", score: atbashScore };
  }

  // 2. Probar César para todos los desplazamientos k de letras (0 a N-1)
  for (let k = 0; k < N; k++) {
    const cesarCandidate = cipherCesar(text, k, groups, true);
    const score = calculateChiSquared(cesarCandidate);
    if (score < bestCandidate.score) {
      bestCandidate = { text: cesarCandidate, method: `César (k = ${k})`, score: score };
    }
  }

  document.getElementById('detectedMethod').innerText = bestCandidate.method;
  document.getElementById('decryptResult').innerText = bestCandidate.text;
  document.getElementById('decryptOutput').hidden = false;
}

// --- COPIAR AL PORTAPAPELES ---

function copyText(elementId, buttonEl) {
  const text = document.getElementById(elementId).innerText;
  const done = () => {
    const original = buttonEl.innerText;
    buttonEl.innerText = "Copiado";
    setTimeout(() => { buttonEl.innerText = original; }, 1200);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text, done) {
  const temp = document.createElement('textarea');
  temp.value = text;
  temp.style.position = 'fixed';
  temp.style.opacity = '0';
  document.body.appendChild(temp);
  temp.select();
  try { document.execCommand('copy'); } catch (e) { /* ignora si falla */ }
  document.body.removeChild(temp);
  done();
}

// --- REGISTRO DE EVENTOS (EVENT LISTENERS) ---

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('alphabetInput').addEventListener('input', updateAlphabetLength);
  document.getElementById('cipherSelect').addEventListener('change', toggleShiftInput);
  document.getElementById('encryptBtn').addEventListener('click', executeEncryption);
  document.getElementById('autoDecryptBtn').addEventListener('click', executeAutoDecryption);

  document.getElementById('copyDecryptBtn').addEventListener('click', (e) => copyText('decryptResult', e.currentTarget));
  document.getElementById('copyEncryptBtn').addEventListener('click', (e) => copyText('encryptResult', e.currentTarget));

  updateAlphabetLength();
  toggleShiftInput();
});
