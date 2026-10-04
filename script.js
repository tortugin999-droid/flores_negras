/* ================================================================
   ANIMACIÓN DE FONDO LLENO DE ROSAS NEGRAS, ESTRELLAS Y PÉTALOS
   ================================================================ */

const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

let width = 0;
let height = 0;
let dpr = 1;

function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  initScene();
}

// ----------------------------------------------------------------
// 1. SISTEMA CELESTIAL (Estrellas, Nebulosa y Estrellas Fugaces)
// ----------------------------------------------------------------
const stars = [];
const numStars = 250;

class Star {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * (height * 0.98);
    this.size = Math.random() < 0.85 ? Math.random() * 1.4 + 0.5 : Math.random() * 2.8 + 1.2;
    this.alpha = Math.random() * 0.8 + 0.2;
    this.twinkleSpeed = Math.random() * 0.03 + 0.01;
    this.twinklePhase = Math.random() * Math.PI * 2;
    const hues = [265, 280, 220, 40, 0];
    this.hue = hues[Math.floor(Math.random() * hues.length)];
    this.hasSpikes = this.size > 2.2;
  }

  update(time) {
    this.twinklePhase += this.twinkleSpeed;
    this.currentAlpha = Math.max(0.12, this.alpha + Math.sin(this.twinklePhase) * 0.45);
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, this.currentAlpha);
    
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2.6);
    grad.addColorStop(0, `hsla(${this.hue}, 90%, 92%, 1)`);
    grad.addColorStop(0.45, `hsla(${this.hue}, 80%, 75%, 0.55)`);
    grad.addColorStop(1, `hsla(${this.hue}, 80%, 70%, 0)`);
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.65, 0, Math.PI * 2);
    ctx.fill();

    if (this.hasSpikes && this.currentAlpha > 0.45) {
      ctx.strokeStyle = `hsla(${this.hue}, 90%, 95%, ${this.currentAlpha * 0.7})`;
      ctx.lineWidth = 0.75;
      const spikeLen = this.size * 4;
      
      ctx.beginPath();
      ctx.moveTo(this.x - spikeLen, this.y);
      ctx.lineTo(this.x + spikeLen, this.y);
      ctx.moveTo(this.x, this.y - spikeLen);
      ctx.lineTo(this.x, this.y + spikeLen);
      ctx.stroke();
    }

    ctx.restore();
  }
}

const shootingStars = [];
function spawnShootingStar() {
  if (shootingStars.length >= 2) return;
  shootingStars.push({
    x: Math.random() * width * 0.8 + width * 0.1,
    y: Math.random() * (height * 0.45),
    length: Math.random() * 130 + 90,
    speed: Math.random() * 12 + 14,
    angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
    opacity: 1,
    fadeSpeed: Math.random() * 0.02 + 0.015,
    thickness: Math.random() * 1.5 + 1
  });
}
setInterval(spawnShootingStar, 4000);

const sparkleDust = [];
function addSparkles(x, y, count = 12) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = Math.random() * 3 + 1;
    sparkleDust.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      life: 1,
      decay: Math.random() * 0.03 + 0.015,
      size: Math.random() * 2.5 + 1,
      color: Math.random() < 0.6 ? '#d7b3ff' : '#ffe89c'
    });
  }
}

// ----------------------------------------------------------------
// 2. GENERADOR PROCEDURAL DE ROSAS NEGRAS (Optimizado con Sprites)
// ----------------------------------------------------------------
const roseSprites = [];
const NUM_ROSE_VARIANTS = 8;

