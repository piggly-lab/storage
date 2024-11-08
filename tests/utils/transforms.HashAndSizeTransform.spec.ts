import { TransformCallback, pipeline, Writable } from 'stream';
import path from 'path';
import fs from 'fs';

import { HashAndSizeTransform } from '@/utils/transforms.js';

class TestWritableStream extends Writable {
	private hook?: jest.Func;

	constructor(hook?: jest.Func) {
		super();
		this.hook = hook;
	}

	_write(chunk: any, encoding: BufferEncoding, callback: TransformCallback) {
		if (this.hook) {
			this.hook();
		}

		callback();
	}
}

const filepath = path.resolve(__dirname, '../', '__stubs__');

describe('utils -> transforms -> integration', () => {
	afterEach(() => {
		jest.resetAllMocks();
	});

	describe('HashAndSizeTransform', () => {
		it.each([
			{
				hash: '33ce00dd8a8f35f7d0de4a9566ce30f8d86b33eac1a5efb63e738ef721db7fbc',
				name: 'empty_file.jpg',
				size: 631,
			},
			{
				hash: '37e60ae419e02cbb333184065ee327a4fa9405b66391b49d146ffea95932f4da',
				name: 'huge_image.jpg',
				size: 78572,
			},
		])(
			`should calculate the hash and size of $name`,
			({ name, hash, size }, done) => {
				const hashAndSizeTransform = new HashAndSizeTransform();
				const writableFn = jest.fn();
				pipeline(
					fs.createReadStream(path.join(filepath, name)),
					hashAndSizeTransform,
					new TestWritableStream(writableFn),
					err => {
						if (err) {
							done(err);
							return;
						}
						try {
							expect(hashAndSizeTransform.hash).toBe(hash);
							expect(hashAndSizeTransform.size).toBe(size);
							expect(writableFn).toHaveBeenCalled();
							done();
						} catch (error) {
							done(error);
						}
					},
				);
			},
		);
	});
});
