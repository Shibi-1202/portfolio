/**
 * SPACE BACKGROUND WITH STARS AND SHOOTING STARS
 * Pure JavaScript implementation - Full page coverage
 */

class SpaceBackground {
    constructor() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'space-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '0';
        this.canvas.style.pointerEvents = 'none';
        
        document.body.insertBefore(this.canvas, document.body.firstChild);
        
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.shootingStars = [];
        
        // Configuration
        this.starCount = 300;
        this.shootingStarInterval = 1500; // ms between shooting stars
        
        // Bind methods
        this.resize = this.resize.bind(this);
        this.animate = this.animate.bind(this);
        
        // Initialize
        window.addEventListener('resize', this.resize);
        this.resize();
        this.createStars();
        this.startShootingStars();
        this.animate();
    }
    
    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.createStars(); // Recreate stars on resize
    }
    
    createStars() {
        this.stars = [];
        for (let i = 0; i < this.starCount; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.5,
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }
    }
    
    createShootingStar() {
        // Random starting position from edges
        const side = Math.floor(Math.random() * 4);
        let x, y, angle;
        
        switch(side) {
            case 0: // Top
                x = Math.random() * this.width;
                y = -10;
                angle = Math.random() * 60 + 60; // 60-120 degrees
                break;
            case 1: // Right
                x = this.width + 10;
                y = Math.random() * this.height;
                angle = Math.random() * 60 + 150; // 150-210 degrees
                break;
            case 2: // Bottom
                x = Math.random() * this.width;
                y = this.height + 10;
                angle = Math.random() * 60 + 240; // 240-300 degrees
                break;
            case 3: // Left
                x = -10;
                y = Math.random() * this.height;
                angle = Math.random() * 60 + 330; // 330-390 degrees (wraps to 0-30)
                break;
        }
        
        this.shootingStars.push({
            x: x,
            y: y,
            angle: angle,
            speed: Math.random() * 3 + 5,
            length: Math.random() * 100 + 80,
            opacity: 1,
            life: 1
        });
    }
    
    startShootingStars() {
        setInterval(() => {
            this.createShootingStar();
        }, this.shootingStarInterval);
        
        // Create initial shooting stars
        this.createShootingStar();
        setTimeout(() => this.createShootingStar(), 500);
    }
    
    drawStars() {
        this.stars.forEach(star => {
            // Twinkle effect
            star.twinklePhase += star.twinkleSpeed;
            const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
            this.ctx.fill();
            
            // Add glow to some stars
            if (star.size > 1.5) {
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.size + 2, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(147, 112, 219, ${star.opacity * twinkle * 0.3})`;
                this.ctx.fill();
            }
        });
    }
    
    drawShootingStars() {
        this.shootingStars = this.shootingStars.filter(star => {
            // Update position
            const radians = (star.angle * Math.PI) / 180;
            star.x += Math.cos(radians) * star.speed;
            star.y += Math.sin(radians) * star.speed;
            
            // Fade out
            star.life -= 0.008;
            star.opacity = star.life;
            
            // Remove if out of bounds or faded
            if (star.life <= 0 || 
                star.x < -150 || star.x > this.width + 150 ||
                star.y < -150 || star.y > this.height + 150) {
                return false;
            }
            
            // Draw shooting star with gradient trail
            const endX = star.x - Math.cos(radians) * star.length;
            const endY = star.y - Math.sin(radians) * star.length;
            
            const gradient = this.ctx.createLinearGradient(star.x, star.y, endX, endY);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
            gradient.addColorStop(0.3, `rgba(147, 112, 219, ${star.opacity * 0.8})`);
            gradient.addColorStop(0.7, `rgba(102, 126, 234, ${star.opacity * 0.4})`);
            gradient.addColorStop(1, `rgba(102, 126, 234, 0)`);
            
            this.ctx.beginPath();
            this.ctx.moveTo(star.x, star.y);
            this.ctx.lineTo(endX, endY);
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2.5;
            this.ctx.stroke();
            
            // Draw bright head with glow
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = `rgba(147, 112, 219, ${star.opacity})`;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            
            return true;
        });
    }
    
    animate() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw elements
        this.drawStars();
        this.drawShootingStars();
        
        requestAnimationFrame(this.animate);
    }
    
    destroy() {
        window.removeEventListener('resize', this.resize);
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Initialize space background when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    new SpaceBackground();
});
