import { createRequire } from 'module';

const slugify = createRequire(import.meta.url)('slugify');

export const sanitizeFileName = (filename: string) =>
	slugify(filename, { lower: true });

export const removeFileExtension = (filename: string) =>
	filename.replace(/\.[^/.]+$/, '');

export const getFileExtension = (filename: string) =>
	(filename.split('.').pop() ?? '.unk').trim();
