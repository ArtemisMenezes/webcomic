const totalPages = 8;
let currentPage = 1;

// Seleção de elementos
const comicImage = document.getElementById('comic-image');
const pageNumberDisplay = document.getElementById('page-number');
const progressFill = document.getElementById('progress-fill');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');

const viewport = document.querySelector('.viewport');
const bus = document.getElementById('bus-interativo');
const holdBtn = document.getElementById('hold-btn');
const holdProgress = holdBtn.querySelector('.hold-progress');

// Seleção de Áudio
const soundSuccess = document.getElementById('sound-success');
const soundLoading = document.getElementById('sound-loading');

function updatePage() {
    comicImage.style.opacity = 0;
    
    setTimeout(() => {
        comicImage.src = `${currentPage}.png`; 
        comicImage.style.opacity = 1;
        
        // Regra da Página 2 (Ônibus)
        if (currentPage === 2) {
            bus.style.display = 'block';
            bus.style.left = '7%'; 
            bus.style.top = '55%';
            bus.style.bottom = 'auto';
            holdBtn.style.display = 'none';
        } 
        // Regra da Página 4 (Botão de Segurar)
        else if (currentPage === 4) {
            bus.style.display = 'none';
            holdBtn.style.display = 'block';
            desafioConcluido = false; 
            isHoldingBtn = false;
            holdProgress.style.transition = 'none'; 
            holdProgress.style.width = '0%';
            holdBtn.classList.remove('sucesso');
            holdBtn.querySelector('.hold-text').textContent = "Segure para Ajudar!";
        } else {
            bus.style.display = 'none';
            holdBtn.style.display = 'none';
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
// LÓGICA DE ARRASTAR (ÔNIBUS)
// ==========================================
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

bus.ondragstart = () => false;

bus.onpointerdown = function(e) {
    e.preventDefault();
    isDragging = true;
    bus.setPointerCapture(e.pointerId);
    bus.style.cursor = 'grabbing';
    let rect = bus.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
};

bus.onpointermove = function(e) {
    if (!isDragging) return;
    e.preventDefault();
    let viewportRect = viewport.getBoundingClientRect();
    let x = e.clientX - viewportRect.left - offsetX;
    let y = e.clientY - viewportRect.top - offsetY;
    bus.style.left = `${x}px`;
    bus.style.top = `${y}px`;
    bus.style.bottom = 'auto'; 
};

bus.onpointerup = function(e) {
    if (!isDragging) return;
    isDragging = false;
    bus.releasePointerCapture(e.pointerId);
    bus.style.cursor = 'grab';
    let busRect = bus.getBoundingClientRect();
    let viewportRect = viewport.getBoundingClientRect();
    let topPercent = (busRect.top - viewportRect.top) / viewportRect.height;
    let leftPercent = (busRect.left - viewportRect.left) / viewportRect.width;

    if (topPercent < 0.6 && leftPercent > 0.1 && leftPercent < 0.65) {
        setTimeout(() => {
            if (currentPage === 2) {
                currentPage++;
                updatePage();
            }
        }, 300); 
    } else {
        bus.style.left = '7%';
        bus.style.top = '55%';
    }
};

// ==========================================
// LÓGICA DE SEGURAR O BOTÃO (PÁGINA 4)
// ==========================================
let holdTimer;
let isHoldingBtn = false;
let desafioConcluido = false;

function resetHoldButton() {
    if (!desafioConcluido) {
        isHoldingBtn = false;
        clearTimeout(holdTimer);
        
        // Para o som de carregamento e reseta
        if(soundLoading) {
            soundLoading.pause();
            soundLoading.currentTime = 0;
        }

        holdProgress.style.transition = 'width 0.2s'; 
        holdProgress.style.width = '0%';
        holdBtn.classList.remove('sucesso');
        const texto = holdBtn.querySelector('.hold-text');
        if (texto) texto.textContent = "Segure para Ajudar!";
    }
}

function startHold(e) {
    if (desafioConcluido) return; 
    
    e.preventDefault();
    isHoldingBtn = true;

    // Toca o som de carregamento
    if(soundLoading) {
        soundLoading.play();
    }

    holdProgress.style.transition = 'width 1s linear';
    holdProgress.style.width = '100%';

    holdTimer = setTimeout(() => {
        if (isHoldingBtn) {
            desafioConcluido = true; 
            
            // Para o carregamento e toca o sucesso
            if(soundLoading) soundLoading.pause();
            if(soundSuccess) soundSuccess.play();

            holdBtn.classList.add('sucesso');
            holdBtn.querySelector('.hold-text').textContent = "Conseguiu!";
            
            setTimeout(() => {
                if (currentPage === 4) {
                    currentPage++;
                    updatePage();
                }
            }, 1200); // Tempo para ouvir o som de sucesso
        }
    }, 1000); 
}

function stopHold() {
    if (isHoldingBtn && !desafioConcluido) {
        resetHoldButton();
    }
}

holdBtn.addEventListener('mousedown', startHold);
holdBtn.addEventListener('touchstart', startHold, {passive: false});
document.addEventListener('mouseup', stopHold);
document.addEventListener('touchend', stopHold);
holdBtn.addEventListener('mouseleave', stopHold);

// Inicialização
updatePage();