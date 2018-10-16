import Path from 'path'
import fs from "fs"
import util from "util"

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const readFileSync = fs.readFileSync;
const writeFileSync = fs.writeFileSync;
const stat = util.promisify(fs.stat);

// todo: add file/folder watch handlers

class FileSystemService {
	constructor() {
		this.jsonCache = new Map();
	}
	async getFileList(path, ext = '*') {
		let items = [];
		try {
			let files = await readdir(path);
			let regex = new RegExp(`\.${ext}$`); // fixme: dot in the name does not guarantee it's a file
			files = files.map((file) => regex.test(file) && Path.join(path, file));
			items = (await Promise.all(files)).filter(file => file !== false);
		}
		catch (msg) {}
		return items;
	}
	async getFolderList(path) {
		let items = [];
		try {
			let files = await readdir(path);
			files = files.map(async file => ((await stat(Path.join(path, file))).isDirectory() && file));
			items = (await Promise.all(files)).filter(file => file !== false && !file.startsWith('.'));
		}
		catch (msg) { }
		return items;
	}
	async exists(path) {
		try {
			await stat(path);
			return true;
		}
		catch (err) {
			return false;
		}
	}
	async contains(dirpath, ...fileNames) {
		const result = [];
		let files = await this.getFileList(dirpath);
		for (let fileName of fileNames) {
			const normalized = Path.normalize(`${dirpath}/${fileName}`);
			if (files.includes(normalized)) {
				result.push(normalized);
			}
		}
		return result;
	}
	async json(path, cached = false) {
		if (cached && this.jsonCache.has(path)) {
			return this.jsonCache.get(path);
		}
		else {
			try {
				const json = JSON.parse((await readFile(path)).toString('utf8'));
				this.jsonCache.set(path, json);
				return json;
			}
			catch (err) { console.log(err); }
		}
	}
	jsonSync(path, cached = false) {
		if (cached && this.jsonCache.has(path)) {
			return this.jsonCache.get(path);
		}
		else {
			try {
				const json = JSON.parse(readFileSync(path).toString('utf8'));
				this.jsonCache.set(path, json);
				return json;
			}
			catch (err) { console.log(err); }
		}
	}
	async writeJson(path, obj) {
		const json = JSON.stringify(obj, 0, 4);
		try {
			await writeFile(path, json);
		}
		catch (err) { console.log(err); }
	}
	writeJsonSync(path, obj) {
		const json = JSON.stringify(obj, 0, 4);
		try {
			writeFileSync(path, json);
		}
		catch (err) { console.log(err); }
	}
}

export default FileSystemService;