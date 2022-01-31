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

        if (ns.serverExists(target)) {
            var doModes = (suggestedMode == "all") ? ["weaken", "grow", "weaken", "balance"] : [suggestedMode]
            for (var i = 0; i < doModes.length; i++) {
                var mode = doModes[i]
                ns.tprint(`'${target}' is being '${mode}'d`)

                await process(ns, target, mode)
                var hostInfo = getHostInfo(ns, target)
                if (hostInfo.money.perc > 95) {
                    ns.tprint(`'${target}' has grown > 95%`)
                } else if (hostInfo.money.perc == 0) {
                    ns.tprint(`'${target}' has run out of money`)
                } else if (hostInfo.security.diff == 0) {
                    ns.tprint(`'${target}' has been weakened`)
                }
                await ns.sleep(PAUSE)
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
        clrLog(ns);

        header(ns, target)

        var home = getHostInfo(ns, HOME);
        var node = home

        var totals = { "h": 0, "w": 0, "g": 0, "n": 0 }
        var m = "n"

        var free_ram = node.ram.free - 64

        var i = 0
        var bail = false
        while (free_ram >= 0 && !bail) {
            if (((i + 1) % weight_hack) == 0) {
                node.script = getHackScript(ns)
                m = "h"

            } else if (((i + 1) % weight_weaken) == 0) {
                node.script = getWeakenScript(ns)
                m = "w"

            } else if (((i + 1) % weight_grow) == 0) {
                node.script = getGrowScript(ns)
                m = "g"

            } else {
                node.script = getNothingScript()
                m = "n"
            }

            if (node.script.script != "---") {
                free_ram -= node.script.ram;
                if (free_ram < 0) {
                    bail = true
                } else {
                    totals[m] += 1
                    ns.exec(node.script.script, node.host, DEFAULT_THREADS, i, DEFAULT_THREADS, target)
                }
            }
            i++
            clrLog(ns);
            header(ns, target)
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