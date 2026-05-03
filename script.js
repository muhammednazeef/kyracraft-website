document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('notifyForm');
    const messageEl = document.getElementById('formMessage');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const emailInput = document.getElementById('email');
        const email = emailInput.value.trim();

        if (email) {
            // Simulate API call for the form submission
            const btn = form.querySelector('.btn-primary');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Processing...</span>';
            btn.disabled = true;

            setTimeout(() => {
                messageEl.textContent = 'Thank you! You will be notified when we launch.';
                messageEl.className = 'form-message success';
                emailInput.value = '';
                
                btn.innerHTML = originalText;
                btn.disabled = false;
                
                // Remove message after 5 seconds
                setTimeout(() => {
                    messageEl.style.opacity = '0';
                    setTimeout(() => {
                        messageEl.textContent = '';
                        messageEl.className = 'form-message';
                        messageEl.style.opacity = '';
                    }, 300);
                }, 5000);
            }, 1500);
        }
    });

    // Add subtle parallax effect to background glows based on mouse movement
    document.addEventListener('mousemove', (e) => {
        const glows = document.querySelectorAll('.bg-glow');
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;

        glows.forEach((glow, index) => {
            const factor = index === 0 ? 30 : -30;
            glow.style.transform = `translate(${mouseX * factor}px, ${mouseY * factor}px)`;
        });
    });
});
