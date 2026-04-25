const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let explodeParticles = [];
let time = 0;
let currentPhase = 'countdown';
let countdownValue = 5;
let phaseTimer = 0;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function getHeartPoints(scale, ox, oy) {
  const pts = [];
  for (let i = 0; i < 120; i++) {
      const t = (i / 120) * Math.PI * 2;
      const x = scale * (16 * Math.pow(Math.sin(t), 3));
      const y = -scale * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
      pts.push({ x: x + ox, y: y + oy });
  }
  return pts;
}

class HeartParticle {
  constructor(idx, total) {
      this.idx = idx;
      this.total = total;
      this.reset();
  }

  reset() {
      const hs = 5.5, hx = width / 2, hy = height / 2 - 40;
      const pts = getHeartPoints(hs, hx, hy);
      const pi = Math.floor((this.idx / this.total) * pts.length);
      const p = pts[pi % pts.length];
      this.tx = p.x; this.ty = p.y;
      this.x = p.x + (Math.random() - 0.5) * 300;
      this.y = p.y + (Math.random() - 0.5) * 300;
      this.vx = 0; this.vy = 0;
      this.life = 1;
      this.size = Math.random() * 4 + 3;
      this.baseSize = this.size;
      const colors = [
          'rgba(255, 105, 180,', 'rgba(255, 130, 160,', 'rgba(255, 90, 150,',
          'rgba(255, 70, 130,', 'rgba(255, 120, 170,'
      ];
      this.colorBase = colors[Math.floor(Math.random() * colors.length)];
      this.rot = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.03;
      this.rot3D = 0;
      this.rot3DSpeed = 0.008;
  }

  update() {
      this.rot3D += this.rot3DSpeed;
      const cos3D = Math.cos(this.rot3D);
      const hs = 5.5, hx = width / 2, hy = height / 2 - 40;
      const pts = getHeartPoints(hs, hx, hy);
      const pi = Math.floor((this.idx / this.total) * pts.length);
      const bp = pts[pi % pts.length];
      const dx = bp.x - hx;
      this.tx = hx + dx * cos3D;
      this.ty = bp.y;
      const spring = 0.08;
      this.vx += (this.tx - this.x) * spring;
      this.vy += (this.ty - this.y) * spring;
      this.vx *= 0.92; this.vy *= 0.92;
      this.x += this.vx; this.y += this.vy;
      const z = dx * Math.sin(this.rot3D);
      this.size = this.baseSize * (1 + z * 0.003);
      this.life = 0.6 + 0.4 * ((cos3D + 1) / 2);
      this.rot += this.rotSpeed;
  }

  draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.globalAlpha = Math.max(0, Math.min(1, this.life));
      ctx.fillStyle = this.colorBase + ' ' + Math.max(0, Math.min(1, this.life)) + ')';
      const s = this.size;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.25);
      ctx.bezierCurveTo(-s * 0.55, -s * 0.35, -s, -s * 0.1, -s, s * 0.25);
      ctx.bezierCurveTo(-s, s * 0.6, 0, s * 0.9, 0, s);
      ctx.bezierCurveTo(0, s * 0.9, s, s * 0.6, s, s * 0.25);
      ctx.bezierCurveTo(s, -s * 0.1, s * 0.55, -s * 0.35, 0, s * 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.shadowColor = this.colorBase + ' 0.6)';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.restore();
  }
}

class ExplodeParticle {
  constructor(x, y) {
      this.x = x; this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.size = Math.random() * 6 + 3;
      this.life = 1;
      this.decay = Math.random() * 0.015 + 0.008;
      const colors = [
          'rgba(255, 105, 180,', 'rgba(255, 130, 160,', 'rgba(255, 90, 150,',
          'rgba(255, 70, 130,', 'rgba(255, 120, 170,', 'rgba(216, 180, 226,'
      ];
      this.colorBase = colors[Math.floor(Math.random() * colors.length)];
      this.rot = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.15;
      this.gravity = 0.15;
  }
  update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += this.gravity;
      this.vx *= 0.98;
      this.life -= this.decay;
      this.rot += this.rotSpeed;
      this.size *= 0.99;
  }
  draw() {
      if (this.life <= 0) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.globalAlpha = this.life;
      ctx.fillStyle = this.colorBase + ' ' + this.life + ')';
      const s = this.size;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.25);
      ctx.bezierCurveTo(-s * 0.55, -s * 0.35, -s, -s * 0.1, -s, s * 0.25);
      ctx.bezierCurveTo(-s, s * 0.6, 0, s * 0.9, 0, s);
      ctx.bezierCurveTo(0, s * 0.9, s, s * 0.6, s, s * 0.25);
      ctx.bezierCurveTo(s, -s * 0.1, s * 0.55, -s * 0.35, 0, s * 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.shadowColor = this.colorBase + ' 0.8)';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.restore();
  }
}

