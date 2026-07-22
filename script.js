document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. GLOBAL IMAGE ERROR FALLBACK (SVG RENDERER)
    // ----------------------------------------------------
    window.handleImageError = function(img) {
        const productId = img.getAttribute('data-product-id') || 'product';
        const colorId = img.getAttribute('data-color-id') || 'color';
        const src = img.getAttribute('src') || '';
        
        let index = 1;
        const match = src.match(/\/(\d+)\.webp$/);
        if (match) {
            index = match[1];
        }
        
        const cleanName = productId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const cleanColor = colorId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        
        const width = 800;
        const height = 600;
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
            <defs>
                <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#1A1A1A" />
                    <stop offset="100%" stop-color="#0E0E0E" />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#g)" stroke="#D4AF37" stroke-width="2"/>
            <g transform="translate(${width/2}, ${height/2 - 40})">
                <circle cx="0" cy="0" r="45" fill="none" stroke="#D4AF37" stroke-width="1.5" opacity="0.35"/>
                <!-- Insulated Box/Lunchbox Outline -->
                <path d="M-20,-15 L20,-15 L22,-2 L-22,-2 Z" fill="none" stroke="#D4AF37" stroke-width="1.5"/>
                <path d="M-22,-2 L-22,18 L22,18 L22,-2" fill="none" stroke="#D4AF37" stroke-width="1.5"/>
                <path d="M-8,-25 L8,-25 L10,-15 L-10,-15 Z" fill="none" stroke="#D4AF37" stroke-width="1.5"/>
                <path d="M0,-15 L0,18" fill="none" stroke="#D4AF37" stroke-width="1" stroke-dasharray="3,3" opacity="0.5"/>
            </g>
            <text x="50%" y="${height/2 + 50}" font-family="'Cinzel', serif" font-size="22" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">${cleanName.toUpperCase()}</text>
            <text x="50%" y="${height/2 + 90}" font-family="'Montserrat', sans-serif" font-size="14" font-weight="600" fill="#D4AF37" text-anchor="middle" letter-spacing="3">${cleanColor.toUpperCase()} - IMAGE ${index}</text>
            <text x="50%" y="${height/2 + 130}" font-family="'Montserrat', sans-serif" font-size="11" fill="#555" text-anchor="middle" letter-spacing="1">IMAGE COMING SOON</text>
        </svg>`;
        
        img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString);
        img.onerror = null;
    };

    window.addEventListener('error', function(event) {
        if (event.target.tagName === 'IMG') {
            window.handleImageError(event.target);
        }
    }, true);

    // Run fallback check on existing images that might have already failed
    document.querySelectorAll('img').forEach(img => {
        if (img.complete && img.naturalWidth === 0) {
            window.handleImageError(img);
        }
    });


    // ----------------------------------------------------
    // 2. STICKY HEADER & MOBILE BURGER MENU
    // ----------------------------------------------------
    const header = document.getElementById('main-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('open');
            mobileMenu.classList.toggle('open');
        });

        // Close menu when links are clicked
        mobileMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('open');
                mobileMenu.classList.remove('open');
            });
        });
    }


    // ----------------------------------------------------
    // 3. DYNAMIC PRODUCT PAGE LOADER
    // ----------------------------------------------------
    const isProductPage = document.getElementById('product-display-name') !== null;
    if (isProductPage && window.kyraProducts) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        const product = window.kyraProducts.find(p => p.id === productId);

        if (!product) {
            // Redirect to home if ID is invalid
            window.location.href = 'index.html';
            return;
        }

        // Set Title tag
        document.title = `${product.name} | KYRA CRAFT`;

        // Update basic copy details
        document.getElementById('product-display-name').innerText = product.name;
        document.getElementById('product-display-tagline').innerText = product.tagline;
        document.getElementById('product-display-desc').innerText = product.description;

        // Active States tracker
        let activeColorId = product.colors[0].id;
        let activeImageIndex = 1;

        // Render Color Swatches
        const swatchesContainer = document.getElementById('swatches-container');
        if (swatchesContainer) {
            swatchesContainer.innerHTML = product.colors.map((color, index) => `
                <button class="color-swatch-btn ${index === 0 ? 'active' : ''}" data-color-id="${color.id}">
                    <span class="swatch-color-dot" style="background-color: ${color.hex}"></span>
                    <span class="swatch-color-name">${color.name}</span>
                </button>
            `).join('');

            swatchesContainer.querySelectorAll('.color-swatch-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    swatchesContainer.querySelectorAll('.color-swatch-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    activeColorId = btn.getAttribute('data-color-id');
                    activeImageIndex = 1;
                    renderGallery();
                    updateAmazonLink();
                });
            });
        }

        // Update Amazon CTA Button Link
        function updateAmazonLink() {
            const buyCta = document.getElementById('amazon-buy-cta');
            const activeColor = product.colors.find(c => c.id === activeColorId);
            if (buyCta && activeColor) {
                buyCta.href = activeColor.amazonUrl;
            }
        }
        updateAmazonLink();

        // Render Gallery (Main view and thumbnails list)
        function renderGallery() {
            const mainImg = document.getElementById('main-product-image');
            const thumbnailsGrid = document.getElementById('product-thumbnails-grid');
            const colorVariant = product.colors.find(c => c.id === activeColorId);

            if (mainImg && colorVariant) {
                // Set main image src
                mainImg.src = `./images/${product.id}/${colorVariant.id}/${activeImageIndex}.webp`;
                mainImg.setAttribute('data-product-id', product.id);
                mainImg.setAttribute('data-color-id', colorVariant.id);
                // Call fallback immediately if img gets swapped
                mainImg.onerror = function() {
                    window.handleImageError(mainImg);
                };

                // Generate thumbnails list
                let thumbHtml = '';
                for (let i = 1; i <= colorVariant.imageCount; i++) {
                    thumbHtml += `
                        <div class="thumbnail-card ${i === activeImageIndex ? 'active' : ''}" data-image-idx="${i}">
                            <img src="./images/${product.id}/${colorVariant.id}/${i}.webp" alt="${product.name} Preview ${i}" class="thumbnail-img" data-product-id="${product.id}" data-color-id="${colorVariant.id}">
                        </div>
                    `;
                }
                thumbnailsGrid.innerHTML = thumbHtml;

                // Handle Thumbnail click events
                thumbnailsGrid.querySelectorAll('.thumbnail-card').forEach(card => {
                    card.addEventListener('click', () => {
                        thumbnailsGrid.querySelectorAll('.thumbnail-card').forEach(c => c.classList.remove('active'));
                        card.classList.add('active');
                        activeImageIndex = parseInt(card.getAttribute('data-image-idx'));
                        mainImg.src = `./images/${product.id}/${colorVariant.id}/${activeImageIndex}.webp`;
                    });
                });
            }
        }
        renderGallery();

        // Navigate Gallery (Helper for Mobile Swipe actions)
        function navigateGallery(direction) {
            const colorVariant = product.colors.find(c => c.id === activeColorId);
            if (!colorVariant) return;

            let nextIndex = activeImageIndex + direction;
            if (nextIndex > colorVariant.imageCount) nextIndex = 1;
            if (nextIndex < 1) nextIndex = colorVariant.imageCount;

            activeImageIndex = nextIndex;
            
            const thumbnailsGrid = document.getElementById('product-thumbnails-grid');
            if (thumbnailsGrid) {
                const targetCard = thumbnailsGrid.querySelector(`.thumbnail-card[data-image-idx="${activeImageIndex}"]`);
                if (targetCard) {
                    targetCard.click();
                    // Scroll thumb card into view
                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            }
        }

        // Gallery Mobile Swipe Gesture Handlers
        const zoomWrapper = document.getElementById('zoom-image-wrapper');
        if (zoomWrapper) {
            let touchstartX = 0;
            let touchendX = 0;

            zoomWrapper.addEventListener('touchstart', e => {
                touchstartX = e.changedTouches[0].screenX;
            }, { passive: true });

            zoomWrapper.addEventListener('touchend', e => {
                touchendX = e.changedTouches[0].screenX;
                // Swipe Left -> Next
                if (touchendX < touchstartX - 45) {
                    navigateGallery(1);
                }
                // Swipe Right -> Prev
                if (touchendX > touchstartX + 45) {
                    navigateGallery(-1);
                }
            }, { passive: true });
        }

        // Image Zoom Hover Effect (Desktop only)
        if (zoomWrapper && window.innerWidth > 768) {
            const mainImg = document.getElementById('main-product-image');
            zoomWrapper.addEventListener('mousemove', (e) => {
                const rect = zoomWrapper.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                mainImg.style.transformOrigin = `${x}% ${y}%`;
                mainImg.style.transform = 'scale(1.5)';
            });

            zoomWrapper.addEventListener('mouseleave', () => {
                mainImg.style.transform = 'scale(1)';
                mainImg.style.transformOrigin = 'center center';
            });
        }

        // Render Features Column Checklist
        const briefGrid = document.getElementById('brief-highlights-grid');
        if (briefGrid) {
            // Select 4 features for the brief listing next to purchase CTAs
            const highlights = product.features.slice(0, 4);
            const iconMap = [
                '<i class="fa-solid fa-shield-halved"></i>',
                '<i class="fa-solid fa-leaf"></i>',
                '<i class="fa-solid fa-droplet-slash"></i>',
                '<i class="fa-solid fa-utensils"></i>'
            ];
            briefGrid.innerHTML = highlights.map((f, i) => `
                <div class="brief-feature-card">
                    <span class="brief-feature-icon">${iconMap[i] || '<i class="fa-solid fa-circle-check"></i>'}</span>
                    <span class="brief-feature-text">${f}</span>
                </div>
            `).join('');
        }

        // Render Specifications Table
        const specsBody = document.getElementById('specs-table-body');
        if (specsBody) {
            specsBody.innerHTML = Object.entries(product.specifications).map(([label, val]) => `
                <tr>
                    <td class="specs-label">${label}</td>
                    <td class="specs-value">${val}</td>
                </tr>
            `).join('');
        }

        // Render FAQ Accordion
        const faqContainer = document.getElementById('faq-accordion-container');
        if (faqContainer) {
            faqContainer.innerHTML = product.faqs.map((faq, index) => `
                <div class="faq-item" id="faq-item-${index}">
                    <button class="faq-question-btn" data-faq-idx="${index}">
                        <span class="faq-question-text">${faq.question}</span>
                        <span class="faq-icon-arrow"><i class="fa-solid fa-chevron-down"></i></span>
                    </button>
                    <div class="faq-answer-pane" id="faq-pane-${index}">
                        <div class="faq-answer-content">${faq.answer}</div>
                    </div>
                </div>
            `).join('');

            faqContainer.querySelectorAll('.faq-question-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const item = btn.closest('.faq-item');
                    const pane = item.querySelector('.faq-answer-pane');
                    const isActive = item.classList.contains('active');

                    // Close all
                    faqContainer.querySelectorAll('.faq-item').forEach(i => {
                        i.classList.remove('active');
                        i.querySelector('.faq-answer-pane').style.maxHeight = null;
                        i.querySelector('.faq-answer-pane').style.opacity = 0;
                    });

                    // Open target if not already active
                    if (!isActive) {
                        item.classList.add('active');
                        pane.style.maxHeight = `${pane.scrollHeight}px`;
                        pane.style.opacity = 1;
                    }
                });
            });
        }

        // Render Related Products (the other two products)
        const relatedGrid = document.getElementById('related-products-grid');
        if (relatedGrid) {
            const related = window.kyraProducts.filter(p => p.id !== product.id);
            relatedGrid.innerHTML = related.map(p => `
                <div class="product-card">
                    <div class="product-card-image-wrapper">
                        <img src="./images/${p.id}/${p.colors[0].id}/1.webp" alt="${p.name}" class="product-card-img" data-product-id="${p.id}" data-color-id="${p.colors[0].id}">
                    </div>
                    <div class="product-card-info">
                        <h3 class="product-card-title">${p.name}</h3>
                        <p class="product-card-desc">${p.description.substring(0, 115)}...</p>
                        <div class="product-card-meta">
                            <div class="colors-indicator">
                                ${p.colors.map(c => `<span class="color-dot-indicator" style="background-color: ${c.hex}"></span>`).join('')}
                            </div>
                            <span class="colors-text">${p.colors.length} Colors</span>
                        </div>
                        <a href="product.html?id=${p.id}" class="btn-gold" style="width: 100%; justify-content: center; text-decoration: none;">
                            <span>View Details</span>
                            <i class="fa-solid fa-eye"></i>
                        </a>
                    </div>
                </div>
            `).join('');
        }
    }


    // ----------------------------------------------------
    // 4. EMAIL SUBSCRIPTION FORM LOGIC
    // ----------------------------------------------------
    const form = document.getElementById('notifyForm');
    const emailInput = document.getElementById('email');
    const messageEl = document.getElementById('formMessage');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            const btn = form.querySelector('.btn-submit');
            const originalBtnContent = btn.innerHTML;

            if (email) {
                btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Securing Access...</span>';
                btn.disabled = true;
                emailInput.disabled = true;

                // Simulate secure server response
                setTimeout(() => {
                    messageEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> Welcome to the inner circle. You will be notified the instant we launch.';
                    messageEl.className = 'form-message success show';
                    
                    emailInput.value = '';
                    emailInput.disabled = false;
                    
                    btn.innerHTML = originalBtnContent;
                    btn.disabled = false;

                    try {
                        const signups = JSON.parse(localStorage.getItem('kyra_craft_signups') || '[]');
                        if (!signups.includes(email)) {
                            signups.push(email);
                            localStorage.setItem('kyra_craft_signups', JSON.stringify(signups));
                        }
                    } catch (err) {
                        console.warn('Storage not available', err);
                    }

                    setTimeout(() => {
                        messageEl.className = 'form-message';
                        setTimeout(() => {
                            messageEl.innerHTML = '';
                        }, 400);
                    }, 6000);

                }, 1800);
            }
        });
    }


    // ----------------------------------------------------
    // 5. MOUSE PARALLAX ON GLOW ELEMENTS
    // ----------------------------------------------------
    const glow1 = document.getElementById('glow-1');
    const glow2 = document.getElementById('glow-2');

    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;

        if (glow1) {
            glow1.style.transform = `translate(${mouseX * 40}px, ${mouseY * 40}px)`;
        }
        if (glow2) {
            glow2.style.transform = `translate(${mouseX * -40}px, ${mouseY * -40}px)`;
        }
    });


    // ----------------------------------------------------
    // 6. SCROLL REVEAL (INTERSECTION OBSERVER)
    // ----------------------------------------------------
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.05,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    } else {
        revealElements.forEach(element => {
            element.classList.add('active');
        });
    }


    // ----------------------------------------------------
    // 7. LUXURY FLOATING PARTICLES CANVAS ANIMATION
    // ----------------------------------------------------
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height + canvas.height;
                this.size = Math.random() * 1.8 + 0.4;
                this.speedY = -(Math.random() * 0.7 + 0.1);
                this.speedX = Math.random() * 0.4 - 0.2;
                this.alpha = Math.random() * 0.5 + 0.1;
                const colors = ['#D4AF37', '#FFE082', '#FFF59D', '#FFE082'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.y += this.speedY;
                this.x += this.speedX;
                
                this.speedX += Math.random() * 0.1 - 0.05;
                if (this.speedX > 0.4) this.speedX = 0.4;
                if (this.speedX < -0.4) this.speedX = -0.4;

                if (this.y < 0) {
                    this.y = canvas.height + Math.random() * 20;
                    this.x = Math.random() * canvas.width;
                    this.speedY = -(Math.random() * 0.7 + 0.1);
                    this.alpha = Math.random() * 0.5 + 0.1;
                }
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.shadowBlur = 4;
                ctx.shadowColor = this.color;
                ctx.fill();
                ctx.restore();
            }
        }

        const maxParticles = Math.min(60, Math.floor((canvas.width * canvas.height) / 20000));
        for (let i = 0; i < maxParticles; i++) {
            const p = new Particle();
            p.y = Math.random() * canvas.height;
            particles.push(p);
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            animationId = requestAnimationFrame(animate);
        }

        animate();

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(animationId);
            } else {
                animate();
            }
        });
    }
});
