import { Attendence, Gender, SessionType } from "@prisma/client";
import { Report } from "../../types";

export const validateString = (string: string, max: number, min: number) =>
  string.length >= min && string.length <= max;

export const validateEmail = (email: string) =>
  email.match(
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
  );

export const validatePassword = (password: string) => password.length >= 8;

export const validatePhone = (phone: string) =>
  phone.match(/^\+(?:[0-9] ?){6,14}[0-9]$/);

export const validateName = (password: string) => password.length >= 4;

export const validateGender = (gender: any) =>
  Object.values(Gender).includes(gender);

export const validateAge = (age: any) =>
  Number.isInteger(Number(age)) && Number(age) > 0 && Number(age) < 100;

export const validateDate = (date: string) =>
  date.match(/^(\d{4})-0?(\d+)-0?(\d+)[T ]0?(\d+):0?(\d+):0?(\d+)\.(\d+)Z$/);

export const validateSessionType = (type: any) =>
  Object.values(SessionType).includes(type);

// TODO IMPLEMENT QUIZES LINK VALIDATION
export const validateQuizesLink = (link: string) => true;

export const validateZoomLink = (link: string) =>
  link.match(/^https?:\/\/([a-z0-9]+\.)?zoom\.us\/j\/(\d+)(\?pwd=[\w-]+)?/);

export const validateObjectWithKeys = (obj: any) => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    !Array.isArray(obj) &&
    Object.keys(obj).length > 0
  );
};

export const validateReports = (reports: Record<string, any>) => {
  for (const studentId in reports) {
    if (
      !Object.values(Attendence).includes(reports[studentId].attendence) ||
      !validateString(reports[studentId].homeWork, 255, 0) ||
      !validateString(reports[studentId].notes, 255, 0)
    ) {
      return false;
    }

    return true;
  }
};
