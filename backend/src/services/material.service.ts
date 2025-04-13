import { mkdirSync, readdirSync, renameSync, rmSync } from "fs";
import { join } from "path";
import { UploadedFile } from "express-fileupload";

export const createFolder = async (name: string, path: string) => {
  mkdirSync(join(path, name), { recursive: true });
};

export const getContent = async (path: string) => {
  const res = readdirSync(path);

  console.log(res);
  return res;
};

export const uploadFile = async (file: UploadedFile, path: string) => {
  file.mv(join(path, file.name), async (err) => {
    if (err) {
      throw Error(err);
    }
  });
};

export const renameItem = async (path: string, newName: string) => {
  const pathParts = path.replace(/^\\+|\\+$/g, "").split("\\");
  console.log(path);
  console.log(pathParts);
  pathParts[pathParts.length - 1] = newName;
  console.log(pathParts);
  const newPath = pathParts.join("\\");
  console.log(newPath);
  renameSync(path, newPath);
};

export const deleteItem = async (path: string) => {
  rmSync(path, { recursive: true });
};
