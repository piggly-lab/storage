import { TransformCallback, pipeline, Readable, Writable } from 'stream';

import { Result } from '@piggly/ddd-toolkit';

import {
	isStrictLatestChunkForTransform,
	MimeTypeTransform,
} from '@/utils/transforms.js';
import UnavailableMimeTypeError from '@/errors/runtime/UnavailableMimetypeError.js';
import UnsupportedMimetypeError from '@/errors/UnsupportedMimetypeError.js';
import * as readableUtils from '@/utils/readable.js';

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

describe('utils -> transforms -> logic', () => {
	afterEach(() => {
		jest.resetAllMocks();
	});

	describe('functions', () => {
		describe('isStrictLatestChunkForTransform', () => {
			it('should be the last chunk when current chunk is less than the chunks size', () => {
				const current_chunk = Buffer.alloc(127);
				const chunks_size = 128;

				expect(
					isStrictLatestChunkForTransform(current_chunk, chunks_size),
				).toBe(true);
			});
		});
	});

	describe('MimeTypeTransform', () => {
		const bufferToStream = (buffer: Buffer, chunk_size: number) => {
			const stream = new Readable();
			const chunks = Math.ceil(buffer.length / chunk_size);

			for (let i = 0; i < chunks; i += 1) {
				const start = i * chunk_size;
				const end = start + chunk_size;
				const chunk = buffer.subarray(start, end);
				stream.push(chunk);
			}

			stream.push(null);
			return stream;
		};

		it('should calculate the mimetype and extension in transform method when file size is less than min bytes', done => {
			const min_bytes = 4100;
			const chunks_size = 128;
			const file_size = 127;

			const mimeTypeTransform = new MimeTypeTransform(
				min_bytes,
				['image/jpeg'],
				chunks_size,
			);

			jest.spyOn(readableUtils, 'calculateMimetype').mockResolvedValue(
				Result.ok({
					mimetype: 'image/jpeg',
					extension: 'jpg',
				}),
			);

			const writableFn = jest.fn();

			pipeline(
				bufferToStream(Buffer.alloc(file_size), chunks_size),
				mimeTypeTransform,
				new TestWritableStream(writableFn),
				err => {
					if (err) {
						done(err);
						return;
					}

					try {
						expect(mimeTypeTransform.chunks_read).toBe(1);
						expect(mimeTypeTransform.mimetype).toBe('image/jpeg');
						expect(mimeTypeTransform.extension).toBe('jpg');
						expect(writableFn).toHaveBeenCalled();
						done();
					} catch (error) {
						done(error);
					}
				},
			);
		});

		it('should calculate the mimetype and extension in transform method when file size is greater or equal to min bytes', done => {
			const min_bytes = 4100;
			const chunks_size = 256;
			const file_size = 5120;

			const mimeTypeTransform = new MimeTypeTransform(
				min_bytes,
				['image/jpeg'],
				chunks_size,
			);

			jest.spyOn(readableUtils, 'calculateMimetype').mockResolvedValue(
				Result.ok({
					mimetype: 'image/jpeg',
					extension: 'jpg',
				}),
			);

			const writableFn = jest.fn();

			pipeline(
				bufferToStream(Buffer.alloc(file_size), chunks_size),
				mimeTypeTransform,
				new TestWritableStream(writableFn),
				err => {
					if (err) {
						done(err);
						return;
					}

					try {
						expect(mimeTypeTransform.chunks_read).toBe(17);
						expect(mimeTypeTransform.mimetype).toBe('image/jpeg');
						expect(mimeTypeTransform.extension).toBe('jpg');
						expect(writableFn).toHaveBeenCalled();
						done();
					} catch (error) {
						done(error);
					}
				},
			);
		});

		it('should break pipeline for unsupported mimetype in transform method when file size is less than min bytes', done => {
			const min_bytes = 4100;
			const chunks_size = 128;
			const file_size = 127;

			const mimeTypeTransform = new MimeTypeTransform(
				min_bytes,
				['image/png'],
				chunks_size,
			);

			jest
				.spyOn(readableUtils, 'calculateMimetype')
				.mockResolvedValue(
					Result.fail(new UnsupportedMimetypeError(['image/png'])),
				);

			const writableFn = jest.fn();

			pipeline(
				bufferToStream(Buffer.alloc(file_size), chunks_size),
				mimeTypeTransform,
				new TestWritableStream(writableFn),
				err => {
					done();
					expect(writableFn).not.toHaveBeenCalled();
					expect(err).toBeInstanceOf(UnavailableMimeTypeError);
				},
			);
		});

		it('should break pipeline for unsupported mimetype in flush method when file size is equal to min bytes', done => {
			const min_bytes = 4100;
			const chunks_size = 128;
			const file_size = 128;

			const mimeTypeTransform = new MimeTypeTransform(
				min_bytes,
				['image/png'],
				chunks_size,
			);

			jest
				.spyOn(readableUtils, 'calculateMimetype')
				.mockResolvedValue(
					Result.fail(new UnsupportedMimetypeError(['image/png'])),
				);

			const writableFn = jest.fn();

			pipeline(
				bufferToStream(Buffer.alloc(file_size), chunks_size),
				mimeTypeTransform,
				new TestWritableStream(writableFn),
				err => {
					// @bug when fails in flush method, the error is not thrown
					// it will happens if all files that are less than min bytes and read all chunks
					expect(writableFn).toHaveBeenCalled();
					expect(err).toBeInstanceOf(UnavailableMimeTypeError);
					done();
				},
			);
		});
	});
});
