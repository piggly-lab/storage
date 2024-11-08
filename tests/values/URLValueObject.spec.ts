import URLValueObject from '@/values/URLValueObject.js';

describe('core -> modules -> shared -> values -> URLValueObject', () => {
	it.each([
		[
			'http://bloglovin.com/at/nulla/suspendisse/potenti.jpg',
			'bloglovin.com',
		],
		['http://flavors.me/aenean/lectus.html', 'flavors.me'],
		['http://youtube.com/vel/augue.xml', 'youtube.com'],
		['http://t-online.de/integer/aliquet/massa/id.jpg', 't-online.de'],
		['http://netvibes.com/interdum/venenatis.html', 'netvibes.com'],
		[
			'https://symantec.com/luctus/tincidunt/nulla/mollis.json',
			'symantec.com',
		],
		['https://washingtonpost.com/vel.json', 'washingtonpost.com'],
		['http://blogger.com/ac/leo/pellentesque.js', 'blogger.com'],
		['http://tmall.com/ut/erat/id/mauris.html', 'tmall.com'],
		[
			'https://last.fm/faucibus/orci/luctus/et/ultrices/posuere/cubilia.js',
			'last.fm',
		],
		[
			'http://localhost:3000/faucibus/orci/luctus/et/ultrices/posuere/cubilia.js',
			'localhost:3000',
		],
	])('should be a valid URL', (uri, host) => {
		const url = URLValueObject.create(uri);

		expect(url.isSuccess).toBe(true);
		expect(url.data.string).toBe(uri);
		expect(url.data.url.host).toBe(host);
	});

	it.each([['unknown'], ['flavors.me']])('should be an invalid URL', uri => {
		const url = URLValueObject.create(uri);

		expect(url.isFailure).toBe(true);
		expect(url.error.code).toBe(2428151059);
		expect(url.error.message).toBe(
			'URL is not valid, please fix it before continue.',
		);
	});

	it('should concat a path in a immutable way', () => {
		const url = URLValueObject.createRaw(new URL('http://google.com'));
		const newest = url.concat('search');

		expect(url).not.toBe(newest);
		expect(url.string).toBe('http://google.com/');
		expect(newest.string).toBe('http://google.com/search');
	});

	it('should concat a path in a immutable way', () => {
		const url = URLValueObject.createRaw(new URL('http://google.com/'));
		const newest = url.concat('/search');

		expect(url).not.toBe(newest);
		expect(url.string).toBe('http://google.com/');
		expect(newest.string).toBe('http://google.com/search');
	});
});
