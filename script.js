document.addEventListener('DOMContentLoaded', () => {
    const aboutSection = document.getElementById('sobre');
    const body = document.body;

    // Função para verificar se a seção está visível na tela
    function checkScroll() {
        if (aboutSection) { // Garante que a seção existe
            const sectionRect = aboutSection.getBoundingClientRect();
            // Verifica se o topo da seção está visível
            // e se o fundo da seção não passou completamente da tela
            const isVisible = sectionRect.top <= window.innerHeight / 2 && sectionRect.bottom >= window.innerHeight / 2;

            if (isVisible) {
                body.classList.add('scrolled-to-about');
            } else {
                body.classList.remove('scrolled-to-about');
            }
        }
    }

    // Adiciona o evento de scroll
    window.addEventListener('scroll', checkScroll);

    // Chama a função uma vez ao carregar a página caso a seção já esteja visível
    checkScroll();
});

// --- LÓGICA DO LIGHTBOX ---

document.addEventListener('DOMContentLoaded', () => {
    const galleryCards = document.querySelectorAll('.category-project-card');
    if (galleryCards.length === 0) return;

    const lightboxOverlay = document.getElementById('lightbox-overlay');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxVideo = document.getElementById('lightbox-video');
    const lightboxVideoSource = lightboxVideo.querySelector('source');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.getElementById('close-lightbox');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    let currentGalleryItems = []; // Itens da galeria ATUALMENTE aberta
    let currentIndex = 0;

    // Função para mostrar o lightbox com um item específico (imagem ou vídeo)
    function showLightboxMedia(item) {
        // Pausa o vídeo atual antes de mostrar o próximo item
        lightboxVideo.pause(); 
        
        if (item.type === 'video') {
            lightboxImg.classList.remove('active');
            lightboxVideo.classList.add('active');
            lightboxVideoSource.src = item.src;
            lightboxVideo.load();
            lightboxVideo.play().catch(error => console.log("Autoplay bloqueado.", error));
        } else { // Assume que é imagem ou parte de uma galeria de imagens
            lightboxVideo.classList.remove('active');
            lightboxImg.classList.add('active');
            lightboxImg.src = item.src;
        }
        lightboxCaption.textContent = item.caption;
    }

    // Abre o lightbox para um CARD específico
    function openLightboxForCard(cardIndex) {
        const card = galleryCards[cardIndex];
        const cardType = card.dataset.type || 'image'; // Pega o tipo do card
        const cardCaption = card.dataset.caption || '';

        if (cardType === 'gallery') {
            // Se for uma galeria, parseia o data-gallery
            const sources = card.dataset.gallery.split(',').map(s => s.trim());
            currentGalleryItems = sources.map(src => ({ type: getTypeFromSrc(src), src: src, caption: cardCaption }));
            currentIndex = 0; // Sempre começa na primeira imagem da galeria
        } else {
            // Se for item único (image ou video)
            currentGalleryItems = [{ type: cardType, src: card.dataset.src, caption: cardCaption }];
            currentIndex = 0;
        }
        
        // Esconde/mostra botões de navegação se for galeria ou item único
        if (currentGalleryItems.length > 1) {
            prevBtn.style.display = 'block';
            nextBtn.style.display = 'block';
        } else {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        }

        showLightboxMedia(currentGalleryItems[currentIndex]);
        lightboxOverlay.classList.add('visible');
    }

    // Função auxiliar para determinar o tipo de mídia pelo src
    function getTypeFromSrc(src) {
        if (!src) return 'image';
        const videoExtensions = ['.mp4', '.webm', '.ogg']; // Adicione mais se precisar
        const ext = src.substring(src.lastIndexOf('.')).toLowerCase();
        return videoExtensions.includes(ext) ? 'video' : 'image';
    }


    function closeLightbox() {
        lightboxVideo.pause();
        lightboxOverlay.classList.remove('visible');
    }

    function showPrevItem() {
        currentIndex = (currentIndex - 1 + currentGalleryItems.length) % currentGalleryItems.length;
        showLightboxMedia(currentGalleryItems[currentIndex]);
    }

    function showNextItem() {
        currentIndex = (currentIndex + 1) % currentGalleryItems.length;
        showLightboxMedia(currentGalleryItems[currentIndex]);
    }

    galleryCards.forEach((card, index) => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            openLightboxForCard(index); // Agora passamos o índice do card clicado
        });
    });

    closeBtn.addEventListener('click', closeLightbox);
    lightboxOverlay.addEventListener('click', (e) => {
        if (e.target === lightboxOverlay || e.target === lightboxImg || e.target === lightboxVideo) { // Adicionado clique na imagem/video para fechar
             closeLightbox();
        }
    });
    prevBtn.addEventListener('click', showPrevItem);
    nextBtn.addEventListener('click', showNextItem);

    document.addEventListener('keydown', (e) => {
        if (lightboxOverlay.classList.contains('visible')) {
            if (e.key === 'ArrowRight') showNextItem();
            else if (e.key === 'ArrowLeft') showPrevItem();
            else if (e.key === 'Escape') closeLightbox();
        }
    });
});