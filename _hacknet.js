var w1 = 4; var w2 = 5; var w3 = 3; var w4 = 5; var w5 = 10;

function header(ns) {
    ns.print(` node | level | ram | cores | value`)
    ns.print(`======|=======|=====|=======|=====================`)
}
function footer(ns, v) {
    var unit = ""
    if (parseInt(v / Math.pow(1000, 3)) > 0) { unit = "b"; v = parseInt(v / Math.pow(1000, 3)) }
    else if (parseInt(v / Math.pow(1000, 2)) > 0) { unit = "m"; v = parseInt(v / Math.pow(1000, 2)) }
    else if (parseInt(v / Math.pow(1000, 1)) > 0) { unit = "k"; v = parseInt(v / Math.pow(1000, 1)) }
    var value = ('' + v).padStart(w5)
    ns.print(`======|=======|=====|=======|=====================`)
    ns.print(` ${value} ${unit} p/s`)
}

function prnt(ns, o) {
    var isMax = (o.level == MAX_LEVEL && o.ram == MAX_RAM && o.cores == MAX_CORES) ? "(maxed)" : ""

    var f1 = ('' + o.name.split("-")[2]).padStart(w1);
    var f2 = ('' + o.level).padStart(w2);
    var f3 = ('' + o.ram).padStart(w3);
    var f4 = ('' + o.cores).padStart(w4);
    var f5 = ('' + parseInt(o.production)).padStart(w5);
    ns.print(` ${f1} | ${f2} | ${f3} | ${f4} | ${f5} ${isMax}`)
}

function clearLog(ns) {
    var ignore = [
        "sleep",
        "scan", "exec", "scp", "nuke",
        "brutessh", "ftpcrack", "relaysmtp", "httpworm",
        "getServerNumPortsRequired",
        "getHackingLevel", "getServerRequiredHackingLevel",
        "getServerMaxMoney", "getServerMoneyAvailable",
        "getServerMaxRam", "getServerUsedRam"
    ]
    for (var i = 0; i < ignore.length; i++) { ns.disableLog(ignore[i]); }
    ns.clearLog()
}

function cash(ns) { return ns.getServerMoneyAvailable(HOME) }
function node_cost(ns) { return ns.hacknet.getPurchaseNodeCost() }
function level_cost(ns, i) { return ns.hacknet.getLevelUpgradeCost(i) }
function ram_cost(ns, i) { return ns.hacknet.getRamUpgradeCost(i) }
function core_cost(ns, i) { return ns.hacknet.getCoreUpgradeCost(i) }

//======================================================================

var HOME = "home";

var MAX_LEVEL = 200
var MAX_RAM = 64
var MAX_CORES = 16

/** @param {NS} ns **/
export async function main(ns) {
    while (true) {
        await ns.sleep(1000);
        clearLog(ns)
        var nodes = []
        var total = 0

        for (var i = 0; i < parseInt(cash(ns) / node_cost(ns)); i++) {
            ns.hacknet.purchaseNode()
        }

        for (var node_index = 0; node_index < ns.hacknet.numNodes(); node_index++) {
            for (var i = 0; i < parseInt(cash(ns) / level_cost(ns, node_index)); i++) {
                ns.hacknet.upgradeLevel(node_index)
            }
            for (var i = 0; i < parseInt(cash(ns) / ram_cost(ns, node_index)); i++) {
                ns.hacknet.upgradeRam(node_index)
            }
            for (var i = 0; i < parseInt(cash(ns) / core_cost(ns, node_index)); i++) {
                ns.hacknet.upgradeCore(node_index)
            }
            nodes.push(ns.hacknet.getNodeStats(node_index))
        }

        header(ns)
        for (var i = 0; i < nodes.length; i++) {
            prnt(ns, nodes[i])
            total += parseInt(nodes[i].production)
        }
        footer(ns, total)
    }
}