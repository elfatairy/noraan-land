import { Gender, SessionType } from "@prisma/client";

export const validateString = (string: string, max: number, min: number) => string.length >= min && string.length <= max;

export const validateEmail = (email: string) => email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);

export const validatePassword = (password: string) => password.length >= 8;

export const validateName = (password: string) => password.length >= 4;

export const validateGender = (gender: any) => Object.values(Gender).includes(gender);

export const validateAge = (age: any) => (typeof age == "number") && Number.isInteger(age) && age > 0 && age < 100;

export const validateDate = (date: string) => date.match(/^(\d{4})-0?(\d+)-0?(\d+)[T ]0?(\d+):0?(\d+):0?(\d+)\.(\d+)Z$/);

export const validateSessionType = (type: any) => Object.values(SessionType).includes(type)

// TODO IMPLEMENT QUIZES LINK VALIDATION
export const validateQuizesLink = (link: string) => true