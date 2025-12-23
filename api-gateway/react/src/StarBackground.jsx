import { useEffect, useRef } from "react";

export default function StarBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        resize();
        window.addEventListener("resize", resize);

        const STAR_COUNT = 120;
        const MAX_DIST = 140;

        const stars = Array.from({ length: STAR_COUNT }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.12,
            vy: (Math.random() - 0.5) * 0.12,
            r: Math.random() * 1.1 + 0.4
        }));

        let pulse = 0;

        function draw() {
            /* 🌑 FUNDO ESPACIAL MUITO ESCURO */
            ctx.fillStyle = "rgba(1, 4, 12, 0.97)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            /* 🌗 PULSO CIRCULAR SUAVE (quase imperceptível) */
            pulse += 0.008;
            const glowRadius = Math.min(canvas.width, canvas.height) * 0.65;

            const gradient = ctx.createRadialGradient(
                canvas.width / 2,
                canvas.height / 2,
                0,
                canvas.width / 2,
                canvas.height / 2,
                glowRadius
            );

            gradient.addColorStop(
                0,
                `rgba(79,70,229,${0.04 + Math.sin(pulse) * 0.015})`
            );
            gradient.addColorStop(1, "rgba(1,4,12,0)");

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            /* ✨ ESTRELAS + LINHAS */
            for (let i = 0; i < stars.length; i++) {
                const a = stars[i];

                a.x += a.vx;
                a.y += a.vy;

                if (a.x < 0 || a.x > canvas.width) a.vx *= -1;
                if (a.y < 0 || a.y > canvas.height) a.vy *= -1;

                // estrela (bem discreta)
                ctx.beginPath();
                ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(226,232,240,0.75)";
                ctx.fill();

                // linhas geométricas (muito suaves)
                for (let j = i + 1; j < stars.length; j++) {
                    const b = stars[j];
                    const d = Math.hypot(a.x - b.x, a.y - b.y);

                    if (d < MAX_DIST) {
                        ctx.strokeStyle = `rgba(99,102,241,${0.1 * (1 - d / MAX_DIST)})`;
                        ctx.lineWidth = 0.35;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(draw);
        }

        draw();

        return () => {
            window.removeEventListener("resize", resize);
        };
    }, []);

    return <canvas ref={canvasRef} />;
}

