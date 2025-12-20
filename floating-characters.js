/**
 * FLOATING CHARACTERS EFFECT
 * Vanilla JavaScript implementation with random characters
 * Similar to Matrix-style falling code but with wave animations
 */

class FloatingCharacters {
    constructor() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'floating-chars-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.opacity = '1';
        
        document.body.insertBefore(this.canvas, document.body.firstChild);
        
        this.ctx = this.canvas.getContext('2d');
        this.characters = [];
        
        // Configuration
        this.gridSize = 80; // Distance between characters - increased to reduce density
        this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*+=<>[]{}()';
        this.waveSpeed = 0.05;
        this.waveAmplitude = 40; // Increased wave amplitude for more randomness
        this.time = 0;
        
        // Bind methods
        this.resize = this.resize.bind(this);
        this.animate = this.animate.bind(this);
        
        // Initialize
        window.addEventListener('resize', this.resize);
        this.resize();
        this.createCharacters();
        this.animate();
    }
    
    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.createCharacters();
    }
    
    createCharacters() {
        this.characters = [];
        const cols = Math.ceil(this.width / this.gridSize);
        const rows = Math.ceil(this.height / this.gridSize);
        
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                // Add random offset to break grid pattern
                const randomOffsetX = (Math.random() - 0.5) * 30;
                const randomOffsetY = (Math.random() - 0.5) * 30;
                
                this.characters.push({
                    x: x * this.gridSize + randomOffsetX,
                    y: y * this.gridSize + randomOffsetY,
                    baseY: y * this.gridSize + randomOffsetY,
                    char: this.chars[Math.floor(Math.random() * this.chars.length)],
                    changeInterval: Math.random() * 100 + 50,
                    changeCounter: 0,
                    gridX: x,
                    gridY: y,
                    opacity: Math.random() * 0.6 + 0.3,
                    size: Math.random() * 4 + 12,
                    phaseOffset: Math.random() * Math.PI * 2 // Random phase for wave
                });
            }
        }
    }
    
    drawCharacters() {
        // Get current theme
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        this.characters.forEach(char => {
            // Wave animation with phase offset for more randomness
            const waveX = Math.sin((char.gridY + this.time + char.phaseOffset) * 0.3) * this.waveAmplitude;
            const waveY = Math.sin((char.gridX + this.time + char.phaseOffset) * 0.5) * this.waveAmplitude;
            
            const finalX = char.x + waveX;
            const finalY = char.baseY + waveY;
            
            // Change character randomly
            char.changeCounter++;
            if (char.changeCounter > char.changeInterval) {
                char.char = this.chars[Math.floor(Math.random() * this.chars.length)];
                char.changeCounter = 0;
                char.changeInterval = Math.random() * 100 + 50;
            }
            
            // Draw character with theme-aware color
            this.ctx.font = `${char.size}px monospace`;
            if (isDark) {
                // Light characters for dark mode
                this.ctx.fillStyle = `rgba(255, 255, 255, ${char.opacity * 0.15})`;
            } else {
                // Dark characters for light mode - increased visibility
                this.ctx.fillStyle = `rgba(100, 116, 139, ${char.opacity * 0.25})`;
            }
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(char.char, finalX, finalY);
        });
    }
    
    animate() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Update time
        this.time += this.waveSpeed;
        
        // Draw characters
        this.drawCharacters();
        
        requestAnimationFrame(this.animate);
    }
    
    destroy() {
        window.removeEventListener('resize', this.resize);
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Initialize floating characters when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    new FloatingCharacters();
});
