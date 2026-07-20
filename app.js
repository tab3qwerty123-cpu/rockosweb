/**
 * ROCKos Web Sitesi Etkileşim Scripti
 */

document.addEventListener("DOMContentLoaded", () => {
    // --- Tema Değiştirme Mantığı ---
    const themeToggleBtn = document.getElementById("theme-toggle");
    const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');

    function getCurrentTheme() {
        const savedTheme = localStorage.getItem("color-scheme");
        if (savedTheme === "light" || savedTheme === "dark") {
            return savedTheme;
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    function setTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        if (colorSchemeMeta) {
            colorSchemeMeta.content = theme;
        }
        localStorage.setItem("color-scheme", theme);
    }

    // İlk yüklemede arayüz durumunu eşitle
    const initialTheme = getCurrentTheme();
    document.documentElement.setAttribute("data-theme", initialTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const current = getCurrentTheme();
            const nextTheme = current === "dark" ? "light" : "dark";
            setTheme(nextTheme);
        });
    }

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        if (!localStorage.getItem("color-scheme")) {
            const newSystemTheme = e.matches ? "dark" : "light";
            document.documentElement.setAttribute("data-theme", newSystemTheme);
            if (colorSchemeMeta) {
                colorSchemeMeta.content = newSystemTheme;
            }
        }
    });

    // --- Pürüzsüz Kaydırma (Smooth Scroll) ---
    const links = document.querySelectorAll('a[href^="#"]');
    for (const link of links) {
        link.addEventListener("click", function(e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#") return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    }

    // --- İnteraktif Masaüstü Turu (Mockup Tab Switcher) ---
    const tabButtons = document.querySelectorAll(".mockup-tab-btn");
    const tabContents = document.querySelectorAll(".mockup-tab-content");

    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetTab = button.getAttribute("data-tab");

            // Buton aktiflik durumlarını güncelle
            tabButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            // İçerik aktiflik durumlarını güncelle
            tabContents.forEach(content => {
                content.classList.remove("active");
                if (content.id === `tab-${targetTab}`) {
                    content.classList.add("active");
                }
            });
        });
    });
});