function createRoseSprite(variantIndex) {
  const offCanvas = document.createElement('canvas');
  const size = 280;
  offCanvas.width = size;
  offCanvas.height = size;
  const octx = offCanvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;

  octx.save();
  octx.translate(cx, cy);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + variantIndex * 0.35;
    octx.save();
    octx.rotate(a);
    octx.beginPath();
    octx.moveTo(-7, 0);
    octx.quadraticCurveTo(0, 38, 0, 50);
    octx.quadraticCurveTo(3, 38, 7, 0);
    octx.fillStyle = '#07130a';
    octx.fill();
    octx.restore();
  }
  octx.restore();

  const petals = [];
  const outerCount = 9;
  for (let i = 0; i < outerCount; i++) {
    const a = (i / outerCount) * Math.PI * 2 + (variantIndex * 0.2);
    petals.push({
      layer: 0,
      angle: a,
      dist: 36 + (i % 2) * 5,
      width: 48,
      height: 52,
      rot: a + Math.PI / 2 + 0.15
    });
  }

  const midCount = 11;
  for (let i = 0; i < midCount; i++) {
    const a = (i / midCount) * Math.PI * 2 + (variantIndex * 0.3) + 0.3;
    petals.push({
      layer: 1,
      angle: a,
      dist: 23 + (i % 2) * 3,
      width: 35,
      height: 42,
      rot: a + Math.PI / 2 + 0.2
    });
  }

  const innerCount = 16;
  for (let i = 0; i < innerCount; i++) {
    const a = i * 2.39996 + variantIndex;
    const dist = Math.sqrt(i) * 4.3;
    petals.push({
      layer: 2,
      angle: a,
      dist: dist,
      width: 18 + (innerCount - i) * 1.1,
      height: 23 + (innerCount - i) * 1.1,
      rot: a + Math.PI / 2 + 0.1
    });
  }

  octx.save();
  octx.translate(cx, cy);

  for (const p of petals) {
    octx.save();
    const px = Math.cos(p.angle) * p.dist;
    const py = Math.sin(p.angle) * p.dist;
    octx.translate(px, py);
    octx.rotate(p.rot);

    const w = p.width;
    const h = p.height;

    octx.beginPath();
    octx.moveTo(0, h * 0.5);
    octx.bezierCurveTo(-w * 0.65, h * 0.35, -w * 0.7, -h * 0.3, -w * 0.2, -h * 0.5);
    octx.quadraticCurveTo(0, -h * 0.44, w * 0.2, -h * 0.5);
    octx.bezierCurveTo(w * 0.7, -h * 0.3, w * 0.65, h * 0.35, 0, h * 0.5);
    octx.closePath();

    const grad = octx.createRadialGradient(0, h * 0.1, 2, 0, 0, h * 0.65);
    if (p.layer === 0) {
      grad.addColorStop(0, '#060308');
      grad.addColorStop(0.5, '#160c1d');
      grad.addColorStop(0.85, '#261233');
      grad.addColorStop(1, '#452556');
    } else if (p.layer === 1) {
      grad.addColorStop(0, '#040206');
      grad.addColorStop(0.6, '#13071b');
      grad.addColorStop(0.9, '#220e2e');
      grad.addColorStop(1, '#361747');
    } else {
      grad.addColorStop(0, '#020104');
      grad.addColorStop(0.7, '#0a0311');
      grad.addColorStop(1, '#1b0825');
    }

    octx.fillStyle = grad;
    octx.fill();

    octx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
    octx.lineWidth = 1.1;
    octx.stroke();

    if (p.layer <= 1) {
      octx.save();
      octx.beginPath();
      octx.bezierCurveTo(-w * 0.6, -h * 0.25, -w * 0.2, -h * 0.5, 0, -h * 0.44);
      octx.quadraticCurveTo(w * 0.2, -h * 0.5, w * 0.6, -h * 0.25);
      octx.strokeStyle = 'rgba(180, 135, 230, 0.38)';
      octx.lineWidth = 0.85;
      octx.stroke();
      octx.restore();
    }

    octx.restore();
  }

  const numDrops = 4 + (variantIndex % 3);
  for (let i = 0; i < numDrops; i++) {
    const da = (i / numDrops) * Math.PI * 2 + 0.5;
    const dd = 15 + ((i * 11) % 32);
    const dx = Math.cos(da) * dd;
    const dy = Math.sin(da) * dd;
    const dr = 1.2 + (i % 2) * 0.8;

    octx.beginPath();
    octx.arc(dx, dy, dr, 0, Math.PI * 2);
    octx.fillStyle = 'rgba(235, 220, 255, 0.6)';
    octx.fill();

    octx.beginPath();
    octx.arc(dx - dr * 0.3, dy - dr * 0.3, dr * 0.35, 0, Math.PI * 2);
    octx.fillStyle = '#ffffff';
    octx.fill();
  }

  octx.restore();
  return offCanvas;
}

function initRoseSprites() {
  roseSprites.length = 0;
  for (let i = 0; i < NUM_ROSE_VARIANTS; i++) {
    roseSprites.push(createRoseSprite(i));
  }
}

class SceneRose {
  constructor(x, y, scale = 1, angle = 0, depth = 1, variant = 0) {
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.baseAngle = angle;
    this.depth = depth;
    this.sprite = roseSprites[variant % NUM_ROSE_VARIANTS];
    this.swaySpeed = 0.0012 + Math.random() * 0.001;
    this.swayOffset = Math.random() * Math.PI * 2;
    this.swayAngle = 0;
    this.petalDropCooldown = Math.random() * 70 + 35;
  }

