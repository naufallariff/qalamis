// src/hooks/useSmartNavbar.ts
import { useEffect, useRef, useState } from "react";

export function useSmartNavbar(forceShow = false) {
    const [hidden, setHidden] = useState(false);
    const lastScrollY = useRef(0);
    const ticking = useRef(false);

    useEffect(() => {
        if (forceShow) {
            setHidden(false);
            return;
        }

        lastScrollY.current = window.scrollY;

        const updateNavbar = () => {
            const currentY = window.scrollY;
            const diff = currentY - lastScrollY.current;

            if (currentY <= 48) {
                setHidden(false);
            } else if (diff > 10) {
                // Scroll ke bawah -> sembunyikan
                setHidden(true);
            } else if (diff < -8) {
                // Scroll ke atas -> tampilkan kembali
                setHidden(false);
            }

            lastScrollY.current = currentY;
            ticking.current = false;
        };

        const onScroll = () => {
            if (!ticking.current) {
                window.requestAnimationFrame(updateNavbar);
                ticking.current = true;
            }
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [forceShow]);

    return hidden;
}