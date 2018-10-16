import { generateId } from './utils'

class Preset {
	constructor(props) {
		this.id = props.id || generateId('preset');
		this.name = props.name || "unnamed preset";
		// draft of stages, all changes before save go here, 
		// on save all changes are copied into stages
		this.draft = {
			bsp: { enabled: true, switches: {} },
			vis: { enabled: true, switches: {} },
			light: { enabled: true, switches: {} },
		};
		this.stages = {
			bsp: { enabled: true, switches: {} },
			vis: { enabled: true, switches: {} },
			light: { enabled: true, switches: {} },
		};
		this.frozen = false;
		this.temp = false;
	}
}

export default Preset;