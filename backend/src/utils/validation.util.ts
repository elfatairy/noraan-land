import { SESSION_TYPE } from "./constants.util";

export const validateEmail = (email: string) => email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);

export const validatePassword = (password: string) => password.length >= 8;

export const validateName = (password: string) => password.length >= 4;

export const validateDate = (date: string) => date.match(/^(\d{4})-0?(\d+)-0?(\d+)[T ]0?(\d+):0?(\d+):0?(\d+)\.(\d+)Z$/);

export const validateSessionType = (type: string) => Object.values(SESSION_TYPE).includes(type)

// TODO IMPLEMENT QUIZES LINK VALIDATION
export const validateQuizesLink = (link: string) => true