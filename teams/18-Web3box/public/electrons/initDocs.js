import { version } from "../../package.json";
import fs from "fs";
import path from "path";
import { VersionDB } from "./dbs/index_levelup";
import "./dbs/index_levelup";

class InitDocs {
	init(appDataPath, appName) {
		return new Promise((resolve, reject) => {
			const versionDB = new VersionDB();
			const vm = this;
			versionDB.initDB(async () => {
				const currentVersion = await versionDB.queryData("frontVersion");
				console.log("frontVerison:", currentVersion);
				if (vm.getNumberByFrontVersion(currentVersion) < vm.getNumberByFrontVersion("1.0.2-67")) {
					console.log("toDosomeThing");
					vm.compatibleOpeation(appDataPath, appName);
				}
				if (vm.getNumberByFrontVersion(currentVersion) < vm.getNumberByFrontVersion("1.0.2-53")) {
					console.log("delete Chain-1 Config");
					vm.deleteChainConfig(appDataPath, appName, "./Chain-1");
				}
				versionDB.updateData("frontVersion", version).then(async () => {
					resolve(true);
					console.log("change version");
				});
			});
		}).catch(e => {
			return false;
		});
	}

	compatibleOpeation(appDataPath, appName) {
		console.log("compatibleOpeation");
		console.log(appDataPath);
		console.log(appName);
		const _path = path.join(appDataPath, appName, "./config-1.json");
		const hasConfig = fs.existsSync(_path);
		console.log(hasConfig);
		if (hasConfig) {
			try {
				fs.unlinkSync(_path);
			} catch (e) {
				console.log(e);
			}
		}
	}

	/**
	 *
	 * @param {*} configFile  Config-x.json  you want to del (eg: config-1.json)
	 */
	deleteChainConfig(appDataPath, appName, configFile) {
		const _pathChain = path.join(appDataPath, appName, configFile);
		const hasChain = fs.existsSync(_pathChain);
		console.log(hasChain);
		if (hasChain) {
			try {
				this.deleteall(_pathChain);
			} catch (e) {
				console.log(e);
			}
		}
	}
	deleteall(path) {
		var files = [];
		const vm = this;
		if (fs.existsSync(path)) {
			files = fs.readdirSync(path);
			files.forEach(function(file, index) {
				var curPath = path + "/" + file;
				if (fs.statSync(curPath).isDirectory()) {
					// recurse
					vm.deleteall(curPath);
				} else {
					// delete file
					fs.unlinkSync(curPath);
				}
			});
			fs.rmdirSync(path);
		}
	}

	getNumberByFrontVersion(frontVersion) {
		try {
			let frontVersionArr = frontVersion.split(/\.|-/);
			console.log(frontVersionArr);
			let number =
				parseInt(frontVersionArr[0]) +
				parseInt(frontVersionArr[1]) * Math.pow(10, 3) +
				parseInt(frontVersionArr[2]) * Math.pow(10, 6) +
				parseInt(frontVersionArr[3]) * Math.pow(10, 9);
			return number;
		} catch (e) {
			return 0;
		}
	}
}

export default new InitDocs();
