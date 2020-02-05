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

export function countFinds(string, subString, allowOverlapping) {
	string += "";
	subString += "";
	if (subString.length <= 0) return (string.length + 1);

	var n = 0,
		pos = 0,
		step = allowOverlapping ? 1 : subString.length;

	while (true) {
		pos = string.indexOf(subString, pos);
		if (pos >= 0) {
			++n;
			pos += step;
		} else break;
	}
	
	return n;
}

export function selectNextByKey(elements, currentIndex, key) {
	key = key.toLowerCase();
	if ((currentIndex === -1) || (elements[currentIndex].label[0].toLowerCase() !== key)) {
	    let newSelection = elements.find((i) => i.label[0].toLowerCase() === key);
	    if (!newSelection) {
	        return;
	    }
	    return newSelection.value;
	} else {
	    let nextItem = elements[currentIndex + 1];
	    if (!nextItem) {
	        return;
	    }
	    if (nextItem.label[0].toLowerCase() === key) {
	        return nextItem.value;
	    } else {
	        let newSelection = (currentIndex - 1);
	        for (; newSelection >= 0; newSelection--) {
	            if (elements[newSelection].label[0].toLowerCase() !== key) {
	                break;
	            }
	        }
	        return elements[newSelection + 1].value;
	    }
	}
}