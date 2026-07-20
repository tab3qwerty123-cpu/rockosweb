/**
 * ROCKos Web Application Main Controller
 * Features: i18n Translation Engine, User Authentication, XP/Level Engine, Forum, & Admin Rank Management
 */

document.addEventListener("DOMContentLoaded", () => {
    // --- 1. DİL / i18n YÖNETİMİ ---
    let currentLang = localStorage.getItem("app-lang") || "tr"; // Varsayılan dil Türkçe

    function switchLanguage(lang) {
        currentLang = lang;
        localStorage.setItem("app-lang", lang);
        document.getElementById("lang-text").textContent = lang.toUpperCase();

        // Tüm data-i18n etiketlerini çevir
        const elements = document.querySelectorAll("[data-i18n]");
        elements.forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (translations[lang] && translations[lang][key]) {
                if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                    el.placeholder = translations[lang][key];
                } else {
                    el.innerHTML = translations[lang][key];
                }
            }
        });

        // Dynamic Elements Re-render
        renderAuthState();
        renderForumThreads();
    }

    const langToggleBtn = document.getElementById("lang-toggle");
    if (langToggleBtn) {
        langToggleBtn.addEventListener("click", () => {
            const nextLang = currentLang === "tr" ? "en" : "tr";
            switchLanguage(nextLang);
        });
    }

    // --- 2. TEMA DEĞİŞTİRİCİ ---
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
        if (colorSchemeMeta) colorSchemeMeta.content = theme;
        localStorage.setItem("color-scheme", theme);
    }

    setTheme(getCurrentTheme());
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            setTheme(getCurrentTheme() === "dark" ? "light" : "dark");
        });
    }

    // --- 3. PÜRÜZSÜZ KAYDIRMA ---
    const links = document.querySelectorAll('a[href^="#"]');
    for (const link of links) {
        link.addEventListener("click", function(e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#") return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    }

    // --- 4. İNTERAKTİF MASAÜSTÜ TURU (Mockup Tab Switcher) ---
    const tabButtons = document.querySelectorAll(".mockup-tab-btn");
    const tabContents = document.querySelectorAll(".mockup-tab-content");

    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetTab = button.getAttribute("data-tab");
            tabButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            tabContents.forEach(content => {
                content.classList.remove("active");
                if (content.id === `tab-${targetTab}`) {
                    content.classList.add("active");
                }
            });
        });
    });

    // --- 5. ÜYELİK & OTURUM YÖNETİMİ ---
    const authButtonsArea = document.getElementById("auth-buttons-area");
    const userProfileBadge = document.getElementById("user-profile-badge");
    const userBadgeName = document.getElementById("user-badge-name");
    const userBadgeLevel = document.getElementById("user-badge-level");
    const userBadgeRole = document.getElementById("user-badge-role");
    const btnAdminPanel = document.getElementById("btn-admin-panel");

    function renderAuthState() {
        const user = dbStorage.getCurrentUser();
        const t = translations[currentLang];

        if (user) {
            authButtonsArea.style.display = "none";
            userProfileBadge.style.display = "flex";
            userBadgeName.textContent = user.username;
            userBadgeLevel.textContent = `${t.forum_level_prefix}${user.level || 1}`;

            // Role Badge styling
            userBadgeRole.textContent = (user.role || "Member").toUpperCase();
            userBadgeRole.className = `user-role-tag ${(user.role || "member").toLowerCase()}`;

            // vuskantech veya Admin yetkisi varsa Admin Butonunu göster
            if (user.username === "vuskantech" || user.role === "Admin") {
                btnAdminPanel.style.display = "inline-block";
            } else {
                btnAdminPanel.style.display = "none";
            }
        } else {
            authButtonsArea.style.display = "flex";
            userProfileBadge.style.display = "none";
        }
    }

    // Modalları Açma / Kapatma Yardımcısı
    function setupModal(modalId, openBtnId) {
        const modal = document.getElementById(modalId);
        const openBtn = document.getElementById(openBtnId);
        const closeBtn = modal ? modal.querySelector(".modal-close-btn") : null;

        if (openBtn && modal) {
            openBtn.addEventListener("click", () => modal.style.display = "flex");
        }
        if (closeBtn && modal) {
            closeBtn.addEventListener("click", () => modal.style.display = "none");
        }
        if (modal) {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) modal.style.display = "none";
            });
        }
    }

    setupModal("modal-login", "btn-open-login");
    setupModal("modal-register", "btn-open-register");
    setupModal("modal-new-thread", "btn-new-thread");
    setupModal("modal-thread-detail", null);
    setupModal("modal-admin-panel", "btn-admin-panel");

    // Modal Geçiş Bağlantıları
    const linkSwitchRegister = document.getElementById("link-switch-register");
    const linkSwitchLogin = document.getElementById("link-switch-login");

    if (linkSwitchRegister) {
        linkSwitchRegister.addEventListener("click", () => {
            document.getElementById("modal-login").style.display = "none";
            document.getElementById("modal-register").style.display = "flex";
        });
    }

    if (linkSwitchLogin) {
        linkSwitchLogin.addEventListener("click", () => {
            document.getElementById("modal-register").style.display = "none";
            document.getElementById("modal-login").style.display = "flex";
        });
    }

    // Giriş Yap Formu
    const formLogin = document.getElementById("form-login");
    if (formLogin) {
        formLogin.addEventListener("submit", (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById("login-username").value.trim();
            const passwordInput = document.getElementById("login-password").value.trim();
            const t = translations[currentLang];

            // Özel Admin Hesabı Kontrolü (vuskantech / OzanEzgi0655*)
            if (usernameInput === "vuskantech" && passwordInput === "OzanEzgi0655*") {
                let adminUser = {
                    id: "user_vuskantech",
                    username: "vuskantech",
                    role: "Admin",
                    xp: 250,
                    level: 6
                };
                dbStorage.setCurrentUser(adminUser);
                document.getElementById("modal-login").style.display = "none";
                alert(t.msg_logged_in + "vuskantech (ADMIN)");
                renderAuthState();
                return;
            }

            // Normal Kullanıcı Kontrolü
            const users = dbStorage.getUsers();
            const found = users.find(u => u.username === usernameInput && u.password === passwordInput);

            if (found) {
                dbStorage.setCurrentUser(found);
                document.getElementById("modal-login").style.display = "none";
                alert(t.msg_logged_in + found.username);
                renderAuthState();
            } else {
                alert(t.msg_invalid_creds);
            }
        });
    }

    // Kayıt Ol Formu
    const formRegister = document.getElementById("form-register");
    if (formRegister) {
        formRegister.addEventListener("submit", (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById("register-username").value.trim();
            const passwordInput = document.getElementById("register-password").value.trim();
            const t = translations[currentLang];

            const users = dbStorage.getUsers();
            if (users.some(u => u.username === usernameInput) || usernameInput === "vuskantech") {
                alert(t.msg_user_exists);
                return;
            }

            const newUser = {
                id: "user_" + Date.now(),
                username: usernameInput,
                password: passwordInput,
                role: "Member",
                xp: 0,
                level: 1,
                created_at: new Date().toISOString()
            };

            users.push(newUser);
            dbStorage.saveUsers(users);
            dbStorage.setCurrentUser(newUser);

            document.getElementById("modal-register").style.display = "none";
            alert(t.msg_registered + usernameInput);
            renderAuthState();
        });
    }

    // Çıkış Yap
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            dbStorage.setCurrentUser(null);
            alert(translations[currentLang].msg_logged_out);
            renderAuthState();
        });
    }

    // --- 6. FORUM & LIKE/DISLIKE & LEVEL YÖNETİMİ ---
    let selectedCategory = "all";

    const filterBtns = document.querySelectorAll(".forum-filter-btn");
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedCategory = btn.getAttribute("data-category");
            renderForumThreads();
        });
    });

    function renderForumThreads() {
        const container = document.getElementById("forum-threads-list");
        if (!container) return;

        let threads = dbStorage.getThreads();
        const t = translations[currentLang];

        if (selectedCategory !== "all") {
            threads = threads.filter(t => t.category === selectedCategory);
        }

        if (threads.length === 0) {
            container.innerHTML = `<div class="thread-card"><p>${t.forum_empty}</p></div>`;
            return;
        }

        container.innerHTML = threads.map(thread => {
            const currentUser = dbStorage.getCurrentUser();
            const isLiked = currentUser && thread.liked_by && thread.liked_by.includes(currentUser.username);
            const isDisliked = currentUser && thread.disliked_by && thread.disliked_by.includes(currentUser.username);

            return `
                <div class="thread-card" onclick="openThreadDetail('${thread.id}')">
                    <div class="thread-header">
                        <div class="thread-author-area">
                            <span class="user-name">${thread.author}</span>
                            <span class="user-level-tag">${t.forum_level_prefix}${thread.author_level || 1}</span>
                            <span class="user-role-tag ${(thread.author_role || "member").toLowerCase()}">${(thread.author_role || "Member").toUpperCase()}</span>
                        </div>
                        <span class="thread-category-badge">${t['forum_filter_' + thread.category] || thread.category}</span>
                    </div>
                    <h3 class="thread-title">${thread.title}</h3>
                    <p class="thread-snippet">${thread.content.length > 150 ? thread.content.substring(0, 150) + "..." : thread.content}</p>
                    <div class="thread-footer">
                        <span>${new Date(thread.created_at).toLocaleDateString()}</span>
                        <div class="thread-actions" onclick="event.stopPropagation();">
                            <button class="like-dislike-btn ${isLiked ? 'active-like' : ''}" onclick="toggleLike('${thread.id}', true)">
                                👍 <span>${thread.likes || 0}</span>
                            </button>
                            <button class="like-dislike-btn ${isDisliked ? 'active-dislike' : ''}" onclick="toggleLike('${thread.id}', false)">
                                👎 <span>${thread.dislikes || 0}</span>
                            </button>
                            <span>💬 ${thread.comments ? thread.comments.length : 0} ${t.forum_comments_count}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    }

    // Like / Dislike Tetikleyici
    window.toggleLike = function(threadId, isLike) {
        const user = dbStorage.getCurrentUser();
        const t = translations[currentLang];
        if (!user) {
            alert(t.msg_login_required);
            document.getElementById("modal-login").style.display = "flex";
            return;
        }

        let threads = dbStorage.getThreads();
        let thread = threads.find(tr => tr.id === threadId);

        if (thread) {
            thread.liked_by = thread.liked_by || [];
            thread.disliked_by = thread.disliked_by || [];

            if (isLike) {
                if (thread.liked_by.includes(user.username)) {
                    thread.liked_by = thread.liked_by.filter(u => u !== user.username);
                    thread.likes = Math.max(0, (thread.likes || 1) - 1);
                } else {
                    thread.liked_by.push(user.username);
                    thread.likes = (thread.likes || 0) + 1;
                    if (thread.disliked_by.includes(user.username)) {
                        thread.disliked_by = thread.disliked_by.filter(u => u !== user.username);
                        thread.dislikes = Math.max(0, (thread.dislikes || 1) - 1);
                    }
                    // Yazar XP Kazanır (+5 XP)
                    dbStorage.addXP(thread.author, 5);
                }
            } else {
                if (thread.disliked_by.includes(user.username)) {
                    thread.disliked_by = thread.disliked_by.filter(u => u !== user.username);
                    thread.dislikes = Math.max(0, (thread.dislikes || 1) - 1);
                } else {
                    thread.disliked_by.push(user.username);
                    thread.dislikes = (thread.dislikes || 0) + 1;
                    if (thread.liked_by.includes(user.username)) {
                        thread.liked_by = thread.liked_by.filter(u => u !== user.username);
                        thread.likes = Math.max(0, (thread.likes || 1) - 1);
                    }
                }
            }

            dbStorage.saveThreads(threads);
            renderForumThreads();
        }
    };

    // Yeni Konu Yayınlama (+20 XP)
    const formNewThread = document.getElementById("form-new-thread");
    if (formNewThread) {
        formNewThread.addEventListener("submit", (e) => {
            e.preventDefault();
            const user = dbStorage.getCurrentUser();
            const t = translations[currentLang];

            if (!user) {
                alert(t.msg_login_required);
                document.getElementById("modal-new-thread").style.display = "none";
                document.getElementById("modal-login").style.display = "flex";
                return;
            }

            const title = document.getElementById("thread-title-input").value.trim();
            const category = document.getElementById("thread-category-input").value;
            const content = document.getElementById("thread-content-input").value.trim();

            const newThread = {
                id: "thread_" + Date.now(),
                title: title,
                category: category,
                content: content,
                author: user.username,
                author_role: user.role || "Member",
                author_level: user.level || 1,
                likes: 0,
                dislikes: 0,
                liked_by: [],
                disliked_by: [],
                created_at: new Date().toISOString(),
                comments: []
            };

            let threads = dbStorage.getThreads();
            threads.unshift(newThread);
            dbStorage.saveThreads(threads);

            // +20 XP Kazandır
            dbStorage.addXP(user.username, 20);

            document.getElementById("modal-new-thread").style.display = "none";
            formNewThread.reset();
            alert(t.msg_thread_published);

            renderAuthState();
            renderForumThreads();
        });
    }

    // Konu Detayı ve Yorum Alanını Açma
    window.openThreadDetail = function(threadId) {
        const threads = dbStorage.getThreads();
        const thread = threads.find(t => t.id === threadId);
        if (!thread) return;

        const container = document.getElementById("thread-detail-container");
        const t = translations[currentLang];

        container.innerHTML = `
            <div class="thread-header">
                <div class="thread-author-area">
                    <span class="user-name">${thread.author}</span>
                    <span class="user-level-tag">${t.forum_level_prefix}${thread.author_level || 1}</span>
                    <span class="user-role-tag ${(thread.author_role || "member").toLowerCase()}">${(thread.author_role || "Member").toUpperCase()}</span>
                </div>
                <span class="thread-category-badge">${t['forum_filter_' + thread.category] || thread.category}</span>
            </div>
            <h3 class="thread-title" style="margin-top:0.8rem; font-size:1.4rem;">${thread.title}</h3>
            <p class="thread-snippet" style="font-size:1rem; margin-top:1rem;">${thread.content}</p>
            
            <hr style="border-color:var(--border-color); margin:1.5rem 0;">

            <h4>💬 ${t.forum_comments_count} (${thread.comments ? thread.comments.length : 0})</h4>
            <div class="comments-list" style="margin-top:1rem; display:flex; flex-direction:column; gap:1rem; max-height:250px; overflow-y:auto;">
                ${(thread.comments || []).map(c => `
                    <div style="background-color:light-dark(#f8fafc, #0d131f); padding:0.8rem 1rem; border-radius:8px; border:1px solid var(--border-color);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                            <div class="thread-author-area">
                                <span class="user-name" style="font-size:0.8rem;">${c.author}</span>
                                <span class="user-level-tag">${t.forum_level_prefix}${c.author_level || 1}</span>
                                <span class="user-role-tag ${(c.author_role || "member").toLowerCase()}">${(c.author_role || "Member").toUpperCase()}</span>
                            </div>
                            <span style="font-size:0.75rem; color:var(--text-secondary);">${new Date(c.created_at).toLocaleTimeString()}</span>
                        </div>
                        <p style="font-size:0.9rem; margin:0;">${c.content}</p>
                    </div>
                `).join("")}
            </div>

            <form id="form-add-comment" style="margin-top:1.5rem; display:flex; flex-direction:column; gap:0.8rem;" onsubmit="submitComment(event, '${thread.id}')">
                <textarea id="comment-text-input" rows="3" required placeholder="${t.add_comment_placeholder}"></textarea>
                <button type="submit" class="btn btn-primary btn-sm" style="align-self:flex-end;">${t.post_comment_btn}</button>
            </form>
        `;

        document.getElementById("modal-thread-detail").style.display = "flex";
    };

    // Yorum Yapma (+10 XP)
    window.submitComment = function(e, threadId) {
        e.preventDefault();
        const user = dbStorage.getCurrentUser();
        const t = translations[currentLang];

        if (!user) {
            alert(t.msg_login_required);
            document.getElementById("modal-thread-detail").style.display = "none";
            document.getElementById("modal-login").style.display = "flex";
            return;
        }

        const commentText = document.getElementById("comment-text-input").value.trim();
        let threads = dbStorage.getThreads();
        let thread = threads.find(t => t.id === threadId);

        if (thread) {
            thread.comments = thread.comments || [];
            thread.comments.push({
                id: "comment_" + Date.now(),
                author: user.username,
                author_role: user.role || "Member",
                author_level: user.level || 1,
                content: commentText,
                created_at: new Date().toISOString()
            });

            dbStorage.saveThreads(threads);
            dbStorage.addXP(user.username, 10);

            alert(t.msg_comment_published);
            openThreadDetail(threadId); // Detayı yenile
            renderAuthState();
            renderForumThreads();
        }
    };

    // --- 7. vuskantech ÖZEL YÖNETİCİ / RÜTBE ATLATMA PANELDİR ---
    function renderAdminPanel() {
        const container = document.getElementById("admin-user-list-body");
        if (!container) return;

        const users = dbStorage.getUsers();
        const t = translations[currentLang];

        container.innerHTML = users.map(user => `
            <tr>
                <td><strong>${user.username}</strong> ${user.username === "vuskantech" ? '<span class="user-role-tag admin">ADMIN</span>' : ''}</td>
                <td>Level ${user.level || 1} (${user.xp || 0} XP)</td>
                <td><span class="user-role-tag ${(user.role || "member").toLowerCase()}">${(user.role || "Member").toUpperCase()}</span></td>
                <td>
                    ${user.username === "vuskantech" ? '<em>System Admin (Fixed)</em>' : `
                        <select id="select-role-${user.username}" class="role-select" style="padding:0.2rem 0.4rem; border-radius:4px;">
                            <option value="Member" ${user.role === 'Member' ? 'selected' : ''}>${t.role_member}</option>
                            <option value="Developer" ${user.role === 'Developer' ? 'selected' : ''}>${t.role_developer}</option>
                            <option value="Moderator" ${user.role === 'Moderator' ? 'selected' : ''}>${t.role_moderator}</option>
                            <option value="Admin" ${user.role === 'Admin' ? 'selected' : ''}>${t.role_admin}</option>
                        </select>
                        <button class="btn btn-primary btn-sm" onclick="saveUserRank('${user.username}')" style="margin-left:6px; padding:0.2rem 0.5rem;">${t.btn_save_role}</button>
                    `}
                </td>
            </tr>
        `).join("");
    }

    window.saveUserRank = function(username) {
        const select = document.getElementById(`select-role-${username}`);
        if (select) {
            const newRole = select.value;
            dbStorage.updateUserRole(username, newRole);
            alert(translations[currentLang].msg_role_updated);
            renderAdminPanel();
            renderAuthState();
            renderForumThreads();
        }
    };

    // Admin butonuna tıklanınca paneli güncelle
    if (btnAdminPanel) {
        btnAdminPanel.addEventListener("click", () => {
            renderAdminPanel();
        });
    }

    // Sitenin İlk Yüklenişi
    switchLanguage(currentLang);
});