  update(time) {
    this.swayAngle = Math.sin(time * this.swaySpeed + this.swayOffset) * 0.05;

    this.petalDropCooldown--;
    if (this.petalDropCooldown <= 0) {
      this.shedPetal();
      this.petalDropCooldown = 60 + Math.random() * 100;
    }
  }

  shedPetal() {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 25 * this.scale;
    const px = this.x + Math.cos(angle) * dist;
    const py = this.y + Math.sin(angle) * dist;

    spawnFallingPetal(px, py, this.scale * (0.8 + Math.random() * 0.4), true);
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.baseAngle + this.swayAngle);

    if (this.depth >= 1) {
      ctx.beginPath();
      ctx.moveTo(0, 10);
      ctx.bezierCurveTo(-10 * this.scale, 50 * this.scale, 12 * this.scale, 95 * this.scale, 0, 150 * this.scale);
      ctx.lineWidth = 4.5 * this.scale;
      ctx.strokeStyle = '#08120a';
      ctx.stroke();

      ctx.fillStyle = '#050c07';
      ctx.beginPath();
      ctx.moveTo(-2, 60 * this.scale);
      ctx.quadraticCurveTo(-12 * this.scale, 65 * this.scale, -10 * this.scale, 75 * this.scale);
      ctx.lineTo(-1, 70 * this.scale);
      ctx.fill();
    }

    const s = (280 * this.scale * 0.55);
    ctx.drawImage(this.sprite, -s / 2, -s / 2, s, s);

    ctx.restore();
  }
}

let roses = [];

function initRoses() {
  roses = [];
  const isMobile = width < 768;

  // Base
  const numBaseRoses = isMobile ? 14 : 26;
  const stepX = width / (numBaseRoses - 1);
  for (let i = 0; i < numBaseRoses; i++) {
    const x = i * stepX + (Math.random() - 0.5) * (stepX * 0.5);
    const y = height - (Math.random() * (height * 0.18) + (isMobile ? 25 : 45));
    const scale = isMobile ? (0.75 + Math.random() * 0.35) : (1.05 + Math.random() * 0.45);
    const angle = (Math.random() - 0.5) * 0.5;
    roses.push(new SceneRose(x, y, scale, angle, 2, i));
  }

  // Flancos
  const numFlankRoses = isMobile ? 10 : 20;
  for (let i = 0; i < numFlankRoses; i++) {
    const onLeft = i % 2 === 0;
    const progress = Math.floor(i / 2) / (numFlankRoses / 2);
    const x = onLeft ? (Math.random() * width * 0.2 + 10) : (width - Math.random() * width * 0.2 - 10);
    const y = height * 0.18 + progress * (height * 0.68) + (Math.random() - 0.5) * 35;
    const scale = 0.8 + Math.random() * 0.35;
    const angle = onLeft ? (0.25 + Math.random() * 0.3) : (-0.25 - Math.random() * 0.3);
    roses.push(new SceneRose(x, y, scale, angle, 1, i + 3));
  }

  // Centro y cielo
  const numFloaters = isMobile ? 12 : 24;
  for (let i = 0; i < numFloaters; i++) {
    const x = Math.random() * (width * 0.86) + width * 0.07;
    const y = Math.random() * (height * 0.65) + 35;
    const scale = 0.52 + Math.random() * 0.38;
    const angle = (Math.random() - 0.5) * 1.2;
    roses.push(new SceneRose(x, y, scale, angle, 0, i + 7));
  }

  roses.sort((a, b) => a.depth - b.depth);
}

// ----------------------------------------------------------------
// 3. FÍSICA Y RENDERIZADO 3D DE PÉTALOS EN CAÍDA CONTINUA
// ----------------------------------------------------------------
const fallingPetals = [];
const maxPetals = 130;

class FallingPetal {
  constructor(x, y, scale = 1, isFromRose = false) {
    this.reset(x, y, scale, isFromRose);
  }

  reset(x = null, y = null, scale = null, isFromRose = false) {
    this.x = x !== null ? x : Math.random() * (width + 200) - 100;
    this.y = y !== null ? y : -50 - Math.random() * 100;
    this.scale = scale !== null ? scale : (Math.random() * 0.55 + 0.65);
    
    this.baseVy = Math.random() * 1.1 + 0.75;
    this.vy = this.baseVy;
    this.vx = (Math.random() - 0.38) * 1.1;

    this.rotX = Math.random() * Math.PI * 2;
    this.rotY = Math.random() * Math.PI * 2;
    this.rotZ = Math.random() * Math.PI * 2;

    this.rotSpeedX = (Math.random() - 0.5) * 0.04 + 0.015;
    this.rotSpeedY = (Math.random() - 0.5) * 0.035;
    this.rotSpeedZ = (Math.random() - 0.5) * 0.03;

    this.oscPhase = Math.random() * Math.PI * 2;
    this.oscSpeed = Math.random() * 0.03 + 0.02;
    this.oscAmp = Math.random() * 1.4 + 0.8;

    this.width = (24 + Math.random() * 8) * this.scale;
    this.height = (30 + Math.random() * 10) * this.scale;
    this.opacity = isFromRose ? 0.95 : (Math.random() * 0.3 + 0.7);
  }

