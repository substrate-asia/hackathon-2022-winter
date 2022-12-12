import {
    platform
} from 'os';
import {
    app,
    ipcMain
} from 'electron'
import {
    DEFAULT_CHAINID
} from './windowManager/defaultOption';
const fs = require("fs")
const path = require("path")
const appRoot = require("app-root-dir").get()
const cp = require('child_process')
const getPlatform = () => {
    console.log(platform());
    switch (platform()) {
        case 'aix':
        case 'freebsd':
        case 'linux':
        case 'openbsd':
        case 'android':
            return 'linux';
        case 'darwin':
        case 'sunos':
            return 'mac';
        case 'win32':
            return 'win';
    }
}

// log file
// windows: %USERPROFILE%\AppData\Roaming\<app name>\log.log
// mac: ~/Library/Logs/<app name>/log.log
// linux: ~/.config/<app name>/log.log
const log = require('electron-log')

const cfgFilePath = async (appDataPath, appName) => {
    let chainId;
    try {
        chainId = await global.settingDB.queryData('ChainId');
    } catch (error) {
        console.error("init database error");
        log.error("init database error", error)
    }

    let cfgPath
    if (getPlatform() == "win") {
        cfgPath = `${appDataPath}\\${appName}\\config-${chainId || DEFAULT_CHAINID}.json`
    } else {
        cfgPath = `${appDataPath}/${appName}/config-${chainId || DEFAULT_CHAINID}.json`
    }
    return cfgPath
}

const baseDirPath = (appDataPath, appName) => {
    let baseDir
    if (getPlatform() == "win") {
        baseDir = `${appDataPath}\\${appName}`
    } else {
        baseDir = `${appDataPath}/${appName}`
    }
    return baseDir
}

const frontcfgFilePath = (appDataPath, appName) => {
    let cfgPath
    if (getPlatform() == "win") {
        cfgPath = `${appDataPath}\\${appName}\\front-config.json`
    } else {
        cfgPath = `${appDataPath}/${appName}/front-config.json`
    }
    return cfgPath
}

const setFrontConfig = async (appDataPath, appName) => {

    let cfgPath = frontcfgFilePath(appDataPath, appName)
    const hasConfig = fs.existsSync(cfgPath)
    const resourcesPath = (process.env.NODE_ENV === 'production') ?
        path.join(path.dirname(appRoot), 'bin') :
        path.join(appRoot, 'resources', getPlatform());
    if (hasConfig) {
        log.debug("already has front-config")
        return
    }
    const srcCfgPath = `${resourcesPath}/front-config.json`
    if (!fs.existsSync(srcCfgPath)) {
        log.debug("front-config.json not exist")
        return
    }
    let cfg = fs.readFileSync(srcCfgPath)
    let cfgObj = JSON.parse(cfg.toString())
    if (!cfgObj) {
        log.error("front-cfg is no object ")
        log.debug(cfg.toString())
        return
    }
    const baseDir = baseDirPath(appDataPath, appName)
    // cfgObj.Base.BaseDir = baseDir
    // log.debug(JSON.stringify(cfgObj))
    if (!fs.existsSync(baseDir)) {
        log.debug("folder not exist")
        fs.mkdirSync(baseDir)
    }
    try {
        await fs.writeFileSync(cfgPath, JSON.stringify(cfgObj))
    } catch (err) {
        log.error("set up front-config error", err)
        log.debug("exist", fs.existsSync(baseDir))
    }
    log.debug("setup front-config success")
}
let cacheRestartObj = {
    appDataPathCache: "",
    appNameCache: "",
    edgeCloseRestartFailed: "",
    cfgObj: ""
}
//cache restart need data;
// let appDataPathCache = '';
// let appNameCache = '';
//cache page edgeClose event callback 
// let edgeCloseRestartFailed = '';
//cache config.json
let cfgObj = null;

