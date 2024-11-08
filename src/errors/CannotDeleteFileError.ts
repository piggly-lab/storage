import { BusinessRuleViolationError } from '@piggly/ddd-toolkit';

export default class CannotDeleteFileError extends BusinessRuleViolationError {
	constructor(message: string, hint: string) {
		super('CannotDeleteFileError', message, hint, 500);
	}

	public static ptBR(): CannotDeleteFileError {
		return new CannotDeleteFileError(
			'Não foi possível remover o arquivo.',
			`O sistema produziu um erro ao tentar remover o arquivo da base de dados.`,
		);
	}

	public static lang(lang: string): CannotDeleteFileError {
		switch (lang) {
			case 'ptBR':
				return CannotDeleteFileError.ptBR();
			case 'enUS':
			default:
				return CannotDeleteFileError.enUS();
		}
	}

	public static enUS(): CannotDeleteFileError {
		return new CannotDeleteFileError(
			'Cannot delete file.',
			`The system produced an error while trying to remove the file from the database.`,
		);
	}
}
