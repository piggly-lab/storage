import { BusinessRuleViolationError } from '@piggly/ddd-toolkit';

export default class FileAlreadyExistsError extends BusinessRuleViolationError {
	constructor(message: string, hint: string) {
		super('FileAlreadyExistsError', message, hint, 409);
	}

	public static ptBR(): FileAlreadyExistsError {
		return new FileAlreadyExistsError(
			'Arquivo já existe.',
			`O arquivo que você está tentando adicionar já existe e não pode ser adicionado novamente.`,
		);
	}

	public static lang(lang: string): FileAlreadyExistsError {
		switch (lang) {
			case 'ptBR':
				return FileAlreadyExistsError.ptBR();
			case 'enUS':
			default:
				return FileAlreadyExistsError.enUS();
		}
	}

	public static enUS(): FileAlreadyExistsError {
		return new FileAlreadyExistsError(
			'File already exists.',
			`The file you are trying to add already exists and cannot be added again.`,
		);
	}
}
