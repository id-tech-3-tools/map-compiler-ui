import os from 'os';
import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { mapField, mapFieldWithStore } from './libs/vuex-field-mapper'
import AsyncComputed from 'vue-async-computed'
import VueUi from '@vue/ui'

Vue.use(VueUi)
Vue.use(AsyncComputed)
Vue.config.productionTip = false;

import ApiRoute from './ApiRouter'
import ProjectController from './ProjectController'
import TaskController from './TaskController'
import CompilerLauncherController from './CompilerLauncherController'
import BspcLauncherController from './BspcLauncherController'
import GameLauncherController from './GameLauncherController'
import LaunchersController from './LaunchersController'
import PresetController from './PresetController'
import MasterLauncherController from './MasterLauncherController'
import FileSystemService from './FileSystemService'
import CommonController from './CommonController'
import OutputBufferController from "./OutputBufferController"

const fileSystem = new FileSystemService();
const api = new ApiRoute();
const storeWrapper = mapFieldWithStore(store, {
    ...(Object.keys(store.state).reduce((o, item) => (o[item] = item, o), {})),
    project(state) {
        const { id } = router.history.current.params;
        const project = state.projects.items.find(project => project.id == id); 
        return project;
    },
    preset(state) {
        const { id } = this.project.preset;
        return state.presets.items.find(item => item.id == id);
    }
});

const cwd = process.cwd();

const gameDefinitions = fileSystem.jsonSync(`${cwd}/data/game-definitions.json`, true); 
const projectCtrl = new ProjectController(storeWrapper);
const taskCtrl = new TaskController(storeWrapper);
const compilerLauncherCtrl = new CompilerLauncherController(storeWrapper, taskCtrl, gameDefinitions);
const bspcLauncherCtrl = new BspcLauncherController(storeWrapper, taskCtrl, gameDefinitions);
const gameLauncherCtrl = new GameLauncherController(storeWrapper, taskCtrl, gameDefinitions);
const masterLauncherCtrl = new MasterLauncherController(storeWrapper, compilerLauncherCtrl, [bspcLauncherCtrl, gameLauncherCtrl]);
const launchersCtrl = new LaunchersController([compilerLauncherCtrl, bspcLauncherCtrl, gameLauncherCtrl, masterLauncherCtrl]); // fix master order?
const presetCtrl = new PresetController(storeWrapper);
const commonCtrl = new CommonController(storeWrapper);
const outputCtrl = new OutputBufferController(storeWrapper);

// add default presets
presetCtrl.addDefaultPresets(fileSystem.jsonSync(`${cwd}/data/compiler-presets.json`, true));
// add user generated data
presetCtrl.addUserPresets(fileSystem.jsonSync(`${cwd}/data/user/user-compiler-presets.json`, true));
projectCtrl.addUserProjects(fileSystem.jsonSync(`${cwd}/data/user/user-projects.json`, true));
compilerLauncherCtrl.addUserLaunchers(fileSystem.jsonSync(`${cwd}/data/user/user-compiler-launchers.json`, true));
bspcLauncherCtrl.addUserLaunchers(fileSystem.jsonSync(`${cwd}/data/user/user-bspc-launchers.json`, true));
gameLauncherCtrl.addUserLaunchers(fileSystem.jsonSync(`${cwd}/data/user/user-game-launchers.json`, true));
masterLauncherCtrl.addUserLaunchers(fileSystem.jsonSync(`${cwd}/data/user/user-master-launchers.json`, true));
taskCtrl.addUserTasks(fileSystem.jsonSync(`${cwd}/data/user/user-tasks.json`, true));

// install buffers for all imported projects
outputCtrl.createMultiple(storeWrapper.projects.items.map(item => ({ parent: item.id, type: "compiler" })));
outputCtrl.createMultiple(storeWrapper.projects.items.map(item => ({ parent: item.id, type: "bspc" })));

