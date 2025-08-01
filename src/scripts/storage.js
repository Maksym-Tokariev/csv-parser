const storage = chrome.storage.local;


/**
 * Get the value by key or array of key.
 *
 * @param {string|string[]} key — key or array of key.
 * @param {*} defaultValue — default value if nothing is found.
 * @returns {Promise<*>|Promise<Object>} — returns the value for string key,
 * for array — object { key: value, … }
 */
export async function get(key, defaultValue = undefined) {
    return Promise((resolve) => {
        storage.get(key, (items) => {
            if (chrome.runtime.lastError) {
                console.error('Storage.get error:', chrome.runtime.lastError);
                return resolve(defaultValue);
            }

            if (Array.isArray(key)) {
                resolve(items);
            } else {
                const val = items[key];
                resolve(val === undefined ? defaultValue : val);
            }
        });
    });
}

/**
 * Save a key-value pair or an object with multiple values.
 *
 * @param {string|Object} key — string key or object of type { key: value, … }.
 * @param {*} [value] — value.
 * @returns {Promise<void>}
 */
export async function set(key, value) {
    const data = typeof key === 'object' ? key : { [key]: value };

    return new Promise((resolve) => {
       storage.set(data, () => {
           if (chrome.runtime.lastError) {
               console.error('Storage.set error:', chrome.runtime.lastError);
           }
           resolve();
       });
    });
}

/**
 * Delete value or array of values.
 *
 * @param {string|string[]} key — key or array of keys to delete
 * @returns {Promise<void>}
 */
export async function remove(key) {
    return new Promise((resolve) => {
        storage.remove(key, () => {
            if (chrome.runtime.lastError) {
                console.error('Storage.remove error:', chrome.runtime.lastError);
            }
            resolve();
        });
    })
}

/**
 * Remove all data
 *
 * @returns {Promise<void>}
 */
export async function clearAll() {
    return new Promise((resolve) => {
        storage.clear(() => {
            if (chrome.runtime.lastError) {
                console.error('Storage.clear error:', chrome.runtime.lastError);
            }
            resolve();
        });
    });
}

/**
 * Get all data
 *
 * @returns {Promise<Object>} — object with key-value pairs
 */
export async function getAll() {
    return get(null, {});
}
