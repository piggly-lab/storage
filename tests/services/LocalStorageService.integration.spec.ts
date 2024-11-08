import crypto from 'crypto';
import fs from 'fs';
import os from 'os';

import { IKeyManagerService } from '@piggly/secrets';
import { zipFilePath } from '#/__stubs__/index.js';
import { jest } from '@jest/globals';

import LocalStorageService from '@/services/LocalStorageService.js';

jest.mock('uuid');

describe('core -> modules -> storage -> services -> LocalStorageService -> integration', () => {
	const directory = os.tmpdir();
	const bucket_name = 'local';

	const available_mimetypes = ['application/zip', 'image/jpeg', 'image/png'];

	const SecretManagerService: IKeyManagerService<Buffer> = {
		name: 'SecretManagerService',
		load: jest.fn() as any,
		get: jest.fn() as any,
		current_version: 1,
	};

	const KeyPairManagerService: IKeyManagerService<{ sk: Buffer; pk: Buffer }> =
		{
			name: 'KeyPairManagerService',
			load: jest.fn() as any,
			get: jest.fn() as any,
			current_version: 1,
		};

	const service = new LocalStorageService(
		directory,
		bucket_name,
		available_mimetypes,
		SecretManagerService,
		KeyPairManagerService,
	);

	beforeEach(() => {
		jest.restoreAllMocks();
		jest.clearAllMocks();
	});

	afterAll(() => {
		jest.resetAllMocks();
	});

	it('should upload a file an return an entity', async () => {
		jest
			.spyOn(crypto, 'randomUUID')
			.mockReturnValue('4b54c45b-b7bb-426e-84f2-3beccad082cb');

		const file: any = {
			stream: fs.createReadStream(zipFilePath()),
			mimetype: 'application/zip',
			filename: 'example.zip',
			encoding: 'utf8',
		};

		const date = new Date();
		const year = date.getFullYear().toString();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const { isSuccess, data } = await service.upload(file, {
			caption: 'caption',
		});

		expect(isSuccess).toBe(true);
		expect(data.provider).toBe('local');
		expect(data.bucket_name).toBe(bucket_name);
		expect(data.filename).toBe('example.zip');
		expect(data.options).toStrictEqual({ caption: 'caption' });
		expect(data.metadata.name).toBe('4b54c45b-b7bb-426e-84f2-3beccad082cb');
		expect(data.metadata.extension).toBe('zip');
		expect(data.metadata.mimetype).toBe('application/zip');
		expect(data.metadata.size).toBe(22);
		expect(data.metadata.hash).toBe(
			'8739c76e681f900923b900c9df0ef75cf421d39cabb54650c4b9ad19b6a76d85',
		);
		expect(data.metadata.filepath).toBe(
			`${directory}/${bucket_name}/${year}/${month}/4b54c45b-b7bb-426e-84f2-3beccad082cb.zip`,
		);

		fs.unlinkSync(
			`${directory}/${bucket_name}/${year}/${month}/4b54c45b-b7bb-426e-84f2-3beccad082cb.zip`,
		);
	});
});