const setupConfig = async (appDataPath, appName) => {
    // let deadline = 1567767645712; // Fri Sep 06 2019 19:00:45 GMT+0800
    let deadline = 1578483813542 // Wed Jan 08 2020 19:43:33 GMT+0800 (China Standard Time)
    let cfg0;
    let cfg1;
    let cfg2;
    let cfgAlpha;
    if (getPlatform() == "win") {
        cfg0 = `${appDataPath}\\${appName}\\config-0.json`;
        cfg1 = `${appDataPath}\\${appName}\\config-1.json`;
        cfg2 = `${appDataPath}\\${appName}\\config-2.json`;
        cfgAlpha = `${appDataPath}\\${appName}\\config-alpha.json`;
    } else {
        cfg0 = `${appDataPath}/${appName}/config-0.json`;
        cfg1 = `${appDataPath}/${appName}/config-1.json`;
        cfg2 = `${appDataPath}/${appName}/config-2.json`;
        cfgAlpha = `${appDataPath}/${appName}/config-alpha.json`;
    }

    unlinkFile(cfg0);
    unlinkFile(cfg1);
    unlinkFile(cfg2);
    unlinkFile(cfgAlpha);

    function unlinkFile(path) {
        if (fs.existsSync(path) && (fs.statSync(path).birthtimeMs < deadline)) {
            fs.unlinkSync(path);
        }
    }
    let chainId = await global.settingDB.queryData('ChainId');
    for (let index = 0; index <= 1; index++) {
        console.log('exec setupConfig!!!!!!!!!!');
        if (index === 2) continue;
        // if (index === 2 || chainId != index) continue;
        let cfgPath;
        try {
            // cfgPath = await cfgFilePath(appDataPath, appName)
            if (getPlatform() == "win") {
                cfgPath = `${appDataPath}\\${appName}\\config-${index === 3? 'alpha':index.toString()}.json`;
            } else {
                cfgPath = `${appDataPath}/${appName}/config-${index === 3? 'alpha':index.toString()}.json`;
            }
        } catch (error) {
            console.error('Load config.json error');
            log.error("Load config.json error", error)
        }
        log.debug("[setupconfig] setup cfg")
        log.debug("[setupconfig] appDataPath", appDataPath)
        log.debug("[setupconfig] appname", cfgPath)
        log.debug("[setupconfig] cfgPath", cfgPath)
        const hasConfig = fs.existsSync(cfgPath)
        const resourcesPath = (process.env.NODE_ENV === 'production') ?
            path.join(path.dirname(appRoot), 'bin') :
            path.join(appRoot, 'resources', getPlatform());
        let srcCfgPath = `${resourcesPath}/config-${index === 3? 'alpha':index.toString()}.json`;
        console.log('srcCfgPath is', srcCfgPath);
        if (!fs.existsSync(srcCfgPath)) {
            log.debug("config.json not exist")
            return
        }
        if (hasConfig) {
            // log.debug("already has config")
            // return
            srcCfgPath = cfgPath;
        }
        let cfg = fs.readFileSync(srcCfgPath);
        let cfgObj = JSON.parse(cfg.toString());
        if (chainId == index) {
            cacheRestartObj.cfgObj = Object.assign({}, cfgObj);
        }
        if (!cfgObj) {
            log.error("cfg is no object ")
            log.debug(cfg.toString())
            return
        }
        const baseDir = baseDirPath(appDataPath, appName)
        cfgObj.Base.BaseDir = baseDir
        if (!fs.existsSync(baseDir)) {
            log.debug("folder not exist")
            fs.mkdirSync(baseDir)
        }
        if (index === 1) {
            /* cfgObj.Base.DNSWalletAddrs = [
                "AcJdio7iRMzPxCWgBjSLSqKZcXMjNRtLpd",
                "APnoekqXUkNDFQMbnnBCsMPQgmWoQQmsd4"
            ]; */
        }
        if (index === 3) {
            cfgObj.Base.AutoSetupDNSEnable = false;
            cfgObj.Base.NetworkId = 1565267317;
            // cfgObj.Base.DNSWalletAddrs = ["AXUhmdzcAJwaFW91q6UYuPGGJY3fimoTAj"];
            cfgObj.Base.ChainRestAddrs = [
                "http://221.179.156.57:10334",
                "http://221.179.156.57:11334",
                "http://221.179.156.57:12334",
                "http://221.179.156.57:13334",
                "http://221.179.156.57:14334",
                "http://221.179.156.57:15334",
                "http://221.179.156.57:16334"
            ];
            cfgObj.Base.ChainRpcAddrs = [
                "http://221.179.156.57:10336",
                "http://221.179.156.57:11336",
                "http://221.179.156.57:12336",
                "http://221.179.156.57:13336",
                "http://221.179.156.57:14336",
                "http://221.179.156.57:15336",
                "http://221.179.156.57:16336"
            ];
            cfgObj.Base.NATProxyServerAddrs = "tcp://40.73.103.72:6007";
            cfgObj.Base.ChannelRevealTimeout = "200";
            cfgObj.Base.ChannelSettleTimeout = "500";
            cfgObj.Base.edgeIsRestart = false;
        }
        try {
            console.log('cfgPath is !!!!!');
            console.log(cfgPath);
            await fs.writeFileSync(cfgPath, JSON.stringify(cfgObj))
        } catch (err) {
            log.error("set up config error", err)
            log.debug("exist", fs.existsSync(baseDir))
        }
    }

}

const run = async (appDataPath, appName) => {
    console.log('run!!!!!!!!');
    cacheRestartObj.appDataPathCache = appDataPath;
    cacheRestartObj.appNameCache = appName;
    let cfgDir = ''
    let cfgPath = '';
    let cmdStr = ''
    let chainId;
    try {
        chainId = await global.settingDB.queryData('ChainId');
    } catch (error) {
        console.error("init database error", error)
    }

    log.debug("[run] chainid " , chainId);

    if (getPlatform() == "win") {
        const chainIdPath = `${appDataPath}/${appName}/config-${chainId}.json`;
        const defaultPath = `${appDataPath}/${appName}/config-${DEFAULT_CHAINID}.json`
        cfgPath = fs.existsSync(chainIdPath) ? chainIdPath : defaultPath;
        // cfgPath = `${appDataPath}\\${appName}\\config-${chainId || DEFAULT_CHAINID}.json`;
        cfgDir = `${appDataPath}\\${appName}`;
        // cmdStr = `.\\edge.exe --config='${cfgDir}'`
        cmdStr = `.\\edge-windows-amd64.exe`
    } else {
        const chainIdPath = `${appDataPath}/${appName}/config-${chainId}.json`;
        const defaultPath = `${appDataPath}/${appName}/config-${DEFAULT_CHAINID}.json`
        cfgPath = fs.existsSync(chainIdPath) ? chainIdPath : defaultPath;
        cfgDir = `${appDataPath}/${appName}/`;
        // cmdStr = `./edge --config='${cfgDir}'`
        cmdStr = `./edge-darwin-amd64`
    }
    log.debug("[run] run node")
    log.debug("[run] appDataPath", appDataPath)
    log.debug("[run] appname", appName)
    log.debug("[run] cmdstr", cmdStr)
    const resourcesPath = (process.env.NODE_ENV === 'production') ?
        path.join(path.dirname(appRoot), 'bin') :
        path.join(appRoot, 'resources', getPlatform());
    log.debug(cmdStr, resourcesPath)
    log.debug("[run] run node++++++")
    let workerProcess = cp.spawn(cmdStr, ["--profile","--config", cfgPath, "--launchManual", true], {
        cwd: resourcesPath,
        detached: getPlatform() == "win" ? false : true
    })
    // let workerProcess = cp.exec(cmdStr, {
    //     cwd: resourcesPath,
    //     maxBuffer: 5000 * 1024,
    // })    
    app.on('will-quit', () => {
        try {
            process.kill(-workerProcess.pid)
        } catch (error) {
            console.log('edge had already exit.')
        }
    })
    workerProcess.stdout.on('data', function (data) {
        // console.log('stdout: ' + data);
    });
    if (getPlatform() == "win") {
        var panicLogDir = `${cfgDir}\\PanicLogs`
        if (!fs.existsSync(panicLogDir)) {
            fs.mkdirSync(panicLogDir)
        }
    } else {
        var panicLogDir = `${cfgDir}/PanicLogs`
        if (!fs.existsSync(panicLogDir)) {
            fs.mkdirSync(panicLogDir)
        }
    }
    workerProcess.stderr.on('data', function (data) {
        var now = new Date()
        var panicLogFileName = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}_${now.getHours()}_${now.getMinutes()}_${now.getSeconds()}.log`
        if (getPlatform() == "win") {
            fs.appendFileSync(`${panicLogDir}\\${panicLogFileName}`, data)
        } else {
            fs.appendFileSync(`${panicLogDir}/${panicLogFileName}`, data)
        }
        // console.log('stderr: ' + data);
    });

    workerProcess.on('exit', function (code) {
        // console.log('child process exited with code ' + code);
    });
    ipcMain.on('watchEdge', (event) => {
        cacheRestartObj.edgeCloseRestartFailed = event; //cache event
    })
    workerProcess.on('close', function (code) {
        log.error('workerProcess close with code' + code);
        // this setInterval for init process need edgeCloseRestartFailed have value(ipcMain watchEdge event get value)
        let i = 0;
        let setIntervalObj = setInterval(() => {
            // try catch not init cache object
            try {
                if (cacheRestartObj.cfgObj && cacheRestartObj.cfgObj.Base && cacheRestartObj.appDataPathCache && cacheRestartObj.appNameCache) {
                    if (!cacheRestartObj.cfgObj.Base.edgeIsRestart) {
                        cacheRestartObj.edgeCloseRestartFailed.reply('edgeClose', '0');
                        clearInterval(setIntervalObj)
                        return;
                    }
                    if (i >= 60) {
                        clearInterval(setIntervalObj)
                        log.error('main/node.js watchEdge event be executed')
                    }
                    if (!cacheRestartObj.edgeCloseRestartFailed) {
                        i++
                        return;
                    } else {
                        clearInterval(setIntervalObj);
                    }
                    try {
                        cacheRestartObj.restartNum++;
                        if (cacheRestartObj.restartNum >= 5) {
                            cacheRestartObj.edgeCloseRestartFailed.reply('edgeClose', '0');
                            log.error('edge restart failed' + e);
                            return;
                        }
                        setTimeout(() => {
                            cacheRestartObj.restartNum--;
                        }, 12000);
                        run(cacheRestartObj.appDataPathCache, cacheRestartObj.appNameCache);
                        cacheRestartObj.edgeCloseRestartFailed.reply('edgeClose', '1');
                    } catch (e) {
                        if (cacheRestartObj && cacheRestartObj.edgeCloseRestartFailed) {
                            cacheRestartObj.edgeCloseRestartFailed.reply('edgeClose', '0');
                        }
                        log.error('edge restart failed' + e)
                    }
                } else {
                    if (cacheRestartObj.edgeCloseRestartFailed) {
                        cacheRestartObj.edgeCloseRestartFailed.reply('edgeClose', '0');
                        clearInterval(setIntervalObj);
                    }
                }
            } catch (e) {
                console.log('edge restart catch---->', e)
            }
        }, 1000)
    });
    // get config.json value by key
    ipcMain.on('getConfigByKey', (event, params) => {
        setupConfig();
        event.returnValue = cacheRestartObj.cfgObj.Base[params];
    });
}

// setFrontConfig,
export {
    setupConfig,
    run,
    setFrontConfig
}