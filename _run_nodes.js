import { clrLog, getHostInfo } from "functions.js";

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

        if (!ns.serverExists(target)) {
            ns.tprint(`'${target}' does not exist`)
        } else if (!getHostInfo(ns, target).access.root) {
            ns.tprint(`'${target}' not rooted`)
        } else {
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
                await ns.sleep(PAUSE)
            }
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
        clrLog(ns);

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
                    await ns.exec(node.script.script, node.host, DEFAULT_THREADS, s, DEFAULT_THREADS, target)
                    await ns.sleep(PAUSE)
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