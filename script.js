document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. SMOOTH SCROLLING FOR CTAs
    // ----------------------------------------------------
    const notifyBtn = document.getElementById('hero-cta-notify');
    const emailInput = document.getElementById('email');
    const subscribeSection = document.getElementById('subscribe');

    if (notifyBtn && subscribeSection) {
        notifyBtn.addEventListener('click', () => {
            subscribeSection.scrollIntoView({ behavior: 'smooth' });
            // Highlight/focus input after scroll completes
            setTimeout(() => {
                if (emailInput) emailInput.focus();
            }, 800);
        });
    }

    // ----------------------------------------------------
    // 2. EMAIL FORM SUBMISSION WITH SIMULATED ENDPOINT
    // ----------------------------------------------------
    const form = document.getElementById('notifyForm');
    const messageEl = document.getElementById('formMessage');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            const btn = form.querySelector('.btn-submit');
            const originalBtnContent = btn.innerHTML;

            if (email) {
                // Show loading state
                btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Securing Access...</span>';
                btn.disabled = true;
                emailInput.disabled = true;

                // Simulate high-end server connection
                setTimeout(() => {
                    // Success response styling
                    messageEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> Welcome to the inner circle. You will be notified the instant we launch.';
                    messageEl.className = 'form-message success show';
                    
                    // Reset input
                    emailInput.value = '';
                    emailInput.disabled = false;
                    
                    // Reset button
                    btn.innerHTML = originalBtnContent;
                    btn.disabled = false;

                    // Save locally for early-access tracking simulation
                    try {
                        const signups = JSON.parse(localStorage.getItem('kyra_craft_signups') || '[]');
                        if (!signups.includes(email)) {
                            signups.push(email);
                            localStorage.setItem('kyra_craft_signups', JSON.stringify(signups));
                        }
                    } catch (err) {
                        console.warn('Storage not available', err);
                    }

                    // Hide message after 6 seconds
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
    // 3. MOUSE PARALLAX ON GLOW ELEMENTS
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
    // 4. SCROLL REVEAL (INTERSECTION OBSERVER)
    // ----------------------------------------------------
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Stop observing once revealed
                }
            });
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    } else {
        // Fallback for older browsers
        revealElements.forEach(element => {
            element.classList.add('active');
        });
    }

    // ----------------------------------------------------
    // 5. LUXURY FLOATING PARTICLES CANVAS ANIMATION
    // ----------------------------------------------------
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;

        // Set dimensions
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Particle Class
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height + canvas.height; // start off-screen bottom
                this.size = Math.random() * 1.8 + 0.4;
                this.speedY = -(Math.random() * 0.7 + 0.1);
                this.speedX = Math.random() * 0.4 - 0.2;
                this.alpha = Math.random() * 0.5 + 0.1;
                this.fadeRate = Math.random() * 0.005 + 0.002;
                // Luxury gold shades
                const colors = ['#D4AF37', '#FFE082', '#FFF59D', '#FFE082'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.y += this.speedY;
                this.x += this.speedX;
                
                // Slowly wiggle
                this.speedX += Math.random() * 0.1 - 0.05;
                if (this.speedX > 0.4) this.speedX = 0.4;
                if (this.speedX < -0.4) this.speedX = -0.4;

                // Reset particle to bottom if it goes above the screen
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
                // Add soft glowing shadow around particles
                ctx.shadowBlur = 4;
                ctx.shadowColor = this.color;
                ctx.fill();
                ctx.restore();
            }
        }

        // Initialize particles count based on screen size
        const maxParticles = Math.min(60, Math.floor((canvas.width * canvas.height) / 20000));
        for (let i = 0; i < maxParticles; i++) {
            // Distribute them evenly initially
            const p = new Particle();
            p.y = Math.random() * canvas.height;
            particles.push(p);
        }

        // Loop animation
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            
            animationId = requestAnimationFrame(animate);
        }

        animate();

        // Handle page visibility to preserve battery
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(animationId);
            } else {
                animate();
            }
        });
    }
});
