class LaunchersController {
	constructor(launchers) {
		this.launchers = launchers;
	}
	create(props) {
		return this.launchers.map(launcher => launcher.create(props));
	}
	remove() {
		// noop
	}
	async removeBy(pairs) {
		return this.launchers.map(async launcher => await launcher.removeBy(pairs));
	}
}

export default LaunchersController;