  update(windX, windY) {
    this.oscPhase += this.oscSpeed;
    const sway = Math.sin(this.oscPhase) * this.oscAmp;

    this.x += this.vx + sway + windX * 0.3;
    this.y += this.vy + windY * 0.15;

    this.rotX += this.rotSpeedX;
    this.rotY += this.rotSpeedY;
    this.rotZ += this.rotSpeedZ;

    if (this.y > height + 80 || this.x < -160 || this.x > width + 160) {
      this.reset();
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotZ);

    const scaleX = Math.cos(this.rotY);
    const scaleY = Math.cos(this.rotX);
    ctx.scale(scaleX, scaleY);

    ctx.globalAlpha = this.opacity;

    const w = this.width;
    const h = this.height;

    ctx.beginPath();
    ctx.moveTo(0, h * 0.5);
    ctx.bezierCurveTo(-w * 0.65, h * 0.3, -w * 0.7, -h * 0.3, -w * 0.2, -h * 0.5);
    ctx.quadraticCurveTo(0, -h * 0.42, w * 0.2, -h * 0.5);
    ctx.bezierCurveTo(w * 0.7, -h * 0.3, w * 0.65, h * 0.3, 0, h * 0.5);
    ctx.closePath();

    const isFaceA = (scaleX * scaleY) >= 0;
    const grad = ctx.createLinearGradient(0, -h * 0.5, 0, h * 0.5);

    if (isFaceA) {
      grad.addColorStop(0, '#3a1e4a');
      grad.addColorStop(0.35, '#1e0c29');
      grad.addColorStop(0.8, '#100517');
      grad.addColorStop(1, '#050207');
    } else {
      grad.addColorStop(0, '#24102e');
      grad.addColorStop(0.4, '#13051a');
      grad.addColorStop(0.85, '#08020a');
      grad.addColorStop(1, '#030105');
    }

    ctx.fillStyle = grad;
    ctx.fill();

    const glint = Math.abs(Math.sin(this.rotX + this.rotY));
    if (glint > 0.65) {
      ctx.strokeStyle = `rgba(205, 165, 255, ${(glint - 0.65) * 1.5})`;
      ctx.lineWidth = 0.85;
      ctx.stroke();
    }

    ctx.restore();
  }
}

function spawnFallingPetal(x, y, scale, isFromRose) {
  if (fallingPetals.length < maxPetals) {
    fallingPetals.push(new FallingPetal(x, y, scale, isFromRose));
  } else {
    const p = fallingPetals.find(petal => petal.y > height * 0.85) || fallingPetals[0];
    if (p) p.reset(x, y, scale, isFromRose);
  }
}

function initPetals() {
  fallingPetals.length = 0;
  for (let i = 0; i < 85; i++) {
    const p = new FallingPetal();
    p.y = Math.random() * height;
    fallingPetals.push(p);
  }
}

// ----------------------------------------------------------------
// 4. INTERACTIVIDAD (Brisa con cursor / toque y destellos)
// ----------------------------------------------------------------
let mouseX = width / 2;
let mouseY = height / 2;
let targetWindX = 0;
let targetWindY = 0;
let currentWindX = 0;
let currentWindY = 0;
let lastMouseX = mouseX;
let lastMouseY = mouseY;

window.addEventListener('mousemove', (e) => {
  const dx = e.clientX - lastMouseX;
  const dy = e.clientY - lastMouseY;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
  mouseX = e.clientX;
  mouseY = e.clientY;

  targetWindX = Math.max(-5, Math.min(5, dx * 0.15));
  targetWindY = Math.max(-3, Math.min(3, dy * 0.1));

  if (Math.random() < 0.6) {
    addSparkles(e.clientX, e.clientY, 2);
  }
});

window.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0) {
    const touch = e.touches[0];
    const dx = touch.clientX - lastMouseX;
    const dy = touch.clientY - lastMouseY;
    lastMouseX = touch.clientX;
    lastMouseY = touch.clientY;
    mouseX = touch.clientX;
    mouseY = touch.clientY;

    targetWindX = Math.max(-5, Math.min(5, dx * 0.2));
    targetWindY = Math.max(-3, Math.min(3, dy * 0.15));

    addSparkles(touch.clientX, touch.clientY, 3);
  }
}, { passive: true });

