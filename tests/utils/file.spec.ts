import { Readable, Writable } from 'stream';
import { pipeline } from 'stream/promises';
import fs from 'fs';

import {
	getAbsolutePath,
	createDirectory,
	removeFile,
	unlinkFile,
	writeFile,
} from '@/utils/file.js';
import CannotCreateDirectoryError from '@/errors/runtime/CannotCreateDirectoryError.js';
import CannotCreateFileError from '@/errors/runtime/CannotCreateFileError.js';
import FileNotFoundError from '@/errors/FileNotFoundError.js';

jest.mock('fs');
jest.mock('@piggly/secrets');
jest.mock('file-type');
jest.mock('crypto');
jest.mock('pump');
jest.mock('path');
jest.mock('os');

jest.mock('stream/promises', () => ({
	pipeline: jest.fn(),
}));

describe('utils/files', () => {
	describe('getAbsolutePath', () => {
		it('should return file path if file exists', async () => {
			const abspath = '/some/path/to/file.jpg';

			jest.spyOn(fs, 'stat').mockImplementation((_, callback: any) => {
				callback(null, { isFile: () => true });
			});

			const result = await getAbsolutePath(abspath);
			expect(result.isSuccess).toBe(true);
			expect(result.data).toBe(abspath);
		});

		it('should return FileNotFoundError if path is null', async () => {
			const result = await getAbsolutePath(null);
			expect(result.isFailure).toBe(true);
			expect(result.error).toBeInstanceOf(FileNotFoundError);
		});

		it('should return FileNotFoundError if file does not exist', async () => {
			const abspath = '/some/path/to/file.jpg';

			jest.spyOn(fs, 'stat').mockImplementation((_, callback: any) => {
				callback(new Error('File not found'), null);
			});

			const result = await getAbsolutePath(abspath);
			expect(result.isFailure).toBe(true);
			expect(result.error).toBeInstanceOf(FileNotFoundError);
		});
	});

	describe('writeFile', () => {
		it('should write file successfully', async () => {
			const readable = new Readable();
			readable.push(Buffer.from('test chunk'));
			readable.push(null);

			const writable = new Writable();
			const abspath = '/some/path/to/file.jpg';

			jest.spyOn(fs, 'createWriteStream').mockReturnValue(writable as any);
			await writeFile(readable, abspath);

			expect(pipeline).toHaveBeenCalledWith(readable, writable);
			expect(fs.createWriteStream).toHaveBeenCalledWith(abspath);
		});

		it('should fail to write file and throw CannotCreateFileError', async () => {
			const file = new Readable();
			const abspath = '/some/path/to/file.jpg';

			(pipeline as unknown as jest.Mock).mockRejectedValueOnce(
				new Error('Write error'),
			);

			await expect(writeFile(file, abspath)).rejects.toThrow(
				CannotCreateFileError,
			);
		});
	});

	describe('removeFile', () => {
		it('should remove file successfully', async () => {
			const abspath = '/some/path/to/file.jpg';

			jest.spyOn(fs, 'unlink').mockImplementation((_, callback: any) => {
				expect(_).toBe(abspath);
				callback(null);
			});

			await expect(removeFile(abspath)).resolves.not.toThrow();
		});

		it('should resolve even if some error happends', async () => {
			const abspath = '/some/path/to/file.jpg';

			jest.spyOn(fs, 'unlink').mockImplementation((_, callback: any) => {
				callback(new Error('File not found'));
			});

			await expect(removeFile(abspath)).resolves.not.toThrow();
		});
	});

	describe('unlinkFile', () => {
		it('should unlink file successfully', async () => {
			const abspath = '/some/path/to/file.jpg';

			jest.spyOn(fs, 'unlink').mockImplementation((_, callback) => {
				callback(null);
			});

			await expect(unlinkFile(abspath)).resolves.not.toThrow();
		});

		it('should resolve when file does not exist', async () => {
			jest.spyOn(fs, 'unlink').mockImplementation((_, callback) => {
				const error: NodeJS.ErrnoException = new Error('File not found');
				error.code = 'ENOENT';
				callback(error);
			});

			await expect(
				unlinkFile('/path/to/nonexistent/file'),
			).resolves.not.toThrow();
		});

		it('should fail to unlink file and reject with error', async () => {
			const abspath = '/some/path/to/file.jpg';

			jest.spyOn(fs, 'unlink').mockImplementation((_, callback) => {
				callback(new Error('Unlink error'));
			});

			await expect(unlinkFile(abspath)).rejects.toThrow('Unlink error');
		});
	});

	describe('createDirectory', () => {
		it('should create directory successfully', () => {
			const abspath = '/some/path/to/dir';

			jest.spyOn(fs, 'existsSync').mockReturnValue(false);
			jest.spyOn(fs, 'mkdirSync').mockImplementation((() => {}) as any);

			expect(() => createDirectory(abspath)).not.toThrow();
		});

		it('should not create directory if it already exists', () => {
			const abspath = '/some/path/to/dir';

			jest.spyOn(fs, 'existsSync').mockReturnValue(true);

			expect(() => createDirectory(abspath)).not.toThrow();
		});

		it('should fail to create directory and throw CannotCreateDirectoryError', () => {
			const abspath = '/some/path/to/dir';

			jest.spyOn(fs, 'existsSync').mockReturnValue(false);
			jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {
				throw new Error('Mkdir error');
			});

			expect(() => createDirectory(abspath)).toThrow(
				CannotCreateDirectoryError,
			);
		});
	});
});
