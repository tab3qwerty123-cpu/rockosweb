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
        // Tüm varsayılan/hoşgeldin ve örnek postları tamamen temizle (%100 Boş Başlar)
        let threads = this.getThreads();
        if (!threads || threads.length === 0 || threads.some(t => t.id === 'thread_1' || t.title.includes('Welcome') || t.title.includes('Ubuntu') || t.author === 'ROCKos Team')) {
            this.saveThreads([]);
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
            // Adminlerin seviyesi sabittir/görünmezdir veya elle ayarlanır
            user.xp = (user.xp || 0) + amount;
            user.level = Math.floor(user.xp / 50) + 1;
            this.saveUsers(users);

            let curr = this.getCurrentUser();
            if (curr && curr.username === username) {
                curr.xp = user.xp;
                curr.level = user.level;
                this.setCurrentUser(curr);
            }
        }
    }

    // Admin Tarafından Manuel Seviye (Level) Güncelleme
    updateUserLevel(username, newLevel) {
        let users = this.getUsers();
        let user = users.find(u => u.username === username);
        if (user) {
            user.level = parseInt(newLevel, 10) || 1;
            user.xp = (user.level - 1) * 50;
            this.saveUsers(users);

            let curr = this.getCurrentUser();
            if (curr && curr.username === username) {
                curr.level = user.level;
                curr.xp = user.xp;
                this.setCurrentUser(curr);
            }
            return true;
        }
        return false;
    }

    // Rütbe Güncelleme (Admin yetkili kullanıcılar için)
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
