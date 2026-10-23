/** localStorage, который не падает в приватном режиме и при запрете хранилища. */
export const safeStorage = {
    /**
     * @param {string} key
     * @returns {string | null}
     */
    get(key) {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    },

    /**
     * @param {string} key
     * @param {string | null} value null — удалить
     */
    set(key, value) {
        try {
            if (value === null) {
                localStorage.removeItem(key);

                return;
            }

            localStorage.setItem(key, value);
        } catch {
            // Хранилище недоступно — работаем без него
        }
    },
};
