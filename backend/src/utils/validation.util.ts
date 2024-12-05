export const validateEmail = (email: string) => email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);

export const validatePassword = (password: string) => password.length >= 8;

export const validateName = (password: string) => password.length >= 4;