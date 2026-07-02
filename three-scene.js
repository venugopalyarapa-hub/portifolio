/**
 * Three.js 3D WebGL Canvas Scene
 * Interactive Particle Sphere & Scroll-driven Camera Motion
 */

class WebGLScene {
    constructor() {
        this.canvas = document.getElementById('webgl-canvas');
        if (!this.canvas) return;

        // Colors
        this.colors = {
            dark: {
                particles: 0xec38bc, // Magenta
                stars: 0x00f2fe,     // Cyan
                ambient: 0x03001e
            },
            light: {
                particles: 0x4f46e5, // Indigo
                stars: 0x0ea5e9,     // Sky Blue
                ambient: 0xf8fafc
            }
        };

        this.currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';

        this.init();
        this.createObjects();
        this.addEventListeners();
        this.animate();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        
        // Fog to fade out far stars
        this.scene.fog = new THREE.FogExp2(
            this.colors[this.currentTheme].ambient,
            0.015
        );

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        this.camera.position.z = 8;
        this.cameraTargetY = 0;
        this.cameraTargetX = 0;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Mouse Parallax tracking
        this.mouse = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0
        };
    }

    createObjects() {
        // --- 1. Interactive Morphing Particle Sphere ---
        const sphereRadius = 2.5;
        const particleCount = 1200;
        const sphereGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const originalPositions = new Float32Array(particleCount * 3);
        const randomSpeeds = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            // Golden spiral algorithm to distribute points evenly on sphere
            const phi = Math.acos(-1 + (2 * i) / particleCount);
            const theta = Math.sqrt(particleCount * Math.PI) * phi;

            const x = sphereRadius * Math.cos(theta) * Math.sin(phi);
            const y = sphereRadius * Math.sin(theta) * Math.sin(phi);
            const z = sphereRadius * Math.cos(phi);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            originalPositions[i * 3] = x;
            originalPositions[i * 3 + 1] = y;
            originalPositions[i * 3 + 2] = z;

            randomSpeeds[i] = 0.5 + Math.random() * 2.0; // individual wave animation speeds
        }

        sphereGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.spherePositions = sphereGeometry.attributes.position;
        this.originalSpherePositions = originalPositions;
        this.randomSpeeds = randomSpeeds;

        // Particle texture
        const pTexture = this.createCircleTexture();

        // Sphere Material
        this.sphereMaterial = new THREE.PointsMaterial({
            color: this.colors[this.currentTheme].particles,
            size: 0.08,
            map: pTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particleSphere = new THREE.Points(sphereGeometry, this.sphereMaterial);
        this.scene.add(this.particleSphere);

        // Shift sphere position to the right side on desktop, center on mobile
        this.updateSphereLayout();

        // --- 2. Starfield ---
        const starCount = 1500;
        const starGeometry = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            // Distribute stars randomly in a shell around the scene
            const angle = Math.random() * Math.PI * 2;
            const radius = 15 + Math.random() * 35; 
            
            starPositions[i * 3] = Math.cos(angle) * radius * (Math.random() > 0.5 ? 1 : -1);
            starPositions[i * 3 + 1] = (Math.random() - 0.5) * 40;
            starPositions[i * 3 + 2] = (Math.random() - 0.5) * 50;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        
        this.starMaterial = new THREE.PointsMaterial({
            color: this.colors[this.currentTheme].stars,
            size: 0.05,
            map: pTexture,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.starField = new THREE.Points(starGeometry, this.starMaterial);
        this.scene.add(this.starField);
    }

    createCircleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        
        // Draw radial glow gradient circle
        const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.3, 'rgba(255,255,255,0.8)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 16, 16);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    updateSphereLayout() {
        if (window.innerWidth > 991) {
            this.particleSphere.position.x = 2.2;
            this.particleSphere.position.y = 0;
        } else {
            this.particleSphere.position.x = 0;
            this.particleSphere.position.y = 1.0; // Position sphere near the top above hero title
        }
    }

    addEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('scroll', this.onScroll.bind(this));

        // Listen for Theme Toggle custom event (dispatched in app.js)
        document.addEventListener('themeChanged', (e) => {
            this.currentTheme = e.detail.theme;
            this.updateThemeColors();
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.updateSphereLayout();
    }

    onMouseMove(event) {
        // Normalize mouse coordinates (-1 to 1)
        this.mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onScroll() {
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        
        // Track target camera values based on scroll
        // Moving camera deeper and rotating as scroll goes down
        this.cameraTargetY = -scrollPercent * 10;
        this.cameraTargetX = scrollPercent * 2;
        this.camera.position.z = 8 - scrollPercent * 4;
    }

    updateThemeColors() {
        const themeColors = this.colors[this.currentTheme];
        
        // Animate material color transitions using GSAP
        gsap.to(this.sphereMaterial.color, {
            r: new THREE.Color(themeColors.particles).r,
            g: new THREE.Color(themeColors.particles).g,
            b: new THREE.Color(themeColors.particles).b,
            duration: 0.8
        });

        gsap.to(this.starMaterial.color, {
            r: new THREE.Color(themeColors.stars).r,
            g: new THREE.Color(themeColors.stars).g,
            b: new THREE.Color(themeColors.stars).b,
            duration: 0.8
        });

        gsap.to(this.scene.fog.color, {
            r: new THREE.Color(themeColors.ambient).r,
            g: new THREE.Color(themeColors.ambient).g,
            b: new THREE.Color(themeColors.ambient).b,
            duration: 0.8
        });
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const time = Date.now() * 0.0006;

        // 1. Rotate starfield slowly
        this.starField.rotation.y = time * 0.03;
        this.starField.rotation.x = time * 0.01;

        // 2. Rotate particle sphere
        this.particleSphere.rotation.y = time * 0.15;
        this.particleSphere.rotation.z = time * 0.05;

        // 3. Morph/Deform the particle sphere (dynamic vertex noise)
        const pos = this.spherePositions.array;
        const orig = this.originalSpherePositions;
        const count = pos.length / 3;

        for (let i = 0; i < count; i++) {
            const ix = i * 3;
            const iy = i * 3 + 1;
            const iz = i * 3 + 2;

            // Simple noise calculation based on sine/cosine, time and particle index
            const waveSpeed = this.randomSpeeds[i] * 2.0;
            const offset = Math.sin(time * waveSpeed + i) * 0.08;

            // Normalize coordinate vector
            const vx = orig[ix];
            const vy = orig[iy];
            const vz = orig[iz];
            const length = Math.sqrt(vx * vx + vy * vy + vz * vz);

            // Displace along the vertex normal
            pos[ix] = orig[ix] + (vx / length) * offset;
            pos[iy] = orig[iy] + (vy / length) * offset;
            pos[iz] = orig[iz] + (vz / length) * offset;
        }
        this.spherePositions.needsUpdate = true;

        // 4. Smooth interpolation for mouse parallax (inertia)
        this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08;
        this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08;

        // Apply mouse movement to camera angle
        this.camera.position.x += (this.mouse.x * 1.5 - this.camera.position.x) * 0.05;
        // Make camera track both mouse and scroll target values
        const targetCamY = this.cameraTargetY + (this.mouse.y * 1.2);
        this.camera.position.y += (targetCamY - this.camera.position.y) * 0.05;
        
        // Point camera dynamically
        this.camera.lookAt(new THREE.Vector3(this.cameraTargetX, this.cameraTargetY / 2, 0));

        this.renderer.render(this.scene, this.camera);
    }
}

// Instantiate scene when window loads
window.addEventListener('DOMContentLoaded', () => {
    window.webglScene = new WebGLScene();
});
