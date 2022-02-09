import { clrLog, getHostInfo, getFactionInfo, getPlayerInfo, formatUnitsV2 } from "functions.js";

var HOME = 'home'

var PRICE_TOR = 200000
var PRICE_PORT_1 = 500000
var PRICE_PORT_2 = 1500000
var PRICE_PORT_3 = 5000000
var PRICE_PORT_4 = 30000000
var PRICE_PORT_5 = 250000000

var EXE_PORT_1 = "BruteSSH.exe"
var EXE_PORT_2 = "FTPCrack.exe"
var EXE_PORT_3 = "relaySMTP.exe"
var EXE_PORT_4 = "HTTPWorm.exe"
var EXE_PORT_5 = "SQLInject.exe"

function buyTorResources(ns, p) {
    var money = parseInt(p.general.money)

    if (!p.general.api.tor && money > PRICE_TOR) {
        ns.tprint(`Buying tor (\$${formatUnitsV2(PRICE_TOR)})`)
        ns.purchaseTor()

    } else if (!ns.fileExists(EXE_PORT_1, HOME) && money > PRICE_PORT_1) {
        ns.tprint(`Buying ${EXE_PORT_1} (\$${formatUnitsV2(PRICE_PORT_1)})`)
        ns.purchaseProgram(EXE_PORT_1)

    } else if (!ns.fileExists(EXE_PORT_2, HOME) && money > PRICE_PORT_2) {
        ns.tprint(`Buying ${EXE_PORT_2} (\$${formatUnitsV2(PRICE_PORT_2)})`)
        ns.purchaseProgram(EXE_PORT_2)

    } else if (!ns.fileExists(EXE_PORT_3, HOME) && money > PRICE_PORT_3) {
        ns.tprint(`Buying ${EXE_PORT_3} (\$${formatUnitsV2(PRICE_PORT_3)})`)
        ns.purchaseProgram(EXE_PORT_3)

    } else if (!ns.fileExists(EXE_PORT_4, HOME) && money > PRICE_PORT_4) {
        ns.tprint(`Buying ${EXE_PORT_4} (\$${formatUnitsV2(PRICE_PORT_4)})`)
        ns.purchaseProgram(EXE_PORT_4)

    } else if (!ns.fileExists(EXE_PORT_5, HOME) && money > PRICE_PORT_5) {
        ns.tprint(`Buying ${EXE_PORT_5} (\$${formatUnitsV2(PRICE_PORT_5)})`)
        ns.purchaseProgram(EXE_PORT_5)
    }
    ns.print(`TOR:`)
    if (!p.general.api.tor) { ns.print(` - Tor (\$${formatUnitsV2(PRICE_TOR)})`) }
    if (!ns.fileExists(EXE_PORT_1, HOME)) { ns.print(` - ${EXE_PORT_1} (\$${formatUnitsV2(PRICE_PORT_1)})`) }
    if (!ns.fileExists(EXE_PORT_2, HOME)) { ns.print(` - ${EXE_PORT_2} (\$${formatUnitsV2(PRICE_PORT_2)})`) }
    if (!ns.fileExists(EXE_PORT_3, HOME)) { ns.print(` - ${EXE_PORT_3} (\$${formatUnitsV2(PRICE_PORT_3)})`) }
    if (!ns.fileExists(EXE_PORT_4, HOME)) { ns.print(` - ${EXE_PORT_4} (\$${formatUnitsV2(PRICE_PORT_4)})`) }
    if (!ns.fileExists(EXE_PORT_5, HOME)) { ns.print(` - ${EXE_PORT_5} (\$${formatUnitsV2(PRICE_PORT_5)})`) }
    ns.print("")
}

function buyHomeImprovements(ns, p) {
    var money = parseInt(p.general.money)
    var cpuCost = ns.getUpgradeHomeCoresCost()
    var ramCost = ns.getUpgradeHomeRamCost()

    if (money > ramCost) {
        ns.tprint(`Buying RAM improvement (\$${formatUnitsV2(ramCost)})`)
        ns.upgradeHomeRam()

    } else if (money > cpuCost) {
        ns.tprint(`Buying Cores improvement (\$${formatUnitsV2(cpuCost)})`)
        ns.upgradeHomeCores()

    }
    ns.print(`Home:`)
    ns.print(` - RAM (\$${formatUnitsV2(ramCost)})`)
    ns.print(` - Cores (\$${formatUnitsV2(cpuCost)})`)
    ns.print("")
}

/** @param {NS} ns **/
export async function main(ns) {
    ns.tail()
    clrLog(ns)
    var sleep_millis = min(0.5)

    while (true) {
        clrLog(ns)
        buyTorResources(ns, getPlayerInfo(ns))
        buyHomeImprovements(ns, getPlayerInfo(ns))

        ns.print(`Checking again at ${(new Date(new Date().getTime() + sleep_millis)).toLocaleTimeString()}`)
        await ns.sleep(sleep_millis)
    }
}

function sec(i) { return i * 1000 }
function min(i) { return sec(i * 60) }