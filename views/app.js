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

// Parse TSV
// Show confetti
// Integrate into Telegram

// Choose vocabs
// Start lesson: random/repeat

export default {
	template: /*html*/`
	<div class="row col-lg-6 mx-auto" style="height: 100dvh">
		<div class="vstack gap-3 mt-3 mb-5">
			<div>
				<h1 class="hstack gap-3">
					<span>{{ emoji() }}</span>
					<span class="ms-auto">{{ stats.pass }} / {{ stats.total }}</span>
				</h1>
				<div class="progress mt-3" role="progressbar" aria-label="Learning progress" :aria-valuenow="stats.progress" aria-valuemin="0" aria-valuemax="100">
					<div class="progress-bar overflow-visible bg-success" :style="{ width: stats.progress + '%' }">{{ Math.round(stats.progress * 100) / 100 + '%' }}</div>
				</div>
			</div>
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
				pos: new Audio('./data/pos.m4a'),
				neg: new Audio('./data/neg.m4a')
			}
		};
	},
	computed: {
		stats() {
			let temp = this.dic.reduce((prev, { stats }) => {
				prev.pass += stats.pass.count;
				prev.fail += stats.fail.count;
				prev.maxProgress += Math.max(2, stats.total());
				return prev;
			}, { pass: 0, fail: 0, maxProgress: 0 });
			return {
				...temp,
				total: temp.pass + temp.fail,
				progress: temp.pass / temp.maxProgress * 100
			};
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

						return {
							tr,
							ru,
							partOfSpeech,
							stats: {
								draw: { time: stats[6 * i + 0] || 0, count: stats[6 * i + 1] || 0 },
								pass: { time: stats[6 * i + 2] || 0, count: stats[6 * i + 3] || 0 },
								fail: { time: stats[6 * i + 4] || 0, count: stats[6 * i + 5] || 0 },
								total() {
									return this.pass.count + this.fail.count;
								}
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
		draw(words, count, index, cache) {
			let probs = cache || words.reduce((prev, { stats }) => {
				prev.push((prev.length ? prev[prev.length - 1] : 0) + 1 - stats.pass.count / Math.max(2, stats.total()));
				return prev;
			}, []);

			if (count > 1) {
				let arr = [];
				while (arr.length < count) {
					let drawn = this.draw(words, 1, index, probs);
					if (!arr.includes(drawn))
						arr.push(drawn);
				}
				return arr;
			}

			let r = Math.random() * probs[probs.length - 1];
			let i = probs.findIndex(prob => prob >= r);
			return index ? i : words[i];
		},
		question() {
			if (this.state < 0) {
				this.state = this.index;
			} else {
				let partOfSpeech = this.draw(this.dic).partOfSpeech;
				this.words = this.draw(this.grouped[partOfSpeech], 4);
				this.index = this.draw(this.words, 1, true);
				this.state = -1;
				let total = this.words[this.index].stats.total();
				this.from = total % 2 === 0 ? 'tr' : 'ru';
				this.to = total % 2 !== 0 ? 'tr' : 'ru';

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

			let word = this.words[this.index];
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

			window.localStorage.setItem('stats', JSON.stringify(this.dic.flatMap(word => [
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
