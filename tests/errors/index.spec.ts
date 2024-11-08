import { BusinessRuleViolationError, RuntimeError } from '@piggly/ddd-toolkit';

import CannotCreateDirectoryError from '@/errors/runtime/CannotCreateDirectoryError.js';
import InvalidStorageServiceError from '@/errors/InvalidStorageServiceError.js';
import CannotCreateFileError from '@/errors/runtime/CannotCreateFileError.js';
import CannotUploadFileError from '@/errors/runtime/CannotUploadFileError.js';
import IncompatibleFileError from '@/errors/runtime/IncompatibleFileError.js';
import URLInvalidSignatureError from '@/errors/URLInvalidSignatureError.js';
import UnsupportedMimetypeError from '@/errors/UnsupportedMimetypeError.js';
import FileAlreadyExistsError from '@/errors/FileAlreadyExistsError.js';
import CannotSaveFileError from '@/errors/CannotSaveFileError.js';
import FileNotFoundError from '@/errors/FileNotFoundError.js';

describe('modules -> storage -> errors', () => {
	it('should create CannotSaveFileError', () => {
		const error = CannotSaveFileError.ptBR();

		expect(error).toBeInstanceOf(BusinessRuleViolationError);
		expect(error.name).toBe('CannotSaveFileError');
		expect(error.code).toBe(4167795354);
		expect(error.message).toBe('Não foi possível salvar o arquivo.');
		expect(error.status).toBe(500);
		expect(error.hint).toBe(
			'O sistema produziu um erro ao tentar salvar o arquivo na base de dados.',
		);
	});

	it('should create CannotUploadFileError', () => {
		const error = CannotUploadFileError.ptBR(new Error('some error'));

		expect(error).toBeInstanceOf(RuntimeError);
		expect(error.name).toBe('CannotUploadFileError');
		expect(error.code).toBe(3341452587);
		expect(error.message).toBe('Não foi possível fazer o upload.');
		expect(error.status).toBe(500);
		expect(error.hint).toBe(
			'O sistema produziu um erro ao tentar fazer o upload do arquivo.',
		);
	});

	it('should create CannotCreateDirectoryError', () => {
		const error = CannotCreateDirectoryError.ptBR(new Error('some error'));

		expect(error).toBeInstanceOf(RuntimeError);
		expect(error.name).toBe('CannotCreateDirectoryError');
		expect(error.code).toBe(1937143977);
		expect(error.message).toBe('Não foi possível criar o diretório.');
		expect(error.status).toBe(500);
		expect(error.hint).toBe(
			'O sistema produziu um erro ao tentar criar o diretório.',
		);
	});

	it('should create CannotCreateFileError', () => {
		const error = CannotCreateFileError.ptBR(new Error('some error'));

		expect(error).toBeInstanceOf(RuntimeError);
		expect(error.name).toBe('CannotCreateFileError');
		expect(error.code).toBe(505139322);
		expect(error.message).toBe('Não foi possível salvar o arquivo.');
		expect(error.status).toBe(500);
		expect(error.hint).toBe(
			'O sistema produziu um erro ao tentar salvar o arquivo.',
		);
	});

	it('should create IncompatibleFileError', () => {
		const error = IncompatibleFileError.ptBR();

		expect(error).toBeInstanceOf(RuntimeError);
		expect(error.name).toBe('IncompatibleFileError');
		expect(error.code).toBe(1515641074);
		expect(error.message).toBe('Erro ao processar o arquivo.');
		expect(error.status).toBe(500);
		expect(error.hint).toBe(
			'Ele não é compatível com o provedor de armazenamento utilizado.',
		);
	});

	it('should create FileAlreadyExistsError', () => {
		const error = FileAlreadyExistsError.ptBR();

		expect(error).toBeInstanceOf(BusinessRuleViolationError);
		expect(error.name).toBe('FileAlreadyExistsError');
		expect(error.code).toBe(3283369818);
		expect(error.message).toBe('Arquivo já existe.');
		expect(error.status).toBe(409);
		expect(error.hint).toBe(
			'O arquivo que você está tentando adicionar já existe e não pode ser adicionado novamente.',
		);
	});

	it('should create FileNotFoundError', () => {
		const error = FileNotFoundError.ptBR();

		expect(error).toBeInstanceOf(BusinessRuleViolationError);
		expect(error.name).toBe('FileNotFoundError');
		expect(error.code).toBe(1834506930);
		expect(error.message).toBe('Arquivo não encontrado.');
		expect(error.status).toBe(404);
		expect(error.hint).toBe(
			'O arquivo que você está tentando acessar não está mais disponível.',
		);
	});

	it('should create InvalidStorageServiceError', () => {
		const error = InvalidStorageServiceError.ptBR();

		expect(error).toBeInstanceOf(BusinessRuleViolationError);
		expect(error.name).toBe('InvalidStorageServiceError');
		expect(error.code).toBe(3202362255);
		expect(error.message).toBe('Provedor de armazenamento inválido.');
		expect(error.status).toBe(422);
		expect(error.hint).toBe(
			'O provedor de armazenamento não é compatível com o arquivo enviado.',
		);
	});

	it('should create UnsupportedMimetypeError', () => {
		const error = UnsupportedMimetypeError.ptBR(['image/jpeg']);

		expect(error).toBeInstanceOf(BusinessRuleViolationError);
		expect(error.name).toBe('UnsupportedMimetypeError');
		expect(error.code).toBe(1711109640);
		expect(error.message).toBe('Tipo de arquivo não suportado.');
		expect(error.status).toBe(422);
		expect(error.hint).toBe(
			`Os tipos de arquivos suportados são: image/jpeg.`,
		);
	});

	it('should create URLInvalidSignatureError', () => {
		const error = URLInvalidSignatureError.ptBR();

		expect(error).toBeInstanceOf(BusinessRuleViolationError);
		expect(error.name).toBe('URLInvalidSignatureError');
		expect(error.code).toBe(161613146);
		expect(error.message).toBe('URL com assinatura inválida.');
		expect(error.status).toBe(404);
		expect(error.hint).toBe(
			'A URL que você está tentando acessar não é mais válida.',
		);
	});
});
