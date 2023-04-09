const draw = (arg) => {
	return (Array.isArray(arg))
		? arg[Math.floor(Math.random() * arg.length)]
		: Math.floor(Math.random() * arg);
};

export default {
	template: /*html*/`
	<div class="row" style="height: 100vh">
		<div class="d-grid gap-3 col-lg-4 mx-auto my-auto">
			<div class="hstack">
				<span class="fs-1 text-center" style="width: 48px;">{{ state < 0 ? '🙂' : state == index ? '🤩' : '😭' }}</span>
				<h1 class="mx-auto">{{ this.words.length > this.index && words[index].tr }}</h1>
				<span style="width: 48px;"></span>
			</div>
			<button
				type="button"
				class="btn btn-lg rounded-4"
				:class="color(i)"
				:disabled="state >= 0"
				v-for="(word, i) in words"
				:key="i"
				@click="state = i"
			>
				{{ word.ru }}
			</button>
			<hr>
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
			state: 0
		};
	},
	mounted() {
		fetch('./data/turkish.csv')
			.then(res => res.text())
			.then(text => {
				this.dic = text
					.split('\r\n')
					.map(str => str.split(';').map(str => str.split('?')[0]))
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
			if (this.state < 0) {
				this.state = this.index;
			} else {
				this.words = Array.from({ length: 4 })
				.map(_ => draw(this.dic));
				this.index = draw(this.words.length);
				this.state = -1;
			}

//			console.log(this.words, this.index);
		}
	}
}
