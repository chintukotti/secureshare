export function isStrongPassword(password) { return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password); }
export function requiredMessage(fieldName) { return `${fieldName} is required`; }
