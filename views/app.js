import ext from './ext.js';

ext();

const draw = (arg) => {
	return (Array.isArray(arg))
		? arg[Math.floor(Math.random() * arg.length)]
		: Math.floor(Math.random() * arg);
};

export default {
	template: /*html*/`
	<div class="row col-lg-6 mx-auto" style="height: 100dvh">
		<div class="vstack gap-3 mt-2 mb-3">
			<h1 class="hstack gap-3">
				<span>{{ emoji() }}</span>
				<span class="ms-auto">{{ pass }} / {{ pass + fail }}</span>
			</h1>
			<h1 class="mx-auto my-auto">{{ this.words.length > this.index && words[index].tr }}</h1>
			<button
				type="button"
				class="btn btn-lg rounded-4"
				:class="color(i)"
				:disabled="state >= 0"
				v-for="(word, i) in words"
				:key="i"
				@click="answer(i)"
			>
				{{ word.ru }}
			</button>
			<hr class="my-0">
			<button
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

			words: [],
			index: 0,
			state: 0,

			pass: 0,
			fail: 0,

			emojis: {
				def: '🙂',
				pos: [ '😀', '🥹', '😅', '😇', '😉', '🧐', '😎', '🤩', '🥳', '😏' ],
				neg: [ '😞', '😖', '😫', '😢', '😭', '😤', '😠', '🤬', '🤯', '😨' ]
			}
		};
	},
	mounted() {
		let separators = ['";"', '";', ';"', ';'];

		fetch('./data/turkish.csv')
			.then(res => res.text())
			.then(text => {
				this.dic = text
					.split('\r\n')
					.map(str => separators.reduce((prev, curr) => prev || str.includes(curr) && str.split(curr), null).map(str => str.trim('"?')))
					.map(arr => ({ tr: arr[0], ru: arr[1] }))
					.filter(obj => obj.ru && obj.tr);

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
				this.words = Array.from({ length: 4 })
					.map(_ => draw(this.dic));
				this.index = draw(this.words.length);
				this.state = -1;
			}

//			console.log(this.words, this.index);
		},
		answer(i) {
			this.state = i;

			if (this.state == this.index) {
				this.pass++;

				window.localStorage.setItem('pass', this.pass);
			} else {
				this.fail++;

				window.localStorage.setItem('fail', this.fail);
			}
		}
	}
}
