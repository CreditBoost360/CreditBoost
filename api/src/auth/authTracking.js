const loginAttempts = new Map();
const LOGIN_ATTEMPT_LIMIT = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const checkLoginAttempts = (userId, ip) => {
    const key = `${userId}:${ip}`;
    const attempts = loginAttempts.get(key);
    
    if (!attempts) return true;
    
    // Clean up old attempts
    const now = Date.now();
    const recentAttempts = attempts.filter(timestamp => 
        now - timestamp < ATTEMPT_WINDOW_MS
    );
    
    return recentAttempts.length < LOGIN_ATTEMPT_LIMIT;
};

const incrementLoginAttempts = (userId, ip) => {
    const key = `${userId}:${ip}`;
    const attempts = loginAttempts.get(key) || [];
    attempts.push(Date.now());
    loginAttempts.set(key, attempts);
};

const resetLoginAttempts = (userId) => {
    for (const [key] of loginAttempts) {
        if (key.startsWith(`${userId}:`)) {
            loginAttempts.delete(key);
        }
    }
};

// Cleanup old attempts periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, attempts] of loginAttempts) {
        const recentAttempts = attempts.filter(timestamp => 
            now - timestamp < ATTEMPT_WINDOW_MS
        );
        if (recentAttempts.length === 0) {
            loginAttempts.delete(key);
        } else {
            loginAttempts.set(key, recentAttempts);
        }
    }
}, 60 * 60 * 1000); // Clean up every hour

module.exports = {
    checkLoginAttempts,
    incrementLoginAttempts,
    resetLoginAttempts
};