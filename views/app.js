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

const watchLocalStorage = (...keys) => {
	return keys.reduce((prev, curr) => {
		prev[curr] = (value) => window.localStorage.setItem(curr, value);
		return prev;
	}, {});
};

const ruVowels = [ 'у', 'е', 'ы', 'а', 'о', 'э', 'ё', 'я', 'и', 'ю' ];
const trVerbSuffixes = [ 'mak', 'mek' ];

// Parse CSV
// Show confetti
// Store per word: total/time * draw/pass/fail
// Start lesson: random/repeat

export default {
	template: /*html*/`
	<div class="row col-lg-6 mx-auto" style="height: 100dvh">
		<div class="vstack gap-3 mt-3 mb-4">
			<h1 class="hstack gap-3">
				<span>{{ emoji() }}</span>
				<span class="ms-auto">{{ pass }} / {{ pass + fail }}</span>
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

			pass: 0,
			fail: 0,

			emojis: {
				def: '🙂',
				pos: [ '😀', '🥹', '😅', '😇', '😉', '🧐', '😎', '🤩', '🥳', '😏' ],
				neg: [ '😞', '😖', '😫', '😢', '😭', '😤', '😠', '🤬', '🤯', '😨' ]
			}
		};
	},
	computed: {
		total() {
			return this.pass + this.fail;
		}
	},
	watch: {
		...watchLocalStorage('pass', 'fail')
	},
	mounted() {
		let separators = ['";"', '";', ';"', ';'];

		fetch('./data/turkish.csv')
			.then(res => res.text())
			.then(text => {
				this.dic = text
					.split('\r\n')
					.map(str => separators.reduce((prev, curr) => prev || str.includes(curr) && str.split(curr), null).map(str => str.trim('"?')))
					.map(arr => {
						let tr = arr[0];
						let ru = arr[1];
						let partOfSpeech = ru.endsWith('ть') && tr.endsWith(trVerbSuffixes)
							? 1
							: ru.endsWith('й') && ruVowels.includes(ru[ru.length - 2])
								? 2
								: 0;

						return { tr, ru, partOfSpeech };
					})
					.filter(obj => obj.ru && obj.tr);
				this.dic.forEach(word => {
					this.grouped[word.partOfSpeech].push(word);
				});

				this.question();
			});

			this.pass = +window.localStorage.getItem('pass');
			this.fail = +window.localStorage.getItem('fail');
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
				this.from = this.total % 2 === 0 ? 'tr' : 'ru';
				this.to = this.total % 2 !== 0 ? 'tr' : 'ru';

				new bootstrap.Button('#question').toggle();
			}

//			console.log(this.words, this.index);
		},
		answer(i) {
			this.state = i;

			if (this.state == this.index) {
				this.pass++;
			} else {
				this.fail++;
			}
		}
	}
}
