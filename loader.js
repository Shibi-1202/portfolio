/**
 * NEURAL NETWORK LOADING ANIMATION
 * Style: 3Blue1Brown Mathematical Visualization
 * Pure Canvas, No Gradients, Flat Design
 */

class NeuralLoader {
    constructor(name = "YOUR NAME") {
        this.name = name.toUpperCase();
        this.canvas = document.getElementById('neural-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Colors with dark blue background
        this.COLORS = {
            bg: '#0a1628',           // Dark blue
            bgParticle: '#58c8ff',   // Cyan particles
            neuron: '#888888',        // Gray outline
            neuronFill: '#1a2a3a',    // Dark blue fill for inactive
            neuronActive: '#ffffff',  // White fill for active
            edgePositive: '#4a9eff',  // Blue for positive weights
            edgeNegative: '#ff6b6b',  // Red/orange for negative weights
            edgeNeutral: '#2a3a4a',   // Dark blue-gray for weak connections
            pulse: '#58c8ff',         // Bright cyan blue
            text: '#d4d4d4'           // Light gray text
        };
        
        // Network topology
        this.LAYERS = [18, 15, 10, 5];
        
        // Canvas setup with high DPI support for better clarity
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.dpr = window.devicePixelRatio || 1;
        
        // Set canvas size with device pixel ratio for crisp rendering
        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        
        // Scale context to match device pixel ratio
        this.ctx.scale(this.dpr, this.dpr);
        
        // Animation state
        this.network = [];
        this.connections = [];
        this.pulses = [];
        this.currentLetter = 0;
        this.detectedText = "";
        this.isProcessing = false;
        this.outputActivated = false;
        this.lastCycleTime = -5000; // Start immediately (negative value)
        this.cycleDelay = 1000; // ms per letter (5 seconds total for 5 letters)
        this.isFading = false;
        this.fadeAlpha = 1;
        
        // Background particles
        this.bgParticles = [];
        this.initBackgroundParticles();
        
        // Typewriter animation (only for NN output)
        this.decryptedName = '';
        this.cursorVisible = true;
        this.lastCursorBlink = 0;
        this.cursorBlinkInterval = 500; // Blink every 500ms
        
        // Bind methods
        this.animate = this.animate.bind(this);
        this.resize = this.resize.bind(this);
        
        // Initialize
        window.addEventListener('resize', this.resize);
        this.initNetwork();
        this.initConnections();
    }
    
    // Linear interpolation
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    // Controlled randomness
    jitter(base, amount) {
        return base + (Math.random() - 0.5) * amount;
    }
    
    initNetwork() {
        this.network = [];
        
        // Responsive scaling based on screen size
        const isMobile = this.width <= 768;
        const isTablet = this.width > 768 && this.width <= 1024;
        
        // Calculate layout with responsive sizing and increased layer spacing
        const networkWidth = isMobile ? this.width * 0.85 : Math.min(this.width * 0.75, 1000);
        // Adjusted height to fit mobile screens better
        const networkHeight = isMobile ? this.height * 0.5 : Math.min(this.height * 0.75, 650);
        const layerSpacing = networkWidth / (this.LAYERS.length - 1);
        const startX = (this.width - networkWidth) / 2;
        // Reduced vertical offset for mobile to keep content on screen
        const verticalOffset = isMobile ? -this.height * 0.05 : -60;
        
        this.LAYERS.forEach((nodeCount, layerIdx) => {
            const layer = [];
            // Increase spacing for first two layers (18 and 15 nodes)
            const spacingMultiplier = (layerIdx === 0 || layerIdx === 1) ? 1.2 : 1;
            const adjustedHeight = networkHeight * spacingMultiplier;
            const nodeSpacing = adjustedHeight / (nodeCount + 1);
            const startY = (this.height - adjustedHeight) / 2 + verticalOffset;
            
            for (let i = 0; i < nodeCount; i++) {
                layer.push({
                    x: startX + layerIdx * layerSpacing,
                    y: startY + (i + 1) * nodeSpacing,
                    layerIdx: layerIdx,
                    activation: 0,
                    radius: isMobile ? 6 : 7
                });
            }
            this.network.push(layer);
        });
    }
    
    initConnections() {
        this.connections = [];
        
        // Fully connected network
        for (let l = 0; l < this.network.length - 1; l++) {
            for (let i = 0; i < this.network[l].length; i++) {
                for (let j = 0; j < this.network[l + 1].length; j++) {
                    this.connections.push({
                        from: this.network[l][i],
                        to: this.network[l + 1][j],
                        weight: Math.random() - 0.5
                    });
                }
            }
        }
    }
    
    startCycle() {
        if (this.currentLetter >= this.name.length) return;
        
        this.isProcessing = true;
        this.outputActivated = false;
        
        // Reset activations
        this.network.forEach((layer, idx) => {
            if (idx > 0) {
                layer.forEach(node => node.activation = 0);
            }
        });
        
        // Activate input layer
        this.network[0].forEach(node => {
            node.activation = 0.3 + Math.random() * 0.4;
        });
        
        // Start propagation
        this.propagateLayer(0);
    }
    
    propagateLayer(layerIdx) {
        if (layerIdx >= this.network.length - 1) return;
        
        const fromLayer = this.network[layerIdx];
        const toLayer = this.network[layerIdx + 1];
        const isOutputLayer = layerIdx === this.network.length - 2;
        const isInputLayer = layerIdx === 0;
        
        // Select active nodes to propagate from
        const activeNodes = fromLayer.filter(n => n.activation > 0.2);
        
        if (isOutputLayer) {
            // For output layer: only target 1-2 specific nodes (the "recognized" letter)
            const targetNodes = [
                Math.floor(Math.random() * toLayer.length),
                Math.floor(Math.random() * toLayer.length)
            ];
            
            activeNodes.forEach(fromNode => {
                targetNodes.forEach(targetIdx => {
                    const targetNode = toLayer[targetIdx];
                    const conn = this.connections.find(
                        c => c.from === fromNode && c.to === targetNode
                    );
                    
                    if (conn) {
                        this.pulses.push({
                            from: conn.from,
                            to: conn.to,
                            progress: 0,
                            speed: 0.08, // Faster speed for output layer
                            intensity: fromNode.activation
                        });
                    }
                });
            });
        } else if (isInputLayer) {
            // For input layer: ALL active nodes send 3 pulses each
            activeNodes.forEach(fromNode => {
                // Find ALL connections from this node
                const nodeConnections = this.connections.filter(
                    c => c.from === fromNode && toLayer.includes(c.to)
                );
                
                // Select 3 strongest connections
                const selected = nodeConnections
                    .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
                    .slice(0, 2);
                
                // Create pulses (faster speed)
                selected.forEach(conn => {
                    this.pulses.push({
                        from: conn.from,
                        to: conn.to,
                        progress: 0,
                        speed: 0.08 + Math.random() * 0.02,
                        intensity: fromNode.activation
                    });
                });
            });
        } else {
            // For hidden layers: send 1 pulse per node
            // Select a subset of active nodes to prevent too many pulses
            const nodesToPropagate = activeNodes.slice(0, Math.min(10, activeNodes.length));
            
            nodesToPropagate.forEach(fromNode => {
                // Find ALL connections from this node
                const nodeConnections = this.connections.filter(
                    c => c.from === fromNode && toLayer.includes(c.to)
                );
                
                // Select only 1 strongest connection
                const selected = nodeConnections
                    .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
                    .slice(0, 1);
                
                // Create pulse (faster speed)
                selected.forEach(conn => {
                    this.pulses.push({
                        from: conn.from,
                        to: conn.to,
                        progress: 0,
                        speed: 0.08 + Math.random() * 0.02,
                        intensity: fromNode.activation
                    });
                });
            });
        }
    }
    
    updatePulses() {
        const completedLayers = new Set();
        const nodeHitCounts = new Map(); // Track how many pulses hit each node
        
        this.pulses = this.pulses.filter(pulse => {
            pulse.progress += pulse.speed;
            
            if (pulse.progress >= 1) {
                // Activate destination node - stronger activation
                const activation = pulse.intensity * 0.8;
                pulse.to.activation = Math.min(1, pulse.to.activation + activation);
                
                // Track hits per node
                const nodeKey = `${pulse.to.layerIdx}-${this.network[pulse.to.layerIdx].indexOf(pulse.to)}`;
                nodeHitCounts.set(nodeKey, (nodeHitCounts.get(nodeKey) || 0) + 1);
                
                completedLayers.add(pulse.to.layerIdx);
                
                // Check if output layer reached
                if (pulse.to.layerIdx === this.network.length - 1 && !this.outputActivated) {
                    this.outputActivated = true;
                    
                    // Add letter
                    if (this.currentLetter < this.name.length) {
                        this.detectedText += this.name[this.currentLetter];
                        this.currentLetter++;
                    }
                }
                
                return false;
            }
            return true;
        });
        
        // Propagate to next layers - ensure nodes with 2+ hits propagate
        completedLayers.forEach(layerIdx => {
            if (layerIdx < this.network.length - 1) {
                const alreadyPropagating = this.pulses.some(p => p.from.layerIdx === layerIdx);
                if (!alreadyPropagating) {
                    // Check if any nodes received 2+ pulses
                    const shouldPropagate = Array.from(nodeHitCounts.entries()).some(
                        ([key, count]) => key.startsWith(`${layerIdx}-`) && count >= 1
                    );
                    
                    if (shouldPropagate || layerIdx === 0) {
                        setTimeout(() => this.propagateLayer(layerIdx), 30);
                    }
                }
            }
        });
        
        // Check if cycle complete
        if (this.isProcessing && this.pulses.length === 0 && this.outputActivated) {
            this.isProcessing = false;
        }
    }
    
    drawConnections() {
        const isMobile = this.width <= 768;
        this.ctx.lineWidth = isMobile ? 2 : 1.5;
        
        // Draw colorful connections between adjacent layers
        this.connections.forEach(conn => {
            // Verify this is an adjacent layer connection
            if (conn.to.layerIdx === conn.from.layerIdx + 1) {
                const absWeight = Math.abs(conn.weight);
                
                // Color based on weight (3Blue1Brown style) - brighter
                if (conn.weight > 0) {
                    // Positive weights - bright blue/cyan
                    this.ctx.strokeStyle = this.COLORS.edgePositive;
                    this.ctx.globalAlpha = 0.35 + absWeight * 0.45;
                } else {
                    // Negative weights - bright red/orange
                    this.ctx.strokeStyle = this.COLORS.edgeNegative;
                    this.ctx.globalAlpha = 0.35 + absWeight * 0.45;
                }
                
                this.ctx.beginPath();
                this.ctx.moveTo(conn.from.x, conn.from.y);
                this.ctx.lineTo(conn.to.x, conn.to.y);
                this.ctx.stroke();
            }
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    drawPulses() {
        this.pulses.forEach(pulse => {
            const x = this.lerp(pulse.from.x, pulse.to.x, pulse.progress);
            const y = this.lerp(pulse.from.y, pulse.to.y, pulse.progress);
            
            // Draw bright, larger pulse
            this.ctx.fillStyle = '#ffffff';
            this.ctx.globalAlpha = 1;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Bright cyan glow
            this.ctx.fillStyle = this.COLORS.pulse;
            this.ctx.globalAlpha = 0.8;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.globalAlpha = 1;
        });
    }
    
    drawNodes() {
        const isMobile = this.width <= 768;
        this.network.forEach(layer => {
            layer.forEach(node => {
                // Bright glow for highly activated nodes
                if (node.activation > 0.4) {
                    this.ctx.fillStyle = '#58c8ff';
                    this.ctx.globalAlpha = node.activation * 0.5;
                    this.ctx.beginPath();
                    this.ctx.arc(node.x, node.y, node.radius + 8, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.globalAlpha = 1;
                }
                
                // Hollow circle design (like 3B1B)
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                
                // Fill based on activation - brighter
                if (node.activation > 0.3) {
                    // Active - bright white fill
                    this.ctx.fillStyle = this.COLORS.neuronActive;
                    this.ctx.globalAlpha = 0.85 + node.activation * 0.15;
                    this.ctx.fill();
                    this.ctx.globalAlpha = 1;
                } else if (node.activation > 0.05) {
                    // Slightly active - gray fill
                    this.ctx.fillStyle = this.COLORS.neuron;
                    this.ctx.globalAlpha = node.activation * 2.5;
                    this.ctx.fill();
                    this.ctx.globalAlpha = 1;
                } else {
                    // Inactive - dark fill
                    this.ctx.fillStyle = this.COLORS.neuronFill;
                    this.ctx.fill();
                }
                
                // Outline (always visible) - thicker on mobile
                this.ctx.strokeStyle = this.COLORS.neuron;
                this.ctx.lineWidth = isMobile ? 2 : 1.5;
                this.ctx.stroke();
                
                // Decay
                node.activation *= 0.94;
            });
        });
    }
    
    updateDecryption(timestamp) {
        // Typewriter effect - show only revealed characters
        this.decryptedName = this.detectedText;
        
        // Blink cursor
        if (timestamp - this.lastCursorBlink > this.cursorBlinkInterval) {
            this.cursorVisible = !this.cursorVisible;
            this.lastCursorBlink = timestamp;
        }
    }
    
    drawText() {
        const isMobile = this.width <= 768;
        const textY = isMobile ? this.height * 0.75 : this.height * 0.87;
        
        // Responsive font size
        const fontSize = isMobile ? 20 : 36;
        this.ctx.font = `bold ${fontSize}px sans-serif`;
        this.ctx.textAlign = 'center';
        
        // Two-line text layout
        const line1 = "You Have Entered";
        const showCursor = this.currentLetter < this.name.length && this.cursorVisible;
        const nameWithCursor = this.decryptedName + (showCursor ? '_' : '');
        const line2 = `${nameWithCursor}'s World!!`;
        
        const lineHeight = fontSize * 1.4;
        
        // Draw first line (static)
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(line1, this.width / 2, textY);
        
        // Draw second line with name highlighted
        const line2Parts = line2.split(nameWithCursor);
        const nameWidth = this.ctx.measureText(nameWithCursor).width;
        const afterWidth = this.ctx.measureText(line2Parts[1] || '').width;
        const totalWidth = this.ctx.measureText(line2).width;
        const startX = (this.width - totalWidth) / 2;
        
        // Draw name with typewriter effect (highlighted in cyan)
        this.ctx.fillStyle = this.COLORS.pulse;
        this.ctx.fillText(nameWithCursor, this.width / 2 - afterWidth / 2, textY + lineHeight);
        
        // Draw "'s World!!" (static)
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(line2Parts[1] || '', this.width / 2 + nameWidth / 2, textY + lineHeight);
    }
    
    initBackgroundParticles() {
        // Initialize floating characters instead of particles
        this.bgParticles = [];
        const isMobile = this.width <= 768;
        const gridSize = isMobile ? 100 : 80;
        const cols = Math.ceil(this.width / gridSize);
        const rows = Math.ceil(this.height / gridSize);
        
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*+=<>?';
        
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const randomOffsetX = (Math.random() - 0.5) * 30;
                const randomOffsetY = (Math.random() - 0.5) * 30;
                const randomPhase = Math.random() * Math.PI * 2;
                
                this.bgParticles.push({
                    baseX: i * gridSize + randomOffsetX,
                    baseY: j * gridSize + randomOffsetY,
                    x: i * gridSize + randomOffsetX,
                    y: j * gridSize + randomOffsetY,
                    char: characters[Math.floor(Math.random() * characters.length)],
                    size: isMobile ? 14 : 16,
                    opacity: Math.random() * 0.5 + 0.5,
                    phase: randomPhase,
                    amplitude: 40,
                    frequency: 0.001,
                    changeInterval: 3000 + Math.random() * 2000,
                    lastChange: Date.now()
                });
            }
        }
    }
    
    updateBackgroundParticles() {
        const time = Date.now();
        
        this.bgParticles.forEach(p => {
            // Wave animation
            const wave = Math.sin(p.baseY * p.frequency + time * 0.001 + p.phase) * p.amplitude;
            p.x = p.baseX + wave;
            p.y = p.baseY;
            
            // Change character randomly
            if (time - p.lastChange > p.changeInterval) {
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*+=<>?';
                p.char = characters[Math.floor(Math.random() * characters.length)];
                p.lastChange = time;
                p.changeInterval = 3000 + Math.random() * 2000;
            }
        });
    }
    
    drawBackground() {
        // Dark blue gradient background (same as main site)
        const gradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, Math.max(this.width, this.height) / 2
        );
        gradient.addColorStop(0, '#0f1f3a');
        gradient.addColorStop(1, '#0a1628');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw floating characters (same as main site)
        this.bgParticles.forEach(p => {
            this.ctx.font = `${p.size}px monospace`;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.15})`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(p.char, p.x, p.y);
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    animate(timestamp) {
        // Draw animated background
        this.drawBackground();
        this.updateBackgroundParticles();
        
        // Update decryption text
        this.updateDecryption(timestamp);
        
        // Handle fade out
        if (this.isFading) {
            this.fadeAlpha -= 0.015;
            if (this.fadeAlpha <= 0) {
                this.finish();
                return;
            }
            this.ctx.globalAlpha = this.fadeAlpha;
        } else {
            // Start new cycle
            if (!this.isProcessing && 
                this.currentLetter < this.name.length && 
                timestamp - this.lastCycleTime > this.cycleDelay) {
                this.startCycle();
                this.lastCycleTime = timestamp;
            }
            
            // Update pulses
            this.updatePulses();
            
            // Check if complete
            if (this.currentLetter >= this.name.length && 
                this.pulses.length === 0 && 
                !this.isProcessing) {
                setTimeout(() => { this.isFading = true; }, 300);
            }
        }
        
        // Draw everything
        this.drawConnections();
        this.drawPulses();
        this.drawNodes();
        this.drawText();
        
        requestAnimationFrame(this.animate);
    }
    
    finish() {
        const loader = document.getElementById('neural-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.remove();
                window.removeEventListener('resize', this.resize);
            }, 500);
        }
    }
    
    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.dpr = window.devicePixelRatio || 1;
        
        // Update canvas with device pixel ratio
        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        
        // Reset scale
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(this.dpr, this.dpr);
        
        this.initNetwork();
        this.initConnections();
        this.initBackgroundParticles();
    }
    
    start() {
        requestAnimationFrame(this.animate);
    }
}

// Initialize neural network loader on page load
window.addEventListener('DOMContentLoaded', () => {
    const loader = new NeuralLoader('SHIBI');
    loader.start();
});

// ============================================
// PORTFOLIO PAGE SCRIPTS
// ============================================

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = targetPosition - 80; // Offset for better positioning
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Form submission handler
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const name = contactForm.querySelector('input[type="text"]').value;
            const email = contactForm.querySelector('input[type="email"]').value;
            const message = contactForm.querySelector('textarea').value;
            
            // Here you would typically send the data to a server
            console.log('Form submitted:', { name, email, message });
            
            // Show success message
            alert('Thank you for your message! I will get back to you soon.');
            
            // Reset form
            contactForm.reset();
        });
    }
});

// Mobile navbar hide/show on scroll
document.addEventListener('DOMContentLoaded', () => {
    let lastScrollTop = 0;
    let scrollThreshold = 50;
    let isNavbarVisible = true;

    const verticalNavbar = document.querySelector('.vertical-navbar');

    function handleNavbarScroll() {
        // Only apply on mobile (max-width: 768px)
        if (window.innerWidth > 768) {
            if (verticalNavbar) {
                verticalNavbar.style.transform = '';
                verticalNavbar.style.opacity = '1';
            }
            return;
        }
        
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        // Scrolling down
        if (currentScroll > lastScrollTop && currentScroll > scrollThreshold) {
            if (isNavbarVisible) {
                if (verticalNavbar) {
                    verticalNavbar.style.transform = 'translateX(-50%) translateY(-100px)';
                    verticalNavbar.style.opacity = '0';
                }
                isNavbarVisible = false;
            }
        } 
        // Scrolling up
        else if (currentScroll < lastScrollTop) {
            if (!isNavbarVisible) {
                if (verticalNavbar) {
                    verticalNavbar.style.transform = 'translateX(-50%) translateY(0)';
                    verticalNavbar.style.opacity = '1';
                }
                isNavbarVisible = true;
            }
        }
        
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }

    // Throttle scroll event for better performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = window.requestAnimationFrame(() => {
            handleNavbarScroll();
        });
    }, { passive: true });

    // Handle window resize
    window.addEventListener('resize', () => {
        handleNavbarScroll();
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        } else {
            // Reset animation when element leaves viewport
            entry.target.style.opacity = '0';
            entry.target.style.transform = 'translateY(40px)';
        }
    });
}, observerOptions);

// Section observer for smooth upward motion
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        } else {
            // Reset animation when section leaves viewport
            entry.target.style.opacity = '0';
            entry.target.style.transform = 'translateY(60px)';
        }
    });
}, {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
});

// Observe all cards for animation
window.addEventListener('DOMContentLoaded', () => {
    // Animate sections - faster animation
    const sections = document.querySelectorAll('.skills, .projects, .achievements, .contact');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(60px)';
        section.style.transition = 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        sectionObserver.observe(section);
    });
    
    // Animate cards with stagger effect - faster animation
    const cards = document.querySelectorAll('.skill-card, .project-card, .achievement-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(40px)';
        card.style.transition = `opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.05}s, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.05}s`;
        cardObserver.observe(card);
    });
    
    // Lottie animations for all nav icons - with touch support
    const lottieIconLinks = document.querySelectorAll('.lottie-icon-link');
    
    lottieIconLinks.forEach(link => {
        const lottiePlayer = link.querySelector('.nav-icon-lottie');
        
        if (lottiePlayer) {
            // Mouse events for desktop
            link.addEventListener('mouseenter', () => {
                lottiePlayer.play();
            });
            
            link.addEventListener('mouseleave', () => {
                lottiePlayer.stop();
            });
            
            // Touch events for mobile/tablet
            link.addEventListener('touchstart', (e) => {
                lottiePlayer.play();
            });
            
            link.addEventListener('touchend', () => {
                setTimeout(() => {
                    lottiePlayer.stop();
                }, 300); // Small delay before stopping
            });
            
            // Click event as fallback
            link.addEventListener('click', (e) => {
                lottiePlayer.play();
                setTimeout(() => {
                    lottiePlayer.stop();
                }, 500);
            });
        }
    });
    
    // 3D cursor-following effect for the hero image
    const heroImage = document.getElementById('hero-image');
    
    if (heroImage) {
        heroImage.addEventListener('mousemove', (e) => {
            const rect = heroImage.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10; // Max 10 degrees tilt
            const rotateY = ((x - centerX) / centerX) * 10;
            
            // Apply 3D rotation with larger zoom
            heroImage.style.transform = `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.4)`;
        });
        
        heroImage.addEventListener('mouseleave', () => {
            heroImage.style.transform = 'perspective(1500px) rotateX(0deg) rotateY(0deg) scale(1)';
        });
    }
});

// ============================================
// THEME TOGGLE WITH SVG ICONS
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIconSvg = document.getElementById('theme-icon-svg');
    const html = document.documentElement;

    if (!themeToggle || !themeIconSvg) {
        console.error('Theme toggle elements not found');
        return;
    }

    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        if (themeIconSvg) {
            if (theme === 'light') {
                // Show light bulb on for light mode
                themeIconSvg.src = 'assets/animations/Light Bulb on.svg.svg';
            } else {
                // Show light bulb off for dark mode
                themeIconSvg.src = 'assets/animations/Light Bulb off.svg.svg';
            }
        }
    }
});


// ============================================
// TYPING EFFECT FOR HERO SUBTITLE
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    const typingElement = document.getElementById('typing-text');
    
    if (!typingElement) return;
    
    const texts = [
        'AI & ML Engineer | Learning • Building • Solving'
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function type() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            // Remove characters
            typingElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50; // Faster when deleting
        } else {
            // Add characters
            typingElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 150; // Normal speed when typing
        }
        
        // Check if word is complete
        if (!isDeleting && charIndex === currentText.length) {
            // Pause at end of word
            typingSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            // Move to next word
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typingSpeed = 1000; // Pause before starting new word
        }
        
        setTimeout(type, typingSpeed);
    }
    
    // Start typing effect
    type();
});
