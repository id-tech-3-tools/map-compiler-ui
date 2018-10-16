// conectionless q3 compatible net channel messaging

import dgram from 'dgram'
const socket = new dgram.Socket('udp4');
const channel = '\xff\xff\xff\xff';
const host = 'localhost';

function sendMessage(port, message) {
	return new Promise(function (resolve, reject) {
		const buff = Buffer.from(`${channel}${message}`, 'ascii');
		socket.send([buff], port, host, (err) => {
			if (err) return (console.error(err), reject());
			else (console.log(`send [${port}] -> ${message}`), resolve());
		});
	});
}

export default sendMessage;