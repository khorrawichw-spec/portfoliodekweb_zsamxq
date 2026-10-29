
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');

if (menuToggle && menu) {
    menuToggle.addEventListener('click', function () {
        const isOpen = menu.classList.toggle('open');

        menuToggle.classList.toggle('open', isOpen);
        menuToggle.setAttribute('aria-expanded', isOpen);
    });

    menu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            menu.classList.remove('open');
            menuToggle.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

const magicCanvas = document.querySelector("#magic-canvas");
const magicContext = magicCanvas?.getContext("2d");

if (magicCanvas && magicContext) {
    const ctx = magicContext;

    const colors = [
        "#FDE68A",
        "#22D3EE", 
        "#60A5FA", 
        "#C4B5FD" 
    ];

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    let width = window.innerWidth;
    let height = window.innerHeight;
    let stars = [];
    let sparks = [];
    let rings = [];
    let animationId;

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        magicCanvas.width = width * dpr;
        magicCanvas.height = height * dpr;

        magicCanvas.style.width = width + "px";
        magicCanvas.style.height = height + "px";

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const count = Math.min(
            100,
            Math.max(40, Math.floor((width * height) / 16000))
        );

        stars = Array.from({ length: count }, createStar);

        if (reduceMotion.matches) {
            drawStaticStars();
        }
    }

    function randomColor() {
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function createStar() {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.35 + 0.08,
            drift: Math.random() * 0.3 - 0.15,
            phase: Math.random() * Math.PI * 2,
            color: randomColor()
        };
    }

    function drawSpark(x, y, size, color, alpha = 1) {
        ctx.save();

        ctx.globalAlpha = alpha;
        ctx.translate(x, y);

        ctx.shadowBlur = size * 8;
        ctx.shadowColor = color;
        ctx.fillStyle = color;

        ctx.beginPath();
        ctx.moveTo(0, -size * 2);
        ctx.lineTo(size * 0.35, -size * 0.35);
        ctx.lineTo(size * 2, 0);
        ctx.lineTo(size * 0.35, size * 0.35);
        ctx.lineTo(0, size * 2);
        ctx.lineTo(-size * 0.35, size * 0.35);
        ctx.lineTo(-size * 2, 0);
        ctx.lineTo(-size * 0.35, -size * 0.35);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    function drawStar(star, time) {
        const twinkle =
            0.35 + (Math.sin(time * 0.0015 + star.phase) + 1) * 0.3;

        ctx.save();

        ctx.globalAlpha = twinkle;
        ctx.fillStyle = star.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = star.color;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        if (star.size > 1.7) {
            drawSpark(
                star.x,
                star.y,
                star.size * 0.8,
                star.color,
                twinkle * 0.65
            );
        }
    }

    function drawStaticStars() {
        ctx.clearRect(0, 0, width, height);

        stars.forEach((star) => {
            drawStar(star, 0);
        });
    }

    function castSpell(x, y) {
       
        for (let i = 0; i < 26; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3.5 + 0.6;

            sparks.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: Math.random() * 0.018 + 0.015,
                size: Math.random() * 2.5 + 1,
                color: randomColor()
            });
        }

      
        rings.push({
            x,
            y,
            radius: 5,
            life: 1,
            color: "#FDE68A"
        });
    }

    function drawRing(ring) {
        ctx.save();

        ctx.globalAlpha = ring.life;
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 16;
        ctx.shadowColor = ring.color;

        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    function animate(time = 0) {
        ctx.clearRect(0, 0, width, height);

       
        stars.forEach((star) => {
            star.y -= star.speed;
            star.x += star.drift;

            if (star.y < -10) {
                star.y = height + 10;
                star.x = Math.random() * width;
            }

            if (star.x < -10) star.x = width + 10;
            if (star.x > width + 10) star.x = -10;

            drawStar(star, time);
        });

        for (let i = sparks.length - 1; i >= 0; i--) {
            const spark = sparks[i];

            spark.x += spark.vx;
            spark.y += spark.vy;

            spark.vx *= 0.98;
            spark.vy *= 0.98;
            spark.life -= spark.decay;

            drawSpark(
                spark.x,
                spark.y,
                spark.size,
                spark.color,
                Math.max(0, spark.life)
            );

            if (spark.life <= 0) {
                sparks.splice(i, 1);
            }
        }

       
        for (let i = rings.length - 1; i >= 0; i--) {
            const ring = rings[i];

            ring.radius += 2;
            ring.life -= 0.025;

            drawRing(ring);

            if (ring.life <= 0) {
                rings.splice(i, 1);
            }
        }

        animationId = requestAnimationFrame(animate);
    }

    let lastX = 0;
    let lastY = 0;

   
    window.addEventListener("pointermove", (event) => {
        if (reduceMotion.matches || event.pointerType === "touch") {
            return;
        }

        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;

        if (dx * dx + dy * dy > 100) {
            sparks.push({
                x: event.clientX,
                y: event.clientY,
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6,
                life: 1,
                decay: 0.045,
                size: Math.random() * 2 + 1,
                color: randomColor()
            });

            lastX = event.clientX;
            lastY = event.clientY;
        }
    });

  
    window.addEventListener("pointerdown", (event) => {
        if (!reduceMotion.matches) {
            castSpell(event.clientX, event.clientY);
        }
    });

    window.addEventListener("resize", resizeCanvas);

    resizeCanvas();

    if (!reduceMotion.matches) {
        animate();
    }

   
    reduceMotion.addEventListener("change", () => {
        cancelAnimationFrame(animationId);
        sparks = [];
        rings = [];
        resizeCanvas();

        if (!reduceMotion.matches) {
            animate();
        }
    });
}