window.addEventListener('click', (e) => {
  const clickX = e.clientX;
  const clickY = e.clientY;

  addSparkles(clickX, clickY, 20);

  for (let i = 0; i < 6; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 30;
    const p = new FallingPetal(clickX + Math.cos(angle) * dist, clickY + Math.sin(angle) * dist, 0.8 + Math.random() * 0.4, true);
    p.vx = Math.cos(angle) * (Math.random() * 3 + 1);
    p.vy = Math.sin(angle) * (Math.random() * 3 + 1);
    fallingPetals.push(p);
  }
});

// ----------------------------------------------------------------
// 5. INICIALIZACIÓN Y BUCLE DE ANIMACIÓN
// ----------------------------------------------------------------
function initScene() {
  stars.length = 0;
  for (let i = 0; i < numStars; i++) {
    stars.push(new Star());
  }

  initRoseSprites();
  initRoses();
  initPetals();
}

function animate(time) {
  requestAnimationFrame(animate);

  currentWindX += (targetWindX - currentWindX) * 0.05;
  currentWindY += (targetWindY - currentWindY) * 0.05;
  targetWindX *= 0.95;
  targetWindY *= 0.95;

  drawBackground(ctx);

  for (const s of stars) {
    s.update(time);
    s.draw(ctx);
  }

  updateShootingStars(ctx);

  for (const rose of roses) {
    rose.update(time);
    rose.draw(ctx);
  }

  for (let i = fallingPetals.length - 1; i >= 0; i--) {
    const p = fallingPetals[i];
    p.update(currentWindX, currentWindY);
    p.draw(ctx);
  }

  updateSparkles(ctx);
}

function drawBackground(ctx) {
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#030106');
  bgGrad.addColorStop(0.35, '#090414');
  bgGrad.addColorStop(0.75, '#120822');
  bgGrad.addColorStop(1, '#1b0a2d');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  const nebula1 = ctx.createRadialGradient(width * 0.25, height * 0.35, 10, width * 0.25, height * 0.35, width * 0.45);
  nebula1.addColorStop(0, 'rgba(85, 35, 125, 0.2)');
  nebula1.addColorStop(0.55, 'rgba(45, 18, 70, 0.08)');
  nebula1.addColorStop(1, 'transparent');
  ctx.fillStyle = nebula1;
  ctx.fillRect(0, 0, width, height);

  const nebula2 = ctx.createRadialGradient(width * 0.8, height * 0.22, 10, width * 0.8, height * 0.22, width * 0.4);
  nebula2.addColorStop(0, 'rgba(105, 45, 145, 0.16)');
  nebula2.addColorStop(0.6, 'rgba(50, 15, 80, 0.06)');
  nebula2.addColorStop(1, 'transparent');
  ctx.fillStyle = nebula2;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function updateShootingStars(ctx) {
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const st = shootingStars[i];
    st.x += Math.cos(st.angle) * st.speed;
    st.y += Math.sin(st.angle) * st.speed;
    st.opacity -= st.fadeSpeed;

    if (st.opacity <= 0) {
      shootingStars.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = st.opacity;
    ctx.lineWidth = st.thickness;
    ctx.lineCap = 'round';

    const tailX = st.x - Math.cos(st.angle) * st.length;
    const tailY = st.y - Math.sin(st.angle) * st.length;

    const grad = ctx.createLinearGradient(tailX, tailY, st.x, st.y);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.7, 'rgba(215, 180, 255, 0.65)');
    grad.addColorStop(1, '#ffffff');

    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(st.x, st.y);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(st.x, st.y, st.thickness * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

function updateSparkles(ctx) {
  for (let i = sparkleDust.length - 1; i >= 0; i--) {
    const sp = sparkleDust[i];
    sp.x += sp.vx;
    sp.y += sp.vy;
    sp.life -= sp.decay;

    if (sp.life <= 0) {
      sparkleDust.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = sp.life;
    ctx.fillStyle = sp.color;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
    ctx.fill();

    if (sp.life > 0.5) {
      ctx.strokeStyle = sp.color;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(sp.x - sp.size * 2, sp.y);
      ctx.lineTo(sp.x + sp.size * 2, sp.y);
      ctx.moveTo(sp.x, sp.y - sp.size * 2);
      ctx.lineTo(sp.x, sp.y + sp.size * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
requestAnimationFrame(animate);
