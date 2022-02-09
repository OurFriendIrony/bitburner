import { clrLog, getHostInfo, getFactionInfo, getPlayerInfo, formatUnitsV2 } from "functions.js";

var HOME = 'home';
var BASE_SIZE = 2;
var BASE_COST = 110000;
var NODE_MULTIPLIER = 1;

var MAX_SERVERS = 25;
var MAX_MULTIPLIER = 10; // 1024 GB

/** @param {NS} ns **/
export async function main(ns) {
    ns.tail()
    var mult = NODE_MULTIPLIER;
    while (true) {
        await ns.sleep(10)
        clrLog(ns);

        var size = Math.pow(BASE_SIZE, mult);
        var cost = (size / 2) * BASE_COST;
        var cash = parseInt(ns.getServerMoneyAvailable(HOME))

        var availNodes = getNodes(ns)
        var currCount = availNodes.length
        var buyCount = parseInt(cash / cost);

        ns.print("cost:")
        ns.print(` mult : ${mult}`)
        ns.print(` ram : ${size}`)
        ns.print(` cost : ${formatUnitsV2(cost)}`)
        ns.print(`afford:`)
        ns.print(` nodes : ${buyCount}`)
        ns.print(` total : ${formatUnitsV2(cost * buyCount)}`)
        ns.print(` nextlvl: ${formatUnitsV2(cost * 50)}`)
        ns.print("owned:")
        ns.print(` cash : ${formatUnitsV2(cash)}`)
        ns.print(` nodes : ${currCount}`)
        ns.print('')

        if (currCount == MAX_SERVERS && buyCount >= (MAX_SERVERS * 2) && mult != MAX_MULTIPLIER) {
            // GIVEN we have reached the server limit
            // WHEN we can replace all servers with twice the size
            // THEN replace them all with servers twice the size
            mult += 1;
            var newSize = Math.pow(BASE_SIZE, mult);

            for (var i = 0; i < currCount; i++) {
                var node = availNodes[i]
                if (node.ram.max == size) {
                    ns.killall(node.host)
                    await ns.sleep(1000)
                    ns.deleteServer(node.host)
                    ns.purchaseServer(`node-${newSize}-${i}`, newSize)
                }
            }
        } else {
            // GIVEN we can afford some servers
            // buy what you can at current size
            for (var i = currCount; i < (buyCount + currCount); i++) {
                ns.purchaseServer(`node-${size}-${i}`, size)
            }
        }
    }
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