api.route('/projects/create', () => {
    console.log('⚡ creating new project!');
    const project = projectCtrl.create();
    launchersCtrl.create({ parent: project.id });
    outputCtrl.create({ parent: project.id, type: "compiler" });
    outputCtrl.create({ parent: project.id, type: "bspc" });
});

api.route('/projects/remove', async (payload) => {
    console.log(`⚡ remove the project ${payload.id}`);
    projectCtrl.remove(payload.id);
    await taskCtrl.removeBy({ parent: payload.id });
    await launchersCtrl.removeBy({ parent: payload.id });
    outputCtrl.removeBy({ parent: payload.id });
});

api.route('/launchers/compiler/start', (payload) => {
    console.log(`⚡ requesting compiler launcher ${payload.id} start`);
    compilerLauncherCtrl.start(payload.id);
});

api.route('/launchers/compiler/stop', (payload) => {
    console.log(`⚡ requesting compiler launcher ${payload.id} stop`);
    compilerLauncherCtrl.stop(payload.id);
});

api.route('/launchers/bspc/start', (payload) => {
    console.log(`⚡ requesting bspc launcher ${payload.id} start`);
    bspcLauncherCtrl.start(payload.id);
});

api.route('/launchers/bspc/stop', (payload) => {
    console.log(`⚡ requesting bspc launcher ${payload.id} stop`);
    bspcLauncherCtrl.stop(payload.id);
});

api.route('/launchers/game/start', (payload) => {
    console.log(`⚡ requesting game launcher ${payload.id} start`);

    gameLauncherCtrl.start(payload.id);
});

api.route('/launchers/game/stop', (payload) => {
    console.log(`⚡ requesting game launcher ${payload.id} stop`);
    gameLauncherCtrl.stop(payload.id);
});

api.route('/launchers/game/restart', (payload) => {
    console.log(`⚡ requesting game launcher ${payload.id} restart`);
    gameLauncherCtrl.restart(payload.id);
});

api.route('/launchers/master/start', (payload) => {
    console.log(`⚡ requesting master launcher ${payload.id} start with ${payload.stage ? payload.stage + " stage" : "all enabled stages" } `);
    masterLauncherCtrl.start(payload.id, payload.stage);
});

api.route('/launchers/master/stop', (payload) => {
    console.log(`⚡ requesting master launcher ${payload.id} stop`);
    masterLauncherCtrl.stop(payload.id);
});

api.route('/launchers/master/auto-start', (payload) => {
    console.log(`⚡ requesting master launcher ${payload.id} to auto start on ${payload.path} update`);
    masterLauncherCtrl.startAutoWatcher(payload.id, payload.path);
});

api.route('/launchers/master/auto-stop', (payload) => {
    console.log(`⚡ requesting master launcher ${payload.id} to stop auto start watcher`);
    masterLauncherCtrl.stopAutoWatcher(payload.id);
});

api.route('/launchers/master/auto-stop-all', () => {
    console.log(`⚡ requesting master launcher to stop all auto start watchers`);
    masterLauncherCtrl.stopAutoWatcherAll();
});

api.route("/tasks/create", () => {
    console.log(`⚡ creating new task for ${router.history.current.params.id} project!`);
    taskCtrl.create({ parent: router.history.current.params.id });
});

api.route("/tasks/remove", (payload) => {
    console.log(`⚡ remove the task ${payload.id}`);
    taskCtrl.remove(payload.id);
});

api.route('/tasks/start', (payload) => {
    console.log(`⚡ requesting task ${payload.id} start`);
    taskCtrl.start(payload.id);
});

api.route('/tasks/stop', (payload) => {
    console.log(`⚡ requesting task ${payload.id} stop`);
    taskCtrl.stop(payload.id);
});

api.route('/fs/filelist', async (payload) => {
    console.log(`⚡ requesting file list for path [${payload.path}] with ext [${payload.ext}]`);
    return await fileSystem.getFileList(payload.path, payload.ext);
});

api.route('/fs/switches-layout', () => {
    const cwd = process.cwd();
    return fileSystem.jsonSync(`${cwd}/data/switches-layout.json`, true);
});

