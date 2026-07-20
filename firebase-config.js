/**
 * ROCKos Firebase & Storage Manager Entegrasyonu
 */

// Real Firebase Yapılandırma Objesi
const firebaseConfig = {
    apiKey: "AIzaSyA9idooYKbIJ70K8PKobsFI2Byfc7XZREI",
    authDomain: "rockosweb.firebaseapp.com",
    projectId: "rockosweb",
    storageBucket: "rockosweb.firebasestorage.app",
    messagingSenderId: "46297240296",
    appId: "1:46297240296:web:6cf8774b29c343616bef5d",
    measurementId: "G-VXBP54RZ1B"
};

// StorageManager: Firebase ve Yerel Kalıcı Veri Motoru
class StorageManager {
    constructor() {
        this.USERS_KEY = "rockos_users_db";
        this.THREADS_KEY = "rockos_forum_threads";
        this.CURRENT_USER_KEY = "rockos_current_user";
        this.init();
    }

    init() {
        // Varsayılan Admin Hesabı: vuskantech / OzanEzgi0655*
        let users = this.getUsers();
        let vuskantech = users.find(u => u.username === "vuskantech");
        if (!vuskantech) {
            users.push({
                id: "user_vuskantech",
                username: "vuskantech",
                password: "OzanEzgi0655*",
                role: "Admin",
                xp: 250,
                level: 6,
                created_at: new Date().toISOString()
            });
            this.saveUsers(users);
        }

        // Varsayılan Örnek Forum Konuları
        let threads = this.getThreads();
        if (threads.length === 0) {
            threads = [
                {
                    id: "thread_1",
                    title: "Welcome to ROCKos Community Forum!",
                    category: "announcements",
                    content: "Feel free to ask questions, share your feedback, and participate in discussions. Posting topics and comments grants you XP to level up your profile!",
                    author: "vuskantech",
                    author_role: "Admin",
                    author_level: 6,
                    likes: 12,
                    dislikes: 0,
                    liked_by: [],
                    disliked_by: [],
                    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
                    comments: [
                        {
                            id: "comment_1_1",
                            author: "rockos_fan",
                            author_role: "Member",
                            author_level: 2,
                            content: "Super excited for ROCKos v1.1! The Debian ARM64 build runs fast on my VM.",
                            created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
                            likes: 4,
                            liked_by: []
                        }
                    ]
                }
            ];
            this.saveThreads(threads);
        }
    }

    getUsers() {
        try {
            return JSON.parse(localStorage.getItem(this.USERS_KEY)) || [];
        } catch(e) {
            return [];
        }
    }

    saveUsers(users) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }

    getThreads() {
        try {
            return JSON.parse(localStorage.getItem(this.THREADS_KEY)) || [];
        } catch(e) {
            return [];
        }
    }

    saveThreads(threads) {
        localStorage.setItem(this.THREADS_KEY, JSON.stringify(threads));
    }

    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(this.CURRENT_USER_KEY)) || null;
        } catch(e) {
            return null;
        }
    }

    setCurrentUser(user) {
        if (user) {
            localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(this.CURRENT_USER_KEY);
        }
    }

    // XP & Seviye Hesaplama (Level = Math.floor(XP / 50) + 1)
    addXP(username, amount) {
        let users = this.getUsers();
        let user = users.find(u => u.username === username);
        if (user) {
            user.xp = (user.xp || 0) + amount;
            user.level = Math.floor(user.xp / 50) + 1;
            this.saveUsers(users);

            // Eğer şu anki kullanıcı ise oturumu güncelle
            let curr = this.getCurrentUser();
            if (curr && curr.username === username) {
                curr.xp = user.xp;
                curr.level = user.level;
                this.setCurrentUser(curr);
            }
        }
    }

    // Rütbe Güncelleme (Yalnızca Admin/vuskantech için)
    updateUserRole(username, newRole) {
        let users = this.getUsers();
        let user = users.find(u => u.username === username);
        if (user) {
            user.role = newRole;
            this.saveUsers(users);

            let curr = this.getCurrentUser();
            if (curr && curr.username === username) {
                curr.role = newRole;
                this.setCurrentUser(curr);
            }
            return true;
        }
        return false;
    }
}

const dbStorage = new StorageManager();
