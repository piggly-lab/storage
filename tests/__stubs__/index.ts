import path from 'path';

export const zipFilePath = () =>
	path.join(path.resolve(__dirname), 'empty_file.zip');

export const jpgFilePath = () =>
	path.join(path.resolve(__dirname), 'empty_file.jpg');

export const pngFilePath = () =>
	path.join(path.resolve(__dirname), 'empty_file.png');

export const docFilePath = () =>
	path.join(path.resolve(__dirname), 'empty_file.docx');
