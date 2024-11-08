import { TransformCallback, TransformOptions, Transform } from 'stream';
import crypto from 'crypto';

import UnavailableMimeTypeError from '@/errors/runtime/UnavailableMimetypeError.js';
import { calculateMimetype } from '@/utils/readable.js';

export class HashAndSizeTransform extends Transform {
	private calc: ReturnType<typeof crypto.createHash>;

	public hash: string;

	public size: number;

	constructor(opts?: TransformOptions) {
		super(opts);
		this.calc = crypto.createHash('sha256');
		this.hash = '';
		this.size = 0;
	}

	public _transform(
		chunk: any,
		encoding: BufferEncoding,
		callback: TransformCallback,
	) {
		this.calc.update(chunk);
		this.size += chunk.length;
		return callback(null, chunk);
	}

	public _flush(callback: TransformCallback): void {
		this.hash = this.calc.digest('hex');
		callback();
	}
}

export const isStrictLatestChunkForTransform = (
	current_chunk: Buffer,
	chunks_size: number,
) => current_chunk.length < chunks_size;

export class MimeTypeTransform extends Transform {
	private chunks: Array<Buffer>;

	private allows: Array<string>;

	private chunks_size: number;

	private min_bytes: number;

	private size: number;

	public extension?: string;

	public mimetype?: string;

	constructor(
		min_bytes: number,
		allows: Array<string>,
		chunks_size: number = 65536,
		opts?: TransformOptions,
	) {
		super(opts);
		this.allows = allows;
		this.min_bytes = min_bytes;
		this.chunks_size = chunks_size;
		this.size = 0;
		this.chunks = [];
	}

	public async _transform(
		chunk: Buffer,
		encoding: BufferEncoding,
		callback: TransformCallback,
	) {
		if (this.mimetype) {
			this.push(chunk);
			return callback();
		}

		this.size += chunk.length;
		let bypass = false;

		// Size is less than min_bytes and chunk is the latest
		if (
			this.size < this.min_bytes &&
			isStrictLatestChunkForTransform(chunk, this.chunks_size)
		) {
			bypass = true;
		}

		if (this.size >= this.min_bytes || bypass) {
			const result = await calculateMimetype(
				this.chunks.length > 0
					? Buffer.concat([...this.chunks, chunk])
					: chunk,
				this.allows,
			);

			if (result.isFailure) {
				return callback(
					UnavailableMimeTypeError.lang(
						process.env?.APP_LANG ?? 'enUS',
						this.allows,
						result.error,
					),
				);
			}

			this.mimetype = result.data.mimetype;
			this.extension = result.data.extension;

			return callback(null, chunk);
		}

		this.chunks.push(chunk);
		return callback(null, chunk);
	}

	public async _flush(callback: TransformCallback) {
		if (this.size <= this.min_bytes && this.chunks.length > 0) {
			const result = await calculateMimetype(
				Buffer.concat(this.chunks),
				this.allows,
			);

			if (result.isFailure) {
				return callback(
					UnavailableMimeTypeError.lang(
						process.env?.APP_LANG ?? 'enUS',
						this.allows,
						result.error,
					),
				);
			}

			this.mimetype = result.data.mimetype;
			this.extension = result.data.extension;
		}

		return callback();
	}

	public get chunks_read(): number {
		return this.chunks.length + 1;
	}
}
