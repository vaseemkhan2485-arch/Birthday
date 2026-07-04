/**
• Interactive Premium Birthday Web Application
• Complete Engine - Synchronized Audio Visual System
*/

// Global State Management
const STATE = {
assetsLoaded: 0,
totalAssets: 9, // Audio track + 8 key images
musicStarted: false,
ignited: false,
fuseComplete: false,
giftOpened: false,
montageActive: false,
timelineIndex: 0
};

// Elements Registry
const DOM = {
loaderScreen: document.getElementById('loader-screen'),
loaderBar: document.getElementById('loader-bar'),
loaderStatus: document.getElementById('loader-status'),
interactionStage: document.getElementById('interaction-stage'),
matchstick: document.getElementById('matchstick'),
strikerSurface: document.getElementById('striker-surface'),
stickFlameAnchor: document.getElementById('stick-flame-anchor'),
giftStage: document.getElementById('gift-stage'),
giftBox: document.getElementById('gift-box-element'),
celebrationStage: document.getElementById('celebration-stage'),
messagePanel: document.getElementById('message-panel'),
typewriterText: document.getElementById('typewriter-text'),
screenFlash: document.getElementById('screen-flash'),
audioTrack: document.getElementById('birthday-track'),
bgCanvas: document.getElementById('bg-canvas'),
fuseCanvas: document.getElementById('fuse-canvas')
};

// Canvas Execution Contexts
const ctxBg = DOM.bgCanvas.getContext('2d');
const ctxFuse = DOM.fuseCanvas.getContext('2d');

// Simulation Particle Containers
let sparks = [];
let smokePuffs = [];
let fireEmbers = [];
let celebratoryElements = []; // Combined system for hearts, confetti, fireworks

// Draggable Interface Configuration
let dragProps = {
isDragging: false,
startX: 0,
startY: 0,
currentX: 0,
currentY: 0,
lastX: 0,
lastY: 0,
velocity: 0
};

// Target Coordinates Mapping for Fuse Layout
let fusePathPoints = [];
let fuseProgress = 0;

// --- ASSET MANAGEMENT ENGINE ---
function initAssetPreloading() {
const assetsToLoad = [
{ type: 'audio', element: DOM.audioTrack },
{ type: 'image', src: 'images/1.jpg' },
{ type: 'image', src: 'images/2.jpg' },
{ type: 'image', src: 'images/3.jpg' },
{ type: 'image', src: 'images/4.jpg' },
{ type: 'image', src: 'images/5.jpg' },
{ type: 'image', src: 'images/6.jpg' },
{ type: 'image', src: 'images/7.jpg' },
{ type: 'image', src: 'images/8.jpg' }
 ];

assetsToLoad.forEach(asset => {
if (asset.type === 'audio') {
asset.element.addEventListener('canplaythrough', reportAssetLoaded, { once: true });
// Fallback for asset loaded logic if already loaded natively
if (asset.element.readyState >= 4) reportAssetLoaded();
} else {
const img = new Image();
img.src = asset.src;
img.onload = reportAssetLoaded;
img.onerror = reportAssetLoaded; // Advance pool despite structural loss
}
});
}

function reportAssetLoaded() {
STATE.assetsLoaded++;
const pct = Math.floor((STATE.assetsLoaded / STATE.totalAssets) * 100);
DOM.loaderBar.style.width = ${pct}%; DOM.loaderStatus.textContent =Assembling magic... ${pct}%;

if (STATE.assetsLoaded >= STATE.totalAssets) {
setTimeout(transitionFromLoader, 800);
}
}

function transitionFromLoader() {
DOM.loaderScreen.style.opacity = '0';
setTimeout(() => {
DOM.loaderScreen.classList.add('hidden');
DOM.interactionStage.classList.add('visible-flex');
initializeCanvasLayouts();
}, 1000);
}

