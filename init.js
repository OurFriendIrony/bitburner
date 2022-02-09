/** @param {NS} ns **/
export async function main(ns) {
    var scripts = [
        { "n": "_crawl.js", "a": [false, false] },
        // { "n": "course.js" },
        { "n": "factions.js" },
        { "n": "singularity.js" },
        { "n": "_buy_nodes.js" },
        // { "n": "_run_nodes.js", "a": ["iron-gym", "all"] },
        // { "n": "_run_nodes.js", "a": ["omega-net", "all"] }
        // { "n": "_run_nodes.js", "a": ["comptek", "all"] },
        { "n": "_run_home_v2.js" },
        { "n": "backdoorer.js" }
    ]
    for (var i = 0; i < scripts.length; i++) {
        var script = scripts[i]
        if (!ns.scriptRunning(script['n'], "home")) {
            ns.tprint(`Running ${script['n']}`)
            if ("a" in script) {
                ns.run(script['n'], 1, script['a'][0], script['a'][1])
            } else {
                ns.run(script['n'])
            }
            await ns.sleep(2000)
        }
    }
}