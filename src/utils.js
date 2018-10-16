export function generateId(prefix = "id") {
	return `${prefix}_` + Math.trunc(Math.random() * 99999999);
}

export function delay(n) {
	return new Promise((resolve) => setTimeout(resolve, n));
}

// port validation?
export function randomizePort() {
	return 9999 + Math.trunc(Math.random() * 9999);
}

export function replaceString(str, replaces) {
	let newStr = str;
	for (let [name, replacement] of Object.entries(replaces)) {
		newStr = newStr.replace(new RegExp(`\\$${name}\\b`, 'g'), replacement);
	}
	return newStr;
}