var HOME = "home";
var VIEW_COMMAND = true;

/** @param {NS} ns **/
export async function main(ns) {
    if (ns.args[0] != null) {
        clearLog(ns);
        var find_host = ns.args[0];
        var scan_host = HOME

        var path = explore(ns, find_host, scan_host, scan_host)
        if (path == null) {
            ns.tprint(`'${find_host}' not found`)
        } else {
            VIEW_COMMAND ? asCommand(ns, path) : asPath(ns, path)
        }
    } else {
        ns.tprint("no host...")
    }
}
function asCommand(ns, path) {
    ns.tprint(`${HOME}; connect ${path.split(",").join("; connect ")}; backdoor; hack`)
}
function asPath(ns, path) {
    ns.tprint(`${HOME} > ${path.split(",").join(" > ")}`)
}

function explore(ns, find_host, scan_host, parent_host) {
    var path = null
    var hosts = ns.scan(scan_host)

    for (var i = 0; i < hosts.length; i++) {
        var found_host = hosts[i]
        if (found_host == parent_host) {
            continue

        } else if (found_host == find_host) {
            path = found_host
            break

        } else {
            path = explore(ns, find_host, found_host, scan_host)
            if (path != null) {
                path = found_host + "," + path
                break
            }
        }
    }
    return path
}

function clearLog(ns) {
    ns.disableLog("ALL")
    ns.clearLog()
}