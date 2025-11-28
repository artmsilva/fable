export const toISODate = (dateInput) => new Date(dateInput).toISOString();

export const deepClone = (value) => JSON.parse(JSON.stringify(value));
