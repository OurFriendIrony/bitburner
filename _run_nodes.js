var HOME = 'home';

var SCRIPT_WEAKEN = "r_weaken.js"
var SCRIPT_GROW = "r_grow.js"
var SCRIPT_HACK = "r_hack.js"

var DEFAULT_THREADS = 1
var PAUSE = 10;

// Various modes to configure how to brute force a given node
var MODES = {
    "drain": [1, 99, 99],
    "balance": [18, 4, 1],
    "grow": [99, 4, 1],
    "weaken": [99, 1, 99],
    "nothing": [99, 99, 99]
}

// Select the Mode
var DEFAULT_MODE = "grow"

/** @param {NS} ns **/
export async function main(ns) {
    if (ns.args[0] != null) {
        var target = ns.args[0]
        var suggestedMode = ns.args[1] == null ? DEFAULT_MODE : ns.args[1]

        if (ns.serverExists(target)) {
            var doModes = (suggestedMode == "all") ? ["weaken", "grow", "weaken", "balance"] : [suggestedMode]
            for (var i = 0; i < doModes.length; i++) {
                var mode = doModes[i]
                ns.tprint(`'${target}' is being '${mode}'d`)

                await process(ns, target, mode)

                if (getHostInfo(ns, target).money.perc > 95) {
                    ns.tprint(`'${target}' has grown > 95%`)
                } else if (getHostInfo(ns, target).money.perc == 0) {
                    ns.tprint(`'${target}' has run out of money`)
                } else if (getHostInfo(ns, target).security.diff == 0) {
                    ns.tprint(`'${target}' has been weakened`)
                }
            }
        } else {
            ns.tprint(`'${target}' does not exist`)
        }
    } else {
        ns.tprint("needs host")
    }
}

async function process(ns, target, mode) {
    var weight_hack = MODES[mode][0]
    var weight_weaken = MODES[mode][1]
    var weight_grow = MODES[mode][2]

    while (
        (mode == "balance" && getHostInfo(ns, target).money.perc > 0)
        || (mode == "drain" && getHostInfo(ns, target).money.perc > 0)
        || (mode == "grow" && getHostInfo(ns, target).money.perc < 95)
        || (mode == "weaken" && getHostInfo(ns, target).security.diff > 0)
    ) {
        await ns.sleep(1000)
        clearLog(ns);

        header(ns, target)
        var nodes = getNodes(ns)
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i]
            var totals = { "h": 0, "w": 0, "g": 0, "n": 0 }
            var m = 0

            if (((i + 1) % weight_hack) == 0) { node.script = getHackScript(ns); m = "h" }
            else if (((i + 1) % weight_weaken) == 0) { node.script = getWeakenScript(ns); m = "w" }
            else if (((i + 1) % weight_grow) == 0) { node.script = getGrowScript(ns); m = "g" }
            else { node.script = getNothingScript(); m = "n" }

            if (node.script.script != "---") {
                await ns.scp(node.script.script, HOME, node.host)
                var num = parseInt(node.ram.free / node.script.ram);
                totals[m] += num
                for (var s = 0; s < num; s++) {
                    ns.exec(node.script.script, node.host, DEFAULT_THREADS, s, DEFAULT_THREADS, target)
                }
            }

            prnt(ns, node, totals)
            await ns.sleep(PAUSE)
        }
    }

}

function getGrowScript(ns) {
    return { "script": SCRIPT_GROW, "ram": ns.getScriptRam(SCRIPT_GROW, HOME) }
}
function getWeakenScript(ns) {
    return { "script": SCRIPT_WEAKEN, "ram": ns.getScriptRam(SCRIPT_WEAKEN, HOME) }
}
function getHackScript(ns) {
    return { "script": SCRIPT_HACK, "ram": ns.getScriptRam(SCRIPT_HACK, HOME) }
}
function getNothingScript() {
    return { "script": "---", "ram": 0 }
}

function getNodes(ns) {
    var all = ns.scan(HOME);
    var nodes = [];
    for (var n = 0; n < all.length; n++) {
        var node = all[n];
        if (node.includes("node")) {
            nodes.push(getHostInfo(ns, node));
        }
    }
    return nodes
}
//======================================================================
// Display
//======================================================================

function clearLog(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
}

var w1 = 16; var w2 = 4; var w3 = 4; var w4 = 4; var w5 = 10;

function header(ns, host) {
    ns.print(` node | free | used | max | -- ${host} -- `)
    ns.print(`==================|======|======|======|===============================`)
}

function prnt(ns, o, totals) {
    var f1 = `${(o.host)}`.padStart(w1);
    var f2 = `${o.ram.free.toFixed(1)}`.padStart(w2);
    var f3 = `${o.ram.used.toFixed(1)}`.padStart(w3);
    var f4 = `${o.ram.max.toFixed(1)}`.padStart(w4);
    var f5 = ('' + o.script.script).padStart(w5);
    ns.print(` ${f1} | ${f2} | ${f3} | ${f4} | ${f5} ${totals.h},${totals.w},${totals.g}`)
}

//======================================================================
// Getting Host Information
//======================================================================

function getRAMInfo(ns, child_host) {
    var max = ns.getServerMaxRam(child_host)
    var used = ns.getServerUsedRam(child_host)
    return { "max": max, "used": used, "free": (max - used) }
}

function getPorts(h) {
    var diff = h.numOpenPortsRequired - h.openPortCount;
    var met = diff <= 0;
    var left = met ? 0 : diff;
    var open = { "ftp": h.ftpPortOpen, "http": h.httpPortOpen, "ssh": h.sshPortOpen, "sql": h.sqlPortOpen, "smtp": h.smtpPortOpen }
    return { "have": h.openPortCount, "need": h.numOpenPortsRequired, "left": left, "met": met, "open": open };
}

function getHackInfo(ns, h) {
    var have = ns.getHackingLevel();
    var need = h.requiredHackingSkill
    var diff = need - have;
    var met = diff <= 0;
    var left = met ? 0 : diff
    return { "have": have, "level": need, "left": left, "met": met }
}

function getHostInfo(ns, child_host) {
    var h = ns.getServer(child_host);

    return {
        "host": h.hostname,
        "access": {
            "root": h.hasAdminRights,
            "backdoor": h.backdoorInstalled
        },
        "cpu": {
            "cores": h.cpuCores
        },
        "ram": getRAMInfo(ns, h.hostname),
        "port": getPorts(h),
        "hack": getHackInfo(ns, h),
        "money": {
            "avail": parseInt(h.moneyAvailable),
            "max": h.moneyMax,
            "perc": (h.moneyAvailable / h.moneyMax * 100) | 0
        },
        "security": {
            "current": (h.hackDifficulty).toFixed(2),
            "min": h.minDifficulty,
            "base": h.baseDifficulty,
            "diff": (h.hackDifficulty - h.minDifficulty).toFixed(2)
        }
    }
}

//======================================================================