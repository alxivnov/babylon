import ext from './ext.js';

ext();

const draw = (arg, unique, except) => {
	if (unique > 1) {
		let arr = [];
		while (arr.length < unique) {
			let drawn = draw(arg);
			if (!arr.includes(drawn) && !except?.includes(drawn))
				arr.push(drawn);
		}
		return arr;
	}

	return (Array.isArray(arg))
		? arg[Math.floor(Math.random() * arg.length)]
		: Math.floor(Math.random() * arg);
};

// const watchLocalStorage = (...keys) => {
// 	return keys.reduce((prev, curr) => {
// 		prev[curr] = (value) => window.localStorage.setItem(curr, value);
// 		return prev;
// 	}, {});
// };

const ruVowels = [ 'у', 'е', 'ы', 'а', 'о', 'э', 'ё', 'я', 'и', 'ю' ];
const trVerbSuffixes = [ 'mak', 'mek' ];

// Parse CSV
// Show confetti
// Store per word: total/time * draw/pass/fail
// Start lesson: random/repeat

export default {
	template: /*html*/`
	<div class="row col-lg-6 mx-auto" style="height: 100dvh">
		<div class="vstack gap-3 mt-3 mb-5">
			<h1 class="hstack gap-3">
				<span>{{ emoji() }}</span>
				<span class="ms-auto">{{ stats.pass }} / {{ stats.total }}</span>
			</h1>
			<h1 class="mx-auto my-auto">{{ this.words.length > this.index && words[index][from] }}</h1>
			<button
				type="button"
				class="btn btn-lg rounded-4"
				:class="color(i)"
				:disabled="state >= 0"
				v-for="(word, i) in words"
				:key="i"
				@click="answer(i)"
			>
				{{ word[to] }}
			</button>
			<hr class="my-0">
			<button
				id="question"
				type="button"
				class="btn btn-lg rounded-4"
				:class="state >= 0 ? 'btn-secondary' : 'btn-outline-secondary'"
				@click="question"
			>
				{{ state >= 0 ? 'дальше' : 'не знаю' }}
			</button>
		</div>
	</div>
	`,
	data() {
		return {
			dic: [],
			grouped: [ [], [], [] ],

			words: [],
			index: 0,
			state: 0,
			from: 'tr',
			to: 'ru',

			emojis: {
				def: '🙂',
				pos: [ '😀', '🥹', '😅', '😇', '😉', '🧐', '😎', '🤩', '🥳', '😏' ],
				neg: [ '😞', '😖', '😫', '😢', '😭', '😤', '😠', '🤬', '🤯', '😨' ]
			},

			sounds: {
				pos: new Audio('./data/Portal2_sfx_button_positive.m4a'),
				neg: new Audio('./data/Portal2_sfx_button_negative.m4a')
			}
		};
	},
	computed: {
		stats() {
			let stats = this.dic.reduce((prev, curr) => {
				prev.pass += curr.stats.pass.count;
				prev.fail += curr.stats.fail.count;
				return prev;
			}, { pass: 0, fail: 0 });
			return { ...stats, total: stats.pass + stats.fail };
		}
	},
	mounted() {
		let separators = ['";"', '";', ';"', ';'];

		fetch('./data/turkish.csv')
			.then(res => res.text())
			.then(text => {
				let stats =
					JSON.parse(window.localStorage.getItem('stats')) ||
					[];

				this.dic = text
					.split('\r\n')
					.map(str => separators.reduce((prev, curr) => prev || str.includes(curr) && str.split(curr), null).map(str => str.trim('"?')))
					.map((arr, i) => {
						let tr = arr[0];
						let ru = arr[1];
						let partOfSpeech = ru.split(' ').some(word => word.endsWith(['ть', 'ться'])) && tr.endsWith(trVerbSuffixes)
							? 1
							: ru.endsWith('й') && ruVowels.includes(ru[ru.length - 2])
								? 2
								: 0;
						let s = stats[i] || [];

						return {
							tr,
							ru,
							partOfSpeech,
							stats: {
								draw: { time: s[0] || 0, count: s[1] || 0 },
								pass: { time: s[2] || 0, count: s[3] || 0 },
								fail: { time: s[4] || 0, count: s[5] || 0 }
							}
						};
					})
					.filter(obj => obj.ru && obj.tr);
				this.dic.forEach(word => {
					this.grouped[word.partOfSpeech].push(word);
				});

				this.question();
			});
	},
	methods: {
		emoji() {
			return this.state < 0 ? this.emojis.def : draw(this.state == this.index ? this.emojis.pos : this.emojis.neg);
		},
		color(i) {
			// not answered
			return this.state < 0
				? 'btn-outline-success'
				: this.index == i
					? this.state == i
						? 'btn-success'
						: 'btn-success'
					: this.state == i
						? 'btn-danger'
						: 'btn-outline-secondary';
		},
		question() {
			if (this.state < 0) {
				this.state = this.index;
			} else {
				let partOfSpeech = draw(this.dic).partOfSpeech;
				this.words = draw(this.grouped[partOfSpeech], 4);
				this.index = draw(this.words.length);
				this.state = -1;
				this.from = this.stats.total % 2 === 0 ? 'tr' : 'ru';
				this.to = this.stats.total % 2 !== 0 ? 'tr' : 'ru';

				let time = Date.now();
				this.words.forEach(word => {
					word.stats.draw.time = time;
					word.stats.draw.count++;
				});

//				new bootstrap.Button('#question').toggle();
			}

//			console.log(this.words, this.index);
		},
		answer(i) {
			this.state = i;

			let word = this.words[i];
			let time = Date.now();
			if (this.state == this.index) {
				this.sounds.pos.play();

				word.stats.pass.time = time;
				word.stats.pass.count++;
			} else {
				this.sounds.neg.play();

				word.stats.fail.time = time;
				word.stats.fail.count++;
			}

			window.localStorage.setItem('stats', JSON.stringify(this.dic.map(word => [
				word.stats.draw.time,
				word.stats.draw.count,
				word.stats.pass.time,
				word.stats.pass.count,
				word.stats.fail.time,
				word.stats.fail.count,
			])));
		}
	}
}
