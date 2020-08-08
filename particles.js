const PARTICLE_COUNT = 100;
const SAFE_DISTANCE = 130;
const INFECTED_DISTANCE = 20;
const INFECTION_RATE = 0.25;
const FILL_COLOR = 'white';
const RECOVERY_TIME = 14000;
const STAY_AT_HOME = 0.1;

const STATUSES = {
  healthy: 'HEALTHY',
  infected: 'INFECTED',
  recovered: 'RECOVERED',
};

/* -------------------------------------------*/

const canvas = document.getElementById('canvas');
const body = document.body;
const ctx = canvas.getContext('2d');

// canvas.width = body.clientWidth;
// const width = canvas.width;
const width = (canvas.width = body.clientWidth);
const height = (canvas.height = body.clientHeight);

function distance(x1, y1, x2, y2) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

function linkParticles(particle, otherParticles, drawCtx) {
  for (const p of otherParticles) {
    const d = distance(particle.x, particle.y, p.x, p.y);

    if (d > SAFE_DISTANCE) {
      continue;
    }

    const opacity = 1 - d / SAFE_DISTANCE;

    // Infect another particles
    if (particle.status === STATUSES.infected && d < INFECTED_DISTANCE) {
      p.infect();
    }

    drawCtx.lineWidth = 1;
    drawCtx.strokeStyle = particle.color;
    drawCtx.globalAlpha = opacity;
    drawCtx.beginPath();
    drawCtx.moveTo(particle.x, particle.y);
    drawCtx.lineTo(p.x, p.y);
    drawCtx.closePath();
    drawCtx.stroke();
    drawCtx.globalAlpha = 1;
  }
}

class Particle {
  constructor(w, h) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.radius = 5;
    this.color = FILL_COLOR;
    this.speed = Math.random() < STAY_AT_HOME ? 0 : 1;
    this.directionAngle = Math.floor(Math.random() * 360);
    this.vector = {
      x: Math.cos(this.directionAngle) * this.speed,
      y: Math.sin(this.directionAngle) * this.speed,
    };
    this.status = STATUSES.healthy;

    if (Math.random() < INFECTION_RATE) {
      this.infect();
    }
  }

  infect() {
    if (
      this.status === STATUSES.infected ||
      this.status === STATUSES.recovered
    ) {
      return;
    }

    this.color = 'green';
    this.status = STATUSES.infected;

    setTimeout(() => {
      this.recover();
    }, RECOVERY_TIME);
  }

  recover() {
    this.status = STATUSES.recovered;
    this.color = 'hotpink';
  }

  draw(drawCtx) {
    drawCtx.beginPath();
    drawCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    drawCtx.closePath();
    drawCtx.fillStyle = this.color;
    drawCtx.fill();
  }

  update() {
    this.checkBoundaries();
    this.x += this.vector.x;
    this.y += this.vector.y;
    if (this.status === STATUSES.infected) {
      this.color = 'green';
    }
  }

  checkBoundaries() {
    if (this.x > width || this.x < 0) {
      this.vector.x *= -1;
    }
    if (this.y > height || this.y < 0) {
      this.vector.y *= -1;
    }
  }
}

const particles = [];

for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push(new Particle(width, height));
}

function render() {
  ctx.clearRect(0, 0, width, height);

  particles.forEach((particle) => {
    particle.update();
    if (particle.status === STATUSES.infected) {
      linkParticles(particle, particles, ctx);
    }
    particle.draw(ctx);
  });

  requestAnimationFrame(render);
}

render();
