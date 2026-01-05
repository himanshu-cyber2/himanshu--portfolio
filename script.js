const canvas = document.querySelector('#bg-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

const light = new THREE.PointLight(0x3b82f6, 1.5);
light.position.set(20, 20, 20);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.2));

const crystalCount = 45;
const crystals = [];
const geometry = new THREE.IcosahedronGeometry(1, 0);

for(let i = 0; i < crystalCount; i++) {
    const material = new THREE.MeshPhongMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.15, wireframe: true });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set((Math.random()-0.5)*60, (Math.random()-0.5)*40, (Math.random()-0.5)*50);
    const scale = Math.random()*2 + 0.5;
    mesh.scale.set(scale, scale, scale);
    crystals.push({ mesh, rotX: (Math.random()-0.5)*0.01, rotY: (Math.random()-0.5)*0.01 });
    scene.add(mesh);
}

let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
});

function animate() {
    requestAnimationFrame(animate);
    crystals.forEach(c => { c.mesh.rotation.x += c.rotX; c.mesh.rotation.y += c.rotY; });
    camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 5 - camera.position.y) * 0.05;
    camera.lookAt(0,0,0);
    renderer.render(scene, camera);
}
animate();

// --- GSAP ANIMATIONS ---
gsap.registerPlugin(ScrollTrigger);
gsap.from(".reveal-text", { y: 100, opacity: 0, duration: 1.5, stagger: 0.1, ease: "power4.out" });
document.querySelectorAll('section').forEach(s => gsap.from(s, { opacity: 0, y: 50, scrollTrigger: { trigger: s, start: "top 80%" }}));

// --- MODAL CONTROL ---
function openProject(id) {
    const modal = document.getElementById('project-modal');
    ['aira-ui', 'expense-ui'].forEach(i => document.getElementById(i).classList.add('hidden'));
    
    if (id === 'aira') { document.getElementById('aira-ui').classList.remove('hidden'); startAira(); }
    if (id === 'expense') { document.getElementById('expense-ui').classList.remove('hidden'); renderExpenses(); }
    
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
    document.body.style.overflow = 'hidden';
}

function closeProject() {
    const modal = document.getElementById('project-modal');
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 400);
    document.body.style.overflow = 'auto';
}

// --- AIRA TYPO LOGIC ---
let airaData = { timerInt: null, start: null, keystrokes: 0, correct: 0 };
const sentences = ["Artificial intelligence is transforming global software paradigms.", "Data structures optimize computational complexity effectively."];

function startAira() {
    clearInterval(airaData.timerInt);
    airaData = { start: null, keystrokes: 0, correct: 0 };
    const text = sentences[Math.floor(Math.random() * sentences.length)];
    const disp = document.getElementById('words-display');
    disp.innerHTML = text.split(' ').map(w => `<span class="word">${w.split('').map(l => `<span class="letter">${l}</span>`).join('')}</span>`).join(' ');
    document.querySelectorAll('.word')[0].classList.add('current');
    disp.focus();
}

document.getElementById('words-display').addEventListener('keydown', (e) => {
    if (e.key === ' ') e.preventDefault();
    const curW = document.querySelector('.word.current');
    if (!curW) return;
    const letters = [...curW.querySelectorAll('.letter')];
    const typed = curW.querySelectorAll('.letter.correct, .letter.incorrect').length;

    if (!airaData.start && e.key.length === 1) {
        airaData.start = Date.now();
        airaData.timerInt = setInterval(() => {
            document.getElementById('wpm').innerText = Math.round((airaData.keystrokes / 5) / ((Date.now() - airaData.start) / 60000)) || 0;
        }, 1000);
    }

    if (e.key.length === 1 && e.key !== ' ') {
        airaData.keystrokes++;
        if (typed < letters.length) {
            const char = letters[typed];
            if (e.key === char.innerText) { char.classList.add('correct'); airaData.correct++; }
            else char.classList.add('incorrect');
        }
    } else if (e.key === ' ') {
        curW.classList.remove('current');
        const next = curW.nextElementSibling;
        if (next) next.classList.add('current');
        else { clearInterval(airaData.timerInt); alert('Session Complete'); startAira(); }
        document.getElementById('acc').innerText = Math.round((airaData.correct / airaData.keystrokes) * 100) + '%';
    }
});

// --- EXPENSE HUB LOGIC ---
let expenses = [];
function addExpense() {
    const d = document.getElementById('exp-desc').value, a = parseFloat(document.getElementById('exp-amount').value);
    if(!d || isNaN(a)) return;
    expenses.unshift({ id: Date.now(), desc: d, amount: a, date: new Date().toLocaleDateString() });
    renderExpenses();
}

function renderExpenses() {
    const list = document.getElementById('transaction-list');
    list.innerHTML = ''; let t = 0;
    expenses.forEach(e => {
        t += e.amount;
        list.innerHTML += `<div class="p-4 border-b border-white/5 flex justify-between"><span>${e.desc}</span><b>$${e.amount}</b></div>`;
    });
    document.getElementById('total-balance').innerText = `$${t.toFixed(2)}`;
}