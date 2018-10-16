import Project from './Project.js'
import { head, findIndex } from 'lodash/array'
import { matches } from 'lodash/util'
import { cloneDeep } from 'lodash/lang'

class ProjectController {
	constructor(store) {
		this.store = store;
	}
	create(props) {
		const project = new Project(props);
		this.store.projects.items.push(project);
		return project;
	}
	remove(id) {
		const { items } = this.store.projects;
		const preset = head(items.splice(findIndex(items, matches({ id })), 1));
		return preset;
	}
	addUserProjects(userProjects) {
		if (!userProjects) return;
		if (!Array.isArray(userProjects)) {
			console.warn('User projects were not added, because no root array was found!');
			return;
		}
		for (let userProject of userProjects) {
			const project = Object.assign(new Project(), cloneDeep(userProject));
			this.store.projects.items.push(project);
		}
	}
	getUserProjects() {
		const projects = [];
		for (let project of this.store.projects.items) {
			projects.push(cloneDeep(project));
		}
		return projects;
	}
}

export default ProjectController; 