class FloatParticle {
  constructor() {
      this.reset();
  }

  reset() {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 300 + 150;
      this.x = width / 2 + Math.cos(angle) * dist;
      this.y = height / 2 + Math.sin(angle) * dist;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = (Math.random() - 0.5) * 1.5 - 0.5;
      this.size = Math.random() * 5 + 2;
      this.life = 1;
      this.decay = Math.random() * 0.003 + 0.001;
      const colors = [
          'rgba(255, 105, 180,', 'rgba(255, 130, 160,', 'rgba(255, 90, 150,',
          'rgba(216, 180, 226,', 'rgba(200, 162, 200,'
      ];
      this.colorBase = colors[Math.floor(Math.random() * colors.length)];
      this.rot = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.04;
  }

  update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.01;
      this.life -= this.decay;
      this.rot += this.rotSpeed;
      if (this.life <= 0 || this.y > height + 50 || this.x < -50 || this.x > width + 50) {
          this.reset();
      }
  }

  draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.fillStyle = this.colorBase + ' ' + Math.max(0, this.life) + ')';
      const s = this.size;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.25);
      ctx.bezierCurveTo(-s * 0.55, -s * 0.35, -s, -s * 0.1, -s, s * 0.25);
      ctx.bezierCurveTo(-s, s * 0.6, 0, s * 0.9, 0, s);
      ctx.bezierCurveTo(0, s * 0.9, s, s * 0.6, s, s * 0.25);
      ctx.bezierCurveTo(s, -s * 0.1, s * 0.55, -s * 0.35, 0, s * 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.shadowColor = this.colorBase + ' 0.5)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
  }
}

for (let i = 0; i < 300; i++) {
  particles.push(new HeartParticle(i, 300));
}
for (let i = 0; i < 60; i++) {
  particles.push(new FloatParticle());
}

const countdownEl = document.getElementById('countdown');
const text1 = document.getElementById('text1');
const text2 = document.getElementById('text2');

const countdownInterval = setInterval(() => {
  countdownValue--;
  if (countdownValue > 0) {
      countdownEl.textContent = countdownValue;
  } else {
      clearInterval(countdownInterval);
      countdownEl.classList.add('hidden');
      setTimeout(() => {
          currentPhase = 'text1';
          text1.classList.add('active');
      }, 500);
  }
}, 1000);

function explodeHeart() {
  const hx = width / 2;
  const hy = height / 2 - 40;
  for (let i = 0; i < 150; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 80;
      const x = hx + Math.cos(angle) * dist;
      const y = hy + Math.sin(angle) * dist;
      explodeParticles.push(new ExplodeParticle(x, y));
  }
}

function managePhases() {
  if (currentPhase === 'text1') {
      phaseTimer += 0.016;
      if (phaseTimer >= 4) {
          phaseTimer = 0;
          currentPhase = 'explode';
          text1.classList.add('exploding');
          explodeHeart();
          setTimeout(() => {
              text1.classList.remove('active', 'exploding');
          }, 600);
      }
  } else if (currentPhase === 'explode') {
      phaseTimer += 0.016;
      if (phaseTimer >= 1.5) {
          phaseTimer = 0;
          currentPhase = 'text2';
          text2.classList.add('active');
      }
  } else if (currentPhase === 'text2') {
      phaseTimer += 0.016;
      if (phaseTimer >= 4) {
          phaseTimer = 0;
          currentPhase = 'explode2';
          text2.classList.add('exploding');
          explodeHeart();
          setTimeout(() => {
              text2.classList.remove('active', 'exploding');
          }, 600);
      }
  } else if (currentPhase === 'explode2') {
      phaseTimer += 0.016;
      if (phaseTimer >= 1.5) {
          phaseTimer = 0;
          currentPhase = 'text1';
          text1.classList.add('active');
      }
  }
}

function animate() {
  ctx.fillStyle = 'rgba(26, 16, 37, 0.15)';
  ctx.fillRect(0, 0, width, height);
  time += 0.016;

  managePhases();

  particles.sort((a, b) => {
      if (a instanceof HeartParticle && b instanceof HeartParticle) {
          return Math.abs(a.x - width / 2) - Math.abs(b.x - width / 2);
      }
      return a instanceof HeartParticle ? 1 : -1;
  });

  particles.forEach(p => {
      p.update();
      p.draw();
  });

  explodeParticles = explodeParticles.filter(p => p.life > 0);
  explodeParticles.forEach(p => {
      p.update();
      p.draw();
  });

  requestAnimationFrame(animate);
}

animate();