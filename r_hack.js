/** @param {NS} ns **/
export async function main(ns) {
    var id = ns.args[0];
    var threads = ns.args[1];
    var host = ns.args[2] == null ? ns.getHostname() : ns.args[2];
    await ns.hack(host, { "threads": threads });
}