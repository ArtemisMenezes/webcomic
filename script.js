const totalPages = 8;
let currentPage = 1;

const comicImage = document.getElementById('comic-image');
const pageNumberDisplay = document.getElementById('page-number');
const progressFill = document.getElementById('progress-fill');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');

const viewport = document.querySelector('.viewport');
const bus = document.getElementById('bus-interativo');
const holdBtn = document.getElementById('hold-btn');
const holdProgress = holdBtn.querySelector('.hold-progress');

function updatePage() {
    comicImage.style.opacity = 0;
    
    setTimeout(() => {
        comicImage.src = `${currentPage}.png`; 
        comicImage.style.opacity = 1;
        
        // Regra da Página 2
        if (currentPage === 2) {
            bus.style.display = 'block';
            bus.style.left = '7%'; 
            bus.style.top = '55%';
            bus.style.bottom = 'auto'; // Garante que não há conflito de CSS
        } else if (currentPage === 4) {
            bus.style.display = 'none';
            holdBtn.style.display = 'block';
            desafioConcluido = false; 
            isHoldingBtn = false;
            holdProgress.style.transition = 'none'; // Tira a animação para resetar instantâo
            holdProgress.style.width = '0%';
            holdBtn.classList.remove('sucesso');
            holdBtn.querySelector('.hold-text').textContent = "Segure para Ajudar!";
        }else {
            bus.style.display = 'none';
        }
    }, 200);

    pageNumberDisplay.textContent = currentPage;
    progressFill.style.width = `${(currentPage / totalPages) * 100}%`;

    prevBtn.style.visibility = (currentPage === 1) ? 'hidden' : 'visible';
    nextBtn.style.visibility = (currentPage === totalPages) ? 'hidden' : 'visible';
}

nextBtn.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; updatePage(); } });
prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; updatePage(); } });

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextBtn.click();
    if (e.key === 'ArrowLeft') prevBtn.click();
});

// ==========================================
// LÓGICA DE ARRASTAR DEFINITIVA (POINTER EVENTS)
// ==========================================
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

// Bloqueia o "fantasma" do navegador
bus.ondragstart = () => false;

// 1. QUANDO VOCÊ CLICA NO ÔNIBUS
bus.onpointerdown = function(e) {
    e.preventDefault();
    isDragging = true;
    
    // Esta linha é mágica: Obriga o navegador a rastrear o rato, mesmo que você mova muito rápido
    bus.setPointerCapture(e.pointerId);
    bus.style.cursor = 'grabbing';

    // Descobre onde exatamente você clicou dentro da imagem do ônibus
    let rect = bus.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
};

// 2. QUANDO VOCÊ MOVE O MOUSE
bus.onpointermove = function(e) {
    if (!isDragging) return;
    e.preventDefault();

    let viewportRect = viewport.getBoundingClientRect();

    // Calcula a nova posição exata
    let x = e.clientX - viewportRect.left - offsetX;
    let y = e.clientY - viewportRect.top - offsetY;

    // Aplica o movimento e garante que o CSS não bloqueia
    bus.style.left = `${x}px`;
    bus.style.top = `${y}px`;
    bus.style.bottom = 'auto'; 
};

// 3. QUANDO VOCÊ SOLTA O CLIQUE
bus.onpointerup = function(e) {
    if (!isDragging) return;
    isDragging = false;
    
    // Liberta o "raio trator" do rato
    bus.releasePointerCapture(e.pointerId);
    bus.style.cursor = 'grab';

    let busRect = bus.getBoundingClientRect();
    let viewportRect = viewport.getBoundingClientRect();
    
    // Calcula a posição em percentagem
    let topPercent = (busRect.top - viewportRect.top) / viewportRect.height;
    let leftPercent = (busRect.left - viewportRect.left) / viewportRect.width;

    // ALVO (NUVEM VERDE)
    if (topPercent < 0.6 && leftPercent > 0.1 && leftPercent < 0.65) {
        
        // SUCESSO! Vai para a página 3
        setTimeout(() => {
            if (currentPage === 2) {
                currentPage++;
                updatePage();
            }
        }, 300); 
        
    } else {
        // FALHA! Volta para a ponte
        bus.style.left = '10%';
        bus.style.top = '75%';
    }
};
// ==========================================
// LÓGICA DE SEGURAR O BOTÃO (PÁGINA 3)
// ==========================================
let holdTimer;
let isHoldingBtn = false;

// Variável para controlar se o desafio da página atual já foi vencido
let desafioConcluido = false;

function resetHoldButton() {
    // Só resetamos se o desafio NÃO foi concluído
    if (!desafioConcluido) {
        isHoldingBtn = false;
        clearTimeout(holdTimer);
        holdProgress.style.transition = 'width 0.2s'; 
        holdProgress.style.width = '0%';
        
        holdBtn.classList.remove('sucesso');
        const texto = holdBtn.querySelector('.hold-text');
        if (texto) texto.textContent = "Segure para Ajudar!";
    }
}

function startHold(e) {
    if (desafioConcluido) return; // Se já ganhou, não faz nada ao clicar de novo
    
    e.preventDefault();
    isHoldingBtn = true;

    holdProgress.style.transition = 'width 1s linear';
    holdProgress.style.width = '100%';

    holdTimer = setTimeout(() => {
        if (isHoldingBtn) {
            desafioConcluido = true; // MARCA COMO CONCLUÍDO
            
            holdBtn.classList.add('sucesso');
            holdBtn.querySelector('.hold-text').textContent = "Conseguiu!";
            
            // Espera um pouco e muda de página
            setTimeout(() => {
                if (currentPage === 3) {
                    currentPage++;
                    updatePage();
                }
            }, 800);
        }
    }, 1000); 
}

function stopHold() {
    // Se o usuário soltou mas AINDA NÃO tinha conseguido, aí sim resetamos
    if (isHoldingBtn && !desafioConcluido) {
        resetHoldButton();
    }
}
// Eventos de rato e toque no botão
holdBtn.addEventListener('mousedown', startHold);
holdBtn.addEventListener('touchstart', startHold, {passive: false});

// Se soltar o rato em qualquer lado do ecrã, ou o rato sair de cima do botão, ele cancela
document.addEventListener('mouseup', stopHold);
document.addEventListener('touchend', stopHold);
holdBtn.addEventListener('mouseleave', stopHold);
// Inicialização
updatePage();