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
        await ns.sleep(1000)
        clearLog(ns);

        var size = Math.pow(BASE_SIZE, mult);
        var cost = (size / 2) * BASE_COST;
        var cash = parseInt(ns.getServerMoneyAvailable(HOME))

        var availNodes = getNodes(ns)
        var currCount = availNodes.length
        var buyCount = parseInt(cash / cost);

        ns.print("cost:")
        ns.print(` mult : ${mult}`)
        ns.print(` ram : ${size}`)
        ns.print(` cost : ${cost}`)
        ns.print(` afford : ${buyCount}`)
        ns.print("owned:")
        ns.print(` cash : ${cash}`)
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
                    ns.deleteServer(node.host)
                    ns.purchaseServer(`node-${newSize}-${i}`, newSize)
                }
            }
        } else {
            // GIVEN we can afford some servers
            // buy what you can at current size
            for (var i = currCount; i < (buyCount + currCount); i++) {
                ns.purchaseServer(`node-${size}-${i}`, size)
                await ns.sleep(100);
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

function clearLog(ns) {
    var ignore = [
        "sleep",
        "scan", "exec", "scp", "nuke",
        "getServerMaxRam", "getServerUsedRam",
        "getServerMoneyAvailable", "purchaseServer"
    ]
    for (var i = 0; i < ignore.length; i++) { ns.disableLog(ignore[i]); }
    ns.clearLog()
}

function getRAMInfo(ns, child_host) {
    var max = parseInt(ns.getServerMaxRam(child_host))
    var used = parseInt(ns.getServerUsedRam(child_host))
    var free = max - used

    return { "max": max, "used": used, "free": free }
}

function getHostInfo(ns, child_host) {
    return {
        "host": child_host,
        "ram": getRAMInfo(ns, child_host)
    }
}