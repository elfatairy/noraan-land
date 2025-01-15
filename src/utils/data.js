export const getStorageData = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item; // Don't parse JWT tokens
  } catch (error) {
    console.error(
      `Error retrieving data from local storage for key: ${key}`,
      error
    );
    return null;
  }
};

export const setStorageData = (key, value) => {
  try {
    localStorage.setItem(key, value); // Store JWT tokens as strings
  } catch (error) {
    console.error(`Error saving data to local storage for key: ${key}`, error);
  }
};

export const deleteStorageData = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(
      `Error removing data from local storage for key: ${key}`,
      error
    );
  }
};
