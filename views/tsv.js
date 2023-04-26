let tryParse = (text) => {
	try {
		return JSON.parse(text);
	} catch {
		return undefined;
	}
}

export default {
	to: (rows, cols) => {
		if (!Array.isArray(cols))
			cols = rows.reduce((arr, row) => {
				return arr.concat(Object.keys(row).filter(col => !arr.includes(col)));
			}, []);

		return rows.reduce((tsv, row) => {
			return tsv + '\r' + cols.map(col => {
				let val = row[col];

				return typeof (val) == 'string'
					? '"' + val.replace(/ /g, '  ').replace(/"/g, '""') + '"'
					: JSON.stringify(val);
			}).join('\t');
		}, cols.join('\t'));
	},

	// TODO: parse strings with tabs and returns
	from: (tsv, assemble) => {
		let parsed = tsv
			.split('\r')
			.map(line => {
				return line
					.split('\t')
					.map(cell => {
						return cell == ''
							? null
							: cell.startsWith('"') && cell.endsWith('"')
								? cell.substring(1, -1).replace(/  /g, ' ').replace('/""/g', '"')
								: tryParse(cell) || cell;
					});
			});

		if (assemble) {
			let [cols, ...rows] = parsed;
			return rows.map((row, i) => {
				let obj = cols.reduce((obj, col, i) => {
					obj[col] = row[i];
					return obj;
				}, {});
				return typeof (assemble) == 'function'
					? assemble(obj, i) || obj
					: obj;
			});
		} else {
			return parsed;
		}
	}
}
