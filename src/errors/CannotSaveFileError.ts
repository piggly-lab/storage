import { BusinessRuleViolationError } from '@piggly/ddd-toolkit';

export default class CannotSaveFileError extends BusinessRuleViolationError {
	constructor(message: string, hint: string) {
		super('CannotSaveFileError', message, hint, 500);
	}

	public static ptBR(): CannotSaveFileError {
		return new CannotSaveFileError(
			'Não foi possível salvar o arquivo.',
			`O sistema produziu um erro ao tentar salvar o arquivo na base de dados.`,
		);
	}

	public static lang(lang: string): CannotSaveFileError {
		switch (lang) {
			case 'ptBR':
				return CannotSaveFileError.ptBR();
			case 'enUS':
			default:
				return CannotSaveFileError.enUS();
		}
	}

	public static enUS(): CannotSaveFileError {
		return new CannotSaveFileError(
			'Cannot save file.',
			`The system produced an error while trying to save the file to the database.`,
		);
	}
}
