export enum ROLES {
    ADMIN,
    USER
}

export const allowedMaterialTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-flv',
    'video/webm',
    'text/plain'
];

// Define file size limit (e.g., 10MB)
export const MAX_FILE_SIZE = 20 * 1024 * 1024;

export const JOIN_LINK_SHOW = 10 * 60 * 1000;