import path from 'path';
import fs from 'fs';

import UnsupportedMimetypeError from '@/errors/UnsupportedMimetypeError.js';
import { calculateMimetype } from '@/utils/readable.js';

const filepath = path.resolve(__dirname, '../', '__stubs__');

describe('utils -> transforms', () => {
	afterEach(() => {
		jest.resetAllMocks();
	});

	describe('calculateMimetype', () => {
		it('should fail if the mimetype cannot be detected', async () => {
			const chunk = Buffer.from('test');
			const result = await calculateMimetype(chunk, ['image/jpeg']);

			expect(result.isFailure).toBe(true);
			expect(result.error).toBeInstanceOf(UnsupportedMimetypeError);
		});

		it('should fail if the mimetype is not allowed', async () => {
			const chunk = fs.readFileSync(path.join(filepath, 'empty_file.jpg'));

			const result = await calculateMimetype(chunk, ['image/png']);

			expect(result.isFailure).toBe(true);
			expect(result.error).toBeInstanceOf(UnsupportedMimetypeError);
		});

		it('should return the mimetype and extension', async () => {
			const chunk = fs.readFileSync(path.join(filepath, 'empty_file.jpg'));

			const allows = ['image/jpeg'];

			const result = await calculateMimetype(chunk, allows);

			expect(result.isSuccess).toBe(true);
			expect(result.data).toStrictEqual({
				mimetype: 'image/jpeg',
				extension: 'jpg',
			});
		});
	});
});