api.route('/fs/game-definitions', () => {
    const cwd = process.cwd();
    return fileSystem.jsonSync(`${cwd}/data/game-definitions.json`, true);
});

api.route('/fs/contains', async (payload) => {
    return fileSystem.contains(payload.dirpath, ...payload.names);
});

api.route('/fs/dirlist', async (payload) => {
    console.log(`⚡ requesting folder list for path [${payload.path}]`);
    return await fileSystem.getFolderList(payload.path);
});

api.route('/presets/create', (payload) => {
    console.log(`⚡ creating new preset: ${payload.name}`);
    const preset = presetCtrl.create(payload);
    commonCtrl.assignPresetToProject(preset);
});

api.route('/presets/remove', (payload) => {
    console.log(`⚡ removing preset: ${payload.id}`);
    const preset = presetCtrl.remove(payload.id);
    commonCtrl.selectFirstPresetForProject();
    commonCtrl.backupPresetIntoProjects(preset);
});

api.route('/presets/reset', (payload) => {
    console.log(`⚡ resetting preset: ${payload.id}`);
    presetCtrl.reset(payload.id)
});

api.route('/presets/save', (payload) => {
    console.log(`⚡ saving preset: ${payload.id}`);
    presetCtrl.save(payload.id)
});

api.route('/presets/copy', (payload) => {
    console.log(`⚡ copying preset: ${payload.id}`);
    const preset = presetCtrl.copy(payload.id, payload.name);
    commonCtrl.assignPresetToProject(preset);
});

api.route('/presets/rename', (payload) => {
    console.log(`⚡ renaming preset: ${payload.id} to ${payload.name}`);
    presetCtrl.rename(payload.id, payload.name);
});

api.route('/presets/cleanup', () => {
    console.log(`⚡ requesting preset list clean up`);
    presetCtrl.cleanUp();
});

api.route('/presets/restore', (payload) => {
    console.log(`⚡ attempting to restore preset from the project ${payload.projectId}`);
    const preset = presetCtrl.restore(payload.projectId);
    if (!preset) {
        console.warn('rejected...');
        return;
    }
    commonCtrl.assignPresetToProject(preset);
});

api.route('/os/info', (payload) => {
    return {
        threads: os.cpus().length,
        arch: os.arch(),
        homedir: os.homedir(),
        os: os.platform()
    }
});

window.rystore = store;

function restoreLastView() {
    let currentPath = router.history.current.fullPath;
    let lastPath = localStorage.lastPath;
    if (lastPath && currentPath !== lastPath) {
        console.log('⚡ restoring path: "' + lastPath + '"');
        router.replace(lastPath);
    }
}

restoreLastView();

new Vue({
    provide: { api },
    router,
    store,
    render: h => h(App)
}).$mount("#app");

addEventListener('beforeunload', () => {
    // write down all updates
    fileSystem.writeJsonSync(`${cwd}/data/user/user-compiler-presets.json`, presetCtrl.getUserPresets());
    fileSystem.writeJsonSync(`${cwd}/data/user/user-projects.json`, projectCtrl.getUserProjects());
    fileSystem.writeJsonSync(`${cwd}/data/user/user-compiler-launchers.json`, compilerLauncherCtrl.getUserLaunchers());
    fileSystem.writeJsonSync(`${cwd}/data/user/user-bspc-launchers.json`, bspcLauncherCtrl.getUserLaunchers());
    fileSystem.writeJsonSync(`${cwd}/data/user/user-game-launchers.json`, gameLauncherCtrl.getUserLaunchers());
    fileSystem.writeJsonSync(`${cwd}/data/user/user-master-launchers.json`, masterLauncherCtrl.getUserLaunchers());
    fileSystem.writeJsonSync(`${cwd}/data/user/user-tasks.json`, taskCtrl.getUserTasks());
    window.localStorage.setItem("lastPath", router.history.current.fullPath);
});