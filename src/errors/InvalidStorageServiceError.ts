import { BusinessRuleViolationError } from '@piggly/ddd-toolkit';

export default class InvalidStorageServiceError extends BusinessRuleViolationError {
	constructor(message: string, hint: string) {
		super('InvalidStorageServiceError', message, hint, 422);
	}

	public static lang(lang: string): InvalidStorageServiceError {
		switch (lang) {
			case 'ptBR':
				return InvalidStorageServiceError.ptBR();
			case 'enUS':
			default:
				return InvalidStorageServiceError.enUS();
		}
	}

	public static ptBR(): InvalidStorageServiceError {
		return new InvalidStorageServiceError(
			'Provedor de armazenamento inválido.',
			`O provedor de armazenamento não é compatível com o arquivo enviado.`,
		);
	}

	public static enUS(): InvalidStorageServiceError {
		return new InvalidStorageServiceError(
			'Invalid storage service.',
			`The storage service is not compatible with the file sent.`,
		);
	}
}
