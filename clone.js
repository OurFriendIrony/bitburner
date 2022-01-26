var REPO = "https://raw.githubusercontent.com/OurFriendIrony/bitburner/main"
var HOME = "home"

/** @param {NS} ns **/
export async function main(ns) {
    var scripts = [
        "_buy_nodes", "_crawl", "_hacknet", "_run_ndoes",
        "clone", "find", "player", "factions", "functions",
        "r_grow", "r_hack", "r_weaken"
    ]

    for (var i = 0; i < scripts.length; i++) {
        var s = scripts[i]
        await ns.wget(`${REPO}/${s}.js`, `${s}.js`, HOME)
        ns.tprint(`${REPO}/${s}.js => ${s}.js`)
    }
}