/* */

(function () {
    const button = document.querySelector("#openColorPicker");
    const picker = document.querySelector("#backgroundColorPicker");
    const storageKey = "portfolioBackgroundColor";

    function applyColor(color) {
        if (!/^#[0-9a-f]{6}$/i.test(color)) return;

        const hex = color.slice(1);

        const r = parseInt(hex.slice(0, 2), 16) / 255;
        const g = parseInt(hex.slice(2, 4), 16) / 255;
        const b = parseInt(hex.slice(4, 6), 16) / 255;

        function linearize(value) {
            return value <= 0.04045
                ? value / 12.92
                : Math.pow((value + 0.055) / 1.055, 2.4);
        }

        const brightness =
            0.2126 * linearize(r) +
            0.7152 * linearize(g) +
            0.0722 * linearize(b);

        // พื้นหลังมืดใช้ตัวหนังสือขาว
        const isDark = brightness < 0.35;

        const textColor = isDark
            ? "#FFFFFF"
            : "rgba(0, 0, 0, 0.6)";

        const borderColor = isDark
            ? "rgba(255, 255, 255, 0.3)"
            : "rgba(0, 0, 0, 0.15)";

        const root = document.documentElement;

        // เปลี่ยนสีผ่าน CSS variables
        root.style.setProperty("--page-bg", color);
        root.style.setProperty("--text-color", textColor);
        root.style.setProperty("--muted-text-color", textColor);
        root.style.setProperty("--border-color", borderColor);

        // บังคับเปลี่ยนสีข้อความ Footer โดยตรง
        document.querySelectorAll("footer p").forEach(function (element) {
            element.style.setProperty("color", textColor, "important");
        });

        // เปลี่ยนสีข้อความชื่อ Portfolio โดยตรง
        document.querySelectorAll(".container .description").forEach(
            function (element) {
                element.style.setProperty("color", textColor, "important");
            }
        );

        // อัปเดตช่องเลือกสีและจุดแสดงสี
        if (picker) {
            picker.value = color;
        }

        const colorDot = document.querySelector(".theme-color-dot");

        if (colorDot) {
            colorDot.style.backgroundColor = color;
        }

        // บันทึกสีที่เลือก
        try {
            localStorage.setItem(storageKey, color);
        } catch (error) {
            // ระบบเปลี่ยนสียังทำงานได้แม้บันทึกไม่ได้
        }
    }

    // เรียกคืนสีเมื่อเปิดหน้าเว็บ
    try {
        const savedColor = localStorage.getItem(storageKey);

        if (savedColor) {
            applyColor(savedColor);
        }
    } catch (error) {
        // ใช้ค่าสีเริ่มต้นจาก CSS
    }

    if (!button || !picker) return;

    // เปิดหน้าต่างเลือกสี
    button.addEventListener("click", function () {
        picker.click();
    });

    // เปลี่ยนสีทันทีเมื่อเลือกสีใหม่
    picker.addEventListener("input", function () {
        applyColor(picker.value);
    });
})();




// สลับภาพคนหล่อ
// รายชื่อไฟล์รูปภาพที่ต้องการให้สลับ (แก้ไข Path ให้ถูกต้อง)
const profileImages = [
    './image/image_me1.jpg', // เช็กชื่อไฟล์ในโฟลเดอร์ให้ถูกต้อง (หากตั้งชื่อไว้ว่า image_me1.jpg.png จริงๆ ให้ใช้ชื่อเดิม)
    './image/image_me2.jpg'  // เติมจุด (.) นำหน้า /image
];

let currentImageIndex = 0;
const profileImg = document.querySelector('.profile-frame img');

// ทำงานเมื่อพบรูปภาพในหน้าเว็บ
if (profileImg) {
    setInterval(() => {
        // 1. จางรูปเดิมออก
        profileImg.classList.add('fade-out');

        // 2. เปลี่ยนรูปภาพหลังจางออก 0.5 วินาที
        setTimeout(() => {
            currentImageIndex = (currentImageIndex + 1) % profileImages.length;
            profileImg.src = profileImages[currentImageIndex];
            
            // 3. คืนค่าความสว่างรูปใหม่กลับมา
            profileImg.classList.remove('fade-out');
        }, 500); 

    }, 3500); // กำหนดเวลาสลับรูปทุกๆ 3.5 วินาที (3500ms)
}

// ===================================================
// 1. แสงไฟ Glow วิ่งตามเมาส์ทะลุกระจก (Glass Spotlight)
// ===================================================
const glowCircle = document.createElement('div');
glowCircle.className = 'glass-glow';
document.body.appendChild(glowCircle);

window.addEventListener('mousemove', (e) => {
    glowCircle.style.left = `${e.clientX}px`;
    glowCircle.style.top = `${e.clientY}px`;
});

// ===================================================
// 2. เอฟเฟกต์การ์ดเอียง 3D ตามตำแหน่งเมาส์ (3D Card Tilt)
// ===================================================
const mainCard = document.querySelector('.card-main');

if (mainCard) {
    mainCard.addEventListener('mousemove', (e) => {
        const rect = mainCard.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // คำนวณมุมเอียง (สูงสุดประมาณ 8 องศาเพื่อความสบายตา)
        const rotateX = (-y / rect.height) * 8;
        const rotateY = (x / rect.width) * 8;

        mainCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
        mainCard.style.transition = 'transform 0.1s ease-out';
    });

    // เมื่อเมาส์ออกจากกล่อง ให้การ์ดเด้งกลับตำแหน่งเดิม
    mainCard.addEventListener('mouseleave', () => {
        mainCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        mainCard.style.transition = 'transform 0.5s ease';
    });
}

// ===================================================
// 3. เอฟเฟกต์พิมพ์ข้อความอัตโนมัติ (Typewriter Effect)
// ===================================================
const taglineEl = document.querySelector('.profile-tagline');

if (taglineEl) {
    const textToType = "Web Developer & UI/UX Learner";
    taglineEl.textContent = ""; // ล้างข้อความเดิมออกก่อน
    let charIndex = 0;

    function typeWriter() {
        if (charIndex < textToType.length) {
            taglineEl.textContent += textToType.charAt(charIndex);
            charIndex++;
            setTimeout(typeWriter, 60); // ความเร็วการพิมพ์ (ms)
        }
    }

    // เริ่มพิมพ์หลังจากเปิดหน้าเว็บ 0.4 วินาที
    setTimeout(typeWriter, 400);
}
