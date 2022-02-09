/** @param {NS} ns **/
export async function main(ns) {
    var crime = "mug someone"
    while (true) {
        if (parseInt(ns.getCrimeChance("homicide") * 100) >= 25) {
            crime = "homicide"
        }
        ns.commitCrime(crime)
        while (ns.isBusy()) {
            await ns.sleep(1000)
        }
        ns.tprint(`${crime} completed`)
        await ns.sleep(5000)
    }
}