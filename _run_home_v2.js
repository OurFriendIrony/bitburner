import { clrLog, getHostInfo, explore } from "functions.js";

var HOME = 'home';

var SCRIPT_WEAKEN = "r_weaken.js"
var SCRIPT_GROW = "r_grow.js"
var SCRIPT_HACK = "r_hack.js"

var DEFAULT_THREADS = 1
var PAUSE = 10;
var RAM_TO_SAVE = 32
/** @param {NS} ns **/
export async function main(ns) {
    clrLog(ns)
    while (true) {
        var hosts = []
        explore(ns, hosts, '', HOME, 0)

        var weakenTargets = hosts
            .filter(o => (o.access.root && o.port.met && o.hack.met))
            .filter(o => o.money.avail > 0)
            .filter(o => o.security.diff > 1)

        var growTargets = hosts
            .filter(o => (o.access.root && o.port.met && o.hack.met))
            .filter(o => o.money.avail > 0)
            .filter(o => o.money.perc < 95)

        var hackTargets = hosts
            .filter(o => (o.access.root && o.port.met && o.hack.met))
            .filter(o => o.money.avail > 0)

        ns.print(`${weakenTargets.length} hosts to weaken`)
        for (var x = 0; x < weakenTargets.length; x++) {
            var target = weakenTargets[x]
            var mode = "weaken"
            ns.print(`'${target.host}' is being '${mode}'d`)

            await process(ns, target.host, mode)
            await ns.sleep(PAUSE)
        }

        ns.print(`${growTargets.length} hosts to grow`)
        for (var x = 0; x < growTargets.length; x++) {
            var target = growTargets[x]
            var mode = "grow"
            ns.print(`'${target.host}' is being '${mode}'d`)

            await process(ns, target.host, mode)
            await ns.sleep(PAUSE)
        }
        ns.print(`${hackTargets.length} hosts to hack`)
    }
}

async function process(ns, target, mode) {
    var home = getHostInfo(ns, HOME);
    var node = home

    var free_ram = node.ram.free - RAM_TO_SAVE

    if (mode == "hack") {
        node.script = getHackScript(ns)
    } else if (mode == "weaken") {
        node.script = getWeakenScript(ns)
    } else if (mode == "grow") {
        node.script = getGrowScript(ns)
    } else {
        node.script = getNothingScript()
    }

    var i = 0
    if (node.script.script != "---") {
        while (i < 100) {
            free_ram -= node.script.ram;
            if (free_ram < 0) {
                i = 999999999999999
            } else {
                //ns.exec(node.script.script, node.host, DEFAULT_THREADS, i++, DEFAULT_THREADS, target)
                ns.exec(node.script.script, node.host, home.cpu.cores, i++, node.cpu.cores, target)
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