// --- CANVAS GEOMETRY INITIALIZATION ---
function initializeCanvasLayouts() {
resizeCanvases();
window.addEventListener('resize', resizeCanvases);

// Design layout points for fuse channel drawing
const w = DOM.fuseCanvas.width;
const h = DOM.fuseCanvas.height;

// Smooth Bezier path tracking toward destination center
fusePathPoints = [];
const p1 = { x: 30, y: h / 2 };
const p2 = { x: w * 0.4, y: h * 0.2 };
const p3 = { x: w * 0.7, y: h * 0.8 };
const p4 = { x: w - 10, y: h / 2 };

// Compute sampled steps across path
for (let t = 0; t <= 1; t += 0.005) {
const x = Math.pow(1-t, 3)p1.x + 3Math.pow(1-t, 2)tp2.x + 3*(1-t)*Math.pow(t, 2)*p3.x + Math.pow(t, 3)p4.x;
const y = Math.pow(1-t, 3)p1.y + 3Math.pow(1-t, 2)tp2.y + 3(1-t)*Math.pow(t, 2)*p3.y + Math.pow(t, 3)*p4.y;
fusePathPoints.push({ x, y, burned: false });
}

// Kickstart primary runtime loop
requestAnimationFrame(runtimeEngineLoop);
}

function resizeCanvases() {
DOM.bgCanvas.width = window.innerWidth;
DOM.bgCanvas.height = window.innerHeight;

const rect = DOM.fuseCanvas.getBoundingClientRect();
DOM.fuseCanvas.width = rect.width;
DOM.fuseCanvas.height = rect.height;
}

// --- PHYSICALLY BASED STRIKE ENGINE ---
function setupInteractionEngine() {
const triggerStart = (e) => {
if (STATE.ignited) return;
const pointer = e.touches ? e.touches[0] : e;
dragProps.isDragging = true;

const stickRect = DOM.matchstick.getBoundingClientRect();
dragProps.startX = pointer.clientX - stickRect.left;
dragProps.startY = pointer.clientY - stickRect.top;

dragProps.lastX = pointer.clientX;
dragProps.lastY = pointer.clientY;
};

const triggerMove = (e) => {
if (!dragProps.isDragging || STATE.ignited) return;
const pointer = e.touches ? e.touches[0] : e;

// Target tracking limits boundary handling
let x = pointer.clientX - dragProps.startX;
let y = pointer.clientY - dragProps.startY;

DOM.matchstick.style.left = ${x}px; DOM.matchstick.style.top = ``${y}px;

// Calculate motion vector friction metrics
const dx = pointer.clientX - dragProps.lastX;
const dy = pointer.clientY - dragProps.lastY;
dragProps.velocity = Math.sqrt(dxdx + dydy);

// Detect matchhead hitting friction strip bounding space
checkFrictionStrikeIntersection(pointer.clientX, pointer.clientY);

dragProps.lastX = pointer.clientX;
dragProps.lastY = pointer.clientY;
};

const triggerEnd = () => {
dragProps.isDragging = false;
};

DOM.matchstick.addEventListener('mousedown', triggerStart);
window.addEventListener('mousemove', triggerMove);
window.addEventListener('mouseup', triggerEnd);

DOM.matchstick.addEventListener('touchstart', triggerStart, {passive: false});
window.addEventListener('touchmove', triggerMove, {passive: false});
window.addEventListener('touchend', triggerEnd);
}
setupInteractionEngine();

function checkFrictionStrikeIntersection(pX, pY) {
const r = DOM.strikerSurface.getBoundingClientRect();
if (pX >= r.left && pX <= r.right && pY >= r.top && pY <= r.bottom) {
// Friction requirement check threshold
if (dragProps.velocity > 18) {
executeMatchIgnition(pX, pY);
} else if (dragProps.velocity > 4) {
// Create minor cold contact spark trails
generateSparksPool(pX, pY, 3);
}
}
}

// --- IGNITION MODALITY EVENT ---
function executeMatchIgnition(x, y) {
STATE.ignited = true;
dragProps.isDragging = false;

// Anchor matchstick firmly onto fuse start origin vector position
const canvasRect = DOM.fuseCanvas.getBoundingClientRect();
const targetOriginPoint = fusePathPoints[0];

const worldTargetX = canvasRect.left + targetOriginPoint.x;
const worldTargetY = canvasRect.top + targetOriginPoint.y;

DOM.matchstick.style.transition = "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)";
DOM.matchstick.style.left = ${worldTargetX - 8}px; DOM.matchstick.style.top = ``${worldTargetY}px;
DOM.matchstick.style.transform = "rotate(0deg)";

// Flash explosion event
triggerScreenFlashEffect();
generateSparksPool(worldTargetX, worldTargetY, 80);

// Play the sync soundtrack tracking anchor system
DOM.audioTrack.play().then(() => {
STATE.musicStarted = true;
initiateTimelineMonitor();
}).catch(err => console.log("Audio contextual trigger deferred: ", err));

// Clear constraints handling transitions post movement settling
setTimeout(() => {
DOM.matchstick.style.transition = "none";
}, 350);
}

// --- ENGINE PARTICLES GENERATOR BLOCKS ---
function generateSparksPool(x, y, count) {
for (let i = 0; i < count; i++) {
const angle = Math.random() * Math.PI * 2;
const speed = Math.random() * 6 + 2;
sparks.push({
x: x,
y: y,
vx: Math.cos(angle) * speed,
vy: Math.sin(angle) * speed - (Math.random() * 2),
life: 1.0,
decay: Math.random() * 0.03 + 0.01,
size: Math.random() * 2.5 + 1,
color: hsl(${Math.random() * 30 + 15}, 100%, ${Math.random() * 40 + 60}%)
});
}
}

function processActiveFlameEmber(x, y) {
// Generate constant active fire metrics base core components
if (Math.random() > 0.1) {
fireEmbers.push({
x: x + (Math.random() * 8 - 4),
y: y - (Math.random() * 6),
vx: (Math.random() * 1.5 - 0.75),
vy: -(Math.random() * 3 + 2),
size: Math.random() * 7 + 4,
life: 1.0,
decay: Math.random() * 0.05 + 0.03
});
}
// Generate soft passive smoke components trail layer
if (Math.random() > 0.6) {
smokePuffs.push({
x: x,
y: y - 10,
vx: (Math.random() * 0.8 - 0.4),
vy: -(Math.random() * 1.5 + 0.5),
size: Math.random() * 10 + 5,
opacity: 0.4,
life: 1.0,
decay: Math.random() * 0.02 + 0.01
});
}
}

// --- INTEGRATED GRAPHICS PROCESSING LOOP (60 FPS) ---
function runtimeEngineLoop() {
// 1. Clear backgrounds with overlay blending configurations
ctxBg.clearRect(0, 0, DOM.bgCanvas.width, DOM.bgCanvas.height);
ctxFuse.clearRect(0, 0, DOM.fuseCanvas.width, DOM.fuseCanvas.height);

renderAmbientAurora();

// 2. Compute Match stick tracking and line sequence values tracking state
if (STATE.ignited && !STATE.fuseComplete) {
const canvasRect = DOM.fuseCanvas.getBoundingClientRect();

// Increment structural resolution index
fuseProgress += 0.0035; // Controlled progression metric across calculation steps
if (fuseProgress >= 1) {
fuseProgress = 1;
STATE.fuseComplete = true;
executeFuseDetonationReveal();
}

const currentPointIndex = Math.min(
Math.floor(fuseProgress * (fusePathPoints.length - 1)),
fusePathPoints.length - 1
);

const currentTargetPoint = fusePathPoints[currentPointIndex];

// Reposition anchoring tracking matching coordinates perfectly
const worldX = canvasRect.left + currentTargetPoint.x;
const worldY = canvasRect.top + currentTargetPoint.y;

DOM.matchstick.style.left = ${worldX - 8}px; DOM.matchstick.style.top = ``${worldY}px;

processActiveFlameEmber(worldX, worldY);
generateSparksPool(worldX, worldY, 2);
}

// 3. Render structural fuse systems context
renderFuseChannelLine();

// 4. Particle processing physics stacks calculation pipelines
renderSparksPhysicsEngine();
renderEmbersPhysicsEngine();
renderSmokePhysicsEngine();
renderCelebrationPhysicsEngine();

requestAnimationFrame(runtimeEngineLoop);
}

function renderAmbientAurora() {
const w = DOM.bgCanvas.width;
const h = DOM.bgCanvas.height;

// Aurora Gradient Shading simulation calculation pass
const time = Date.now() * 0.0008;
const shiftX = Math.sin(time) * 40;
const shiftY = Math.cos(time * 0.8) * 30;

let gradient = ctxBg.createRadialGradient(
w * 0.5 + shiftX, h * 0.3 + shiftY, 10,
w * 0.5, h * 0.5, Math.max(w, h) * 0.8
);
gradient.addColorStop(0, '#1c082e');
gradient.addColorStop(0.5, '#0e0419');
gradient.addColorStop(1, varStyle('--bg-dark'));

ctxBg.fillStyle = gradient;
ctxBg.fillRect(0, 0, w, h);

// Render continuous drift layer of micro stardust fields particles
if (Math.random() > 0.85) {
celebratoryElements.push({
type: 'dust',
x: Math.random() * w,
y: h + 10,
vx: (Math.random() * 0.4 - 0.2),
vy: -(Math.random() * 0.8 + 0.3),
size: Math.random() * 1.8 + 0.5,
alpha: Math.random() * 0.5 + 0.2,
color: '#ff75a0'
});
}
}

function renderFuseChannelLine() {
if (fusePathPoints.length === 0) return;

const total = fusePathPoints.length;
const targetBurnedCount = Math.floor(fuseProgress * total);

// Draw unburned fuse core baseline shadow layer
ctxFuse.beginPath();
ctxFuse.lineWidth = 4;
ctxFuse.strokeStyle = '#2b1b17';
ctxFuse.lineCap = 'round';
ctxFuse.lineJoin = 'round';
fusePathPoints.forEach((pt, idx) => {
if (idx === 0) ctxFuse.moveTo(pt.x, pt.y);
else ctxFuse.lineTo(pt.x, pt.y);
});
ctxFuse.stroke();

// Draw textured glowing layer for active elements pathing
ctxFuse.beginPath();
ctxFuse.lineWidth = 2.5;
ctxFuse.strokeStyle = '#d9ae6c';
fusePathPoints.forEach((pt, idx) => {
if (idx >= targetBurnedCount) {
if (idx === targetBurnedCount) ctxFuse.moveTo(pt.x, pt.y);
else ctxFuse.lineTo(pt.x, pt.y);
}
});
ctxFuse.stroke();

// Mask ash pathing layer dynamically over computed segment values
if (targetBurnedCount > 0) {
ctxFuse.beginPath();
ctxFuse.lineWidth = 3;
ctxFuse.strokeStyle = 'rgba(12, 12, 12, 0.85)';
ctxFuse.setLineDash([2, 2]);
for(let i=0; i<targetBurnedCount; i++){
if(i===0) ctxFuse.moveTo(fusePathPoints[i].x, fusePathPoints[i].y);
else ctxFuse.lineTo(fusePathPoints[i].x, fusePathPoints[i].y);
}
ctxFuse.stroke();
ctxFuse.setLineDash([]); // Reset structure context map constraints definition
}
}

function renderSparksPhysicsEngine() {
for (let i = sparks.length - 1; i >= 0; i--) {
const s = sparks[i];
s.x += s.vx;
s.y += s.vy;
s.vy += 0.08; // Gravity mapping component vector
s.life -= s.decay;

if (s.life <= 0) {
sparks.splice(i, 1);
continue;
}

ctxBg.beginPath();
ctxBg.fillStyle = s.color;
ctxBg.globalAlpha = s.life;
ctxBg.arc(s.x, s.y, s.size, 0, Math.PI * 2);
ctxBg.fill();
}
ctxBg.globalAlpha = 1.0; // Reset canvas core parameters state layout
}

function renderEmbersPhysicsEngine() {
for (let i = fireEmbers.length - 1; i >= 0; i--) {
const e = fireEmbers[i];
e.x += e.vx;
e.y += e.vy;
e.life -= e.decay;

if (e.life <= 0) {
fireEmbers.splice(i, 1);
continue;
}

// Draw multiple layering system calculations to construct deep organic flames
ctxBg.beginPath();
let grad = ctxBg.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size);
grad.addColorStop(0, 'rgba(255, 255, 255, ' + e.life + ')');
grad.addColorStop(0.2, 'rgba(252, 163, 17, ' + e.life * 0.8 + ')');
grad.addColorStop(0.6, 'rgba(255, 117, 160, ' + e.life * 0.4 + ')');
grad.addColorStop(1, 'rgba(74, 28, 109, 0)');

ctxBg.fillStyle = grad;
ctxBg.arc(e.x, e.y, e.size * 1.5, 0, Math.PI * 2);
ctxBg.fill();
}
}

function renderSmokePhysicsEngine() {
ctxBg.save();
for (let i = smokePuffs.length - 1; i >= 0; i--) {
const p = smokePuffs[i];
p.x += p.vx;
p.y += p.vy;
p.size += 0.15; // Smooth ambient growth expansion mapping over time scale
p.life -= p.decay;

if (p.life <= 0) {
smokePuffs.splice(i, 1);
continue;
}

ctxBg.beginPath();
ctxBg.globalAlpha = p.life * p.opacity;
ctxBg.fillStyle = '#3a2b47';
ctxBg.arc(p.x, p.y, p.size, 0, Math.PI * 2);
ctxBg.fill();
}
ctxBg.restore();
}

function renderCelebrationPhysicsEngine() {
const w = DOM.bgCanvas.width;
const h = DOM.bgCanvas.height;

for (let i = celebratoryElements.length - 1; i >= 0; i--) {
const el = celebratoryElements[i];

el.x += el.vx;
el.y += el.vy;

if (el.type === 'dust') {
el.alpha -= 0.002;
if (el.alpha <= 0 || el.y < -10) { celebratoryElements.splice(i, 1); continue; }
ctxBg.beginPath();
ctxBg.fillStyle = el.color;
ctxBg.globalAlpha = el.alpha;
ctxBg.arc(el.x, el.y, el.size, 0, Math.PI * 2);
ctxBg.fill();
}
else if (el.type === 'confetti') {
el.vy += 0.06; // Weight calculation assignment parameter
el.rotation += el.rotationSpeed;
el.life -= 0.01;
if (el.life <= 0 || el.y > h + 10) { celebratoryElements.splice(i, 1); continue; }

ctxBg.save();
ctxBg.translate(el.x, el.y);
ctxBg.rotate(el.rotation);
ctxBg.fillStyle = el.color;
ctxBg.globalAlpha = el.life;
ctxBg.fillRect(-el.size/2, -el.size/2, el.size, el.size);
ctxBg.restore();
}
else if (el.type === 'heart') {
el.alpha -= 0.006;
if (el.alpha <= 0) { celebratoryElements.splice(i, 1); continue; }
ctxBg.save();
ctxBg.translate(el.x, el.y);
ctxBg.scale(el.scale, el.scale);
ctxBg.globalAlpha = el.alpha;
ctxBg.fillStyle = el.color;

// Draw pure mathematical bezier vector mapping definition for standard layout heart shape
ctxBg.beginPath();
ctxBg.moveTo(0, 0);
ctxBg.bezierCurveTo(-5, -5, -10, 0, 0, 8);
ctxBg.bezierCurveTo(10, 0, 5, -5, 0, 0);
ctxBg.fill();
ctxBg.restore();
}
}
ctxBg.globalAlpha = 1.0;
}

// --- FUSE TERMINATION -> REVEAL SWITCH PHASE ---
function executeFuseDetonationReveal() {
DOM.matchstick.classList.add('hidden');

// Trigger localized layout visual shake sequence framework action rules
const canvasRect = DOM.fuseCanvas.getBoundingClientRect();
const endingVectorX = canvasRect.left + fusePathPoints[fusePathPoints.length - 1].x;
const endingVectorY = canvasRect.top + fusePathPoints[fusePathPoints.length - 1].y;

triggerScreenFlashEffect();
generateSparksPool(endingVectorX, endingVectorY, 120);

setTimeout(() => {
DOM.interactionStage.classList.remove('visible-flex');
DOM.interactionStage.classList.add('hidden');

DOM.giftStage.classList.add('visible-flex');
// Initiate active gift presentation loop trigger rules
setTimeout(() => {
DOM.giftBox.classList.add('shake');
setupGiftSelectionHandler();
}, 400);
}, 600);
}

function setupGiftSelectionHandler() {
DOM.giftBox.addEventListener('click', () => {
if (STATE.giftOpened) return;
STATE.giftOpened = true;

DOM.giftBox.classList.remove('shake');
DOM.giftBox.classList.add('open');

// Massive burst emission event configuration
const r = DOM.giftBox.getBoundingClientRect();
const cX = r.left + r.width / 2;
const cY = r.top + r.height / 2;

triggerScreenFlashEffect();
sp