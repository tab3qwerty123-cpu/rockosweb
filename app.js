/**
 * ROCKos Web Sitesi Etkileşim Scripti
 */

document.addEventListener("DOMContentLoaded", () => {
    const themeToggleBtn = document.getElementById("theme-toggle");
    const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');

    // Mevcut aktif temayı belirle (pinned tema varsa o, yoksa sistem tercihi)
    function getCurrentTheme() {
        const savedTheme = localStorage.getItem("color-scheme");
        if (savedTheme === "light" || savedTheme === "dark") {
            return savedTheme;
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    // Temayı sayfaya uygula ve kaydet
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

    // Tema butonu tıklama olayı
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const current = getCurrentTheme();
            const nextTheme = current === "dark" ? "light" : "dark";
            setTheme(nextTheme);
        });
    }

    // Sistem düzeyinde tema değiştiğinde (eğer kullanıcı sabitlemediyse) eşitle
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        if (!localStorage.getItem("color-scheme")) {
            const newSystemTheme = e.matches ? "dark" : "light";
            document.documentElement.setAttribute("data-theme", newSystemTheme);
            if (colorSchemeMeta) {
                colorSchemeMeta.content = newSystemTheme;
            }
        }
    });

    // Bağlantılarda pürüzsüz kaydırma efekti (Fallback için JS desteği)
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
});
