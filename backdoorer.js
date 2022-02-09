import { clrLog, getHostInfo } from "functions.js"

var HOME = "home";
var PRIORITY_HOSTS = ["CSEC", "avmnite-02h"]
var PRIORITY_ONLY = false;

export async function explore(ns, parent_host, target_host, level) {
    var child_hosts = ns.scan(target_host).filter(child_host => child_host != parent_host)

    for (var i = 0; i < child_hosts.length; i++) {
        var child_host = child_hosts[i]

        ns.print(`[${level}] ${child_host}`)
        await ns.connect(child_host)

        var obj = getHostInfo(ns, child_host, level);
        if (!obj.owned && obj.access.root && !obj.access.backdoor) {
            if (!PRIORITY_ONLY || (PRIORITY_ONLY && child_host in PRIORITY_HOSTS))
                ns.tprint(`Installing backdoor on ${child_host}`)
            await ns.installBackdoor()
            ns.tprint(`Manual Hacking ${child_host}`)
            await ns.manualHack()

        }
        await explore(ns, target_host, child_host, (level + 1))
        ns.print(`< ${target_host}`)
        await ns.connect(target_host)
    }
}

/** @param {NS} ns **/
export async function main(ns) {
    clrLog(ns)
    if (ns.args[0] != null && ns.args[0] == true) {
        PRIORITY_ONLY = true;
    }
    ns.tprint(`Going to start jumping about installing backdoors now... please do not change host manually`)
    await ns.sleep(5000)
    await explore(ns, '', HOME, 0)
    ns.tprint(`Backdooring Complete`)
}