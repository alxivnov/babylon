const draw = (arg) => {
	return (Array.isArray(arg))
		? arg[Math.floor(Math.random() * arg.length)]
		: Math.floor(Math.random() * arg);
};

export default {
	template: /*html*/`
<div class="container text-center">
	<div class="row align-items-center">
		<div class="d-grid gap-3 col-lg-4 mx-auto my-3">
			<h1 class="mx-auto">{{ this.words.length > this.index && words[index].tr }}</h1>
			<button
				type="button"
				class="btn"
				:class="color(i)"
				v-for="(word, i) in words"
				:key="i"
				@click="state = i"
			>{{ word.ru }}</button>
			<button
				type="button"
				class="btn btn-light"
				v-show="state >= 0"
				@click="question"
			>далее</button>
		</div>
	</div>
</div>
	`,
	data() {
		return {
			dic: [],

			words: [],
			index: 0,
			state: -1,
		};
	},
	mounted() {
		fetch('../data/turkish.csv')
			.then(res => res.text())
			.then(text => {
				this.dic = text
					.split('\r\n')
					.map(str => str.split(';'))
					.map(arr => ({ tr: arr[0], ru: arr[1] }))
					.filter(obj => obj.ru && obj.tr);

				this.question();
			});
	},
	methods: {
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
			this.words = Array.from({ length: 4 })
				.map(_ => draw(this.dic));
			this.index = draw(this.words.length);
			this.state = -1;

			console.log(this.words, this.index);
		}
	}
}
