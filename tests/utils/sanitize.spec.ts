import { jest } from '@jest/globals';
import slugify from 'slugify';

import { removeFileExtension, sanitizeFileName } from '@/utils/sanitize.js';

jest.mock('slugify');

describe('core -> modules -> storage -> utils -> sanitize', () => {
	describe('sanitizeFileName', () => {
		it('should convert filename to a slugified version in lowercase', () => {
			const filename = 'My File Name.png';
			const slugifiedFilename = 'my-file-name.png';

			const slugifyFn = jest.fn().mockReturnValue(slugifiedFilename);
			(slugify as any).mockImplementation(slugifyFn as any);

			const result = sanitizeFileName(filename);
			expect(result).toBe(slugifiedFilename);
			expect(slugifyFn).toHaveBeenCalledWith(filename, { lower: true });
		});
	});

	describe('removeFileExtension', () => {
		it('should remove the file extension from the filename', () => {
			const filename = 'example.png';
			const expectedFilenameWithoutExtension = 'example';

			const result = removeFileExtension(filename);
			expect(result).toBe(expectedFilenameWithoutExtension);
		});

		it('should return the same string if there is no extension', () => {
			const filename = 'example';
			const expectedFilenameWithoutExtension = 'example';

			const result = removeFileExtension(filename);
			expect(result).toBe(expectedFilenameWithoutExtension);
		});
	});
});
