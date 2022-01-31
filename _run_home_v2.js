import { clrLog, getHostInfo, explore } from "functions.js";

var HOME = 'home';

var SCRIPT_WEAKEN = "r_weaken.js"
var SCRIPT_GROW = "r_grow.js"
var SCRIPT_HACK = "r_hack.js"

var DEFAULT_THREADS = 1
var PAUSE = 10;

/** @param {NS} ns **/
export async function main(ns) {
    while (true) {
        var hosts = []
        explore(ns, hosts, '', HOME, 0)

        var weakenTargets = hosts
            .filter(o => o.money.diff > 1)
            .filter(o => o.access.root)
            .filter(o => o.security.diff > 1)

        var growTargets = hosts
            .filter(o => o.money.diff > 1)
            .filter(o => o.access.root)
            .filter(o => o.money.perc < 95)

        await ns.sleep(10)
        // ns.tprint(`${weakenTargets.length} hosts to weaken`)
        // ns.tprint(`${growTargets.length} hosts to grow`)

        for (var x = 0; x < weakenTargets.length; x++) {
            var target = weakenTargets[x]
            var mode = "weaken"
            ns.print(`'${target.host}' is being '${mode}'d`)

            await process(ns, target.host, mode)
            await ns.sleep(PAUSE)
        }

        for (var x = 0; x < growTargets.length; x++) {
            var target = growTargets[x]
            var mode = "grow"
            ns.print(`'${target.host}' is being '${mode}'d`)

            await process(ns, target.host, mode)
            await ns.sleep(PAUSE)
        }
    }
}

async function process(ns, target, mode) {
    clrLog(ns);

    var home = getHostInfo(ns, HOME);
    var node = home

    var free_ram = node.ram.free - 64

    var i = 0

    if (mode == "hack") {
        node.script = getHackScript(ns)
        m = "h"

    } else if (mode == "weaken") {
        node.script = getWeakenScript(ns)
        m = "w"

    } else if (mode == "grow") {
        node.script = getGrowScript(ns)
        m = "g"

    } else {
        node.script = getNothingScript()
        m = "n"
    }

    if (node.script.script != "---") {
        while (i < 100) {
            free_ram -= node.script.ram;
            if (free_ram < 0) {
                i = 999999999999999
            } else {
                ns.exec(node.script.script, node.host, DEFAULT_THREADS, i++, DEFAULT_THREADS, target)
            }
        }
    }
    await ns.sleep(PAUSE)
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