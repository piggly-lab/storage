import { TransformCallback, pipeline, Writable } from 'stream';
import path from 'path';
import fs from 'fs';

import UnavailableMimeTypeError from '@/errors/runtime/UnavailableMimetypeError.js';
import { HashAndSizeTransform, MimeTypeTransform } from '@/utils/transforms.js';

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

	describe('MimeTypeTransform', () => {
		it.each([
			{
				mimetype:
					'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
				name: 'empty_file.docx',
				extension: 'docx',
			},
			{
				name: 'empty_file.jpg',
				mimetype: 'image/jpeg',
				extension: 'jpg',
			},
			{
				name: 'empty_file.png',
				mimetype: 'image/png',
				extension: 'png',
			},
			{
				mimetype: 'application/zip',
				name: 'empty_file.zip',
				extension: 'zip',
			},
			{
				name: 'huge_image.jpg',
				mimetype: 'image/jpeg',
				extension: 'jpg',
			},
		])(
			`should calculate the mimetype and extension of $name`,
			({ extension, mimetype, name }, done) => {
				const mimeTypeTransform = new MimeTypeTransform(4100, [mimetype]);
				const writableFn = jest.fn();
				pipeline(
					fs.createReadStream(path.join(filepath, name)),
					mimeTypeTransform,
					new TestWritableStream(writableFn),
					err => {
						if (err) {
							done(err);
							return;
						}

						try {
							expect(mimeTypeTransform.mimetype).toBe(mimetype);
							expect(mimeTypeTransform.extension).toBe(extension);
							expect(writableFn).toHaveBeenCalled();
							done();
						} catch (error) {
							done(error);
						}
					},
				);
			},
		);

		it.each([
			{
				allows: ['application/zip'],
				name: 'huge_image.jpg',
			},
		])(
			`should fail if the mimetype of $name is not allowed`,
			({ allows, name }, done) => {
				const mimeTypeTransform = new MimeTypeTransform(4100, allows);
				const writableFn = jest.fn();
				pipeline(
					fs.createReadStream(path.join(filepath, name)),
					mimeTypeTransform,
					new TestWritableStream(writableFn),
					err => {
						expect(err).toBeInstanceOf(UnavailableMimeTypeError);
						expect(writableFn).not.toHaveBeenCalled();
						done();
					},
				);
			},
		);

		// @bug file-type cannot detect text/plain files
		it(`should fail if the mimetype cannot be detected`, done => {
			const mimeTypeTransform = new MimeTypeTransform(4100, ['text/plain']);
			const writableFn = jest.fn();
			pipeline(
				fs.createReadStream(path.join(filepath, 'empty_file.txt')),
				mimeTypeTransform,
				new TestWritableStream(writableFn),
				err => {
					done();
					expect(err).toBeInstanceOf(UnavailableMimeTypeError);
					expect(writableFn).not.toHaveBeenCalled();
				},
			);
		});

		it(`should calculate the mimetype and extension after the first chuck`, done => {
			const chunks_size = 128; // bytes
			const mimeTypeTransform = new MimeTypeTransform(
				4100,
				['image/jpeg'],
				chunks_size,
			);
			const writableFn = jest.fn();
			pipeline(
				fs.createReadStream(path.join(filepath, 'empty_file.jpg'), {
					highWaterMark: chunks_size,
				}),
				mimeTypeTransform,
				new TestWritableStream(writableFn),
				err => {
					if (err) {
						done(err);
						return;
					}
					try {
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
	});

	describe('pipeline', () => {
		it('should calculate hash, size and solve mimetype with extension', done => {
			const name = 'empty_file.jpg';
			const allows = ['image/jpeg'];
			const hash =
				'33ce00dd8a8f35f7d0de4a9566ce30f8d86b33eac1a5efb63e738ef721db7fbc';
			const mimetype = 'image/jpeg';
			const extension = 'jpg';
			const size = 631;
			const mimeTypeTransform = new MimeTypeTransform(4100, allows);
			const hashAndSizeTransform = new HashAndSizeTransform();
			const writableFn = jest.fn();
			pipeline(
				fs.createReadStream(path.join(filepath, name)),
				mimeTypeTransform,
				hashAndSizeTransform,
				new TestWritableStream(writableFn),
				err => {
					if (err) {
						done(err);
						return;
					}
					try {
						expect(mimeTypeTransform.mimetype).toBe(mimetype);
						expect(mimeTypeTransform.extension).toBe(extension);
						expect(hashAndSizeTransform.hash).toBe(hash);
						expect(hashAndSizeTransform.size).toBe(size);
						expect(writableFn).toHaveBeenCalled();
						done();
					} catch (error) {
						done(error);
					}
				},
			);
		});
	});
});
