/** @param {NS} ns **/

const getProps = (obj) =>
    Object.entries(obj).find(entry => entry[0]?.startsWith('__reactProps'))?.[1]?.children?.props;

export async function main(ns) {
    let boxes = Array.from(eval("document").querySelectorAll("[class*=MuiBox-root]"));
    let props = boxes.map(box => getProps(box)).find(x => x?.player);

    if (props) {
        // just showing the classname you could use
        let className = boxes.find(x => getProps(x)?.player).className;
        ns.tprintf("INFO className: \"" + className + "\"");

        // get a 10% cash bonus
        props.player.money = props.player.money * 1.1;

        // open dev menu
        props.router.toDevMenu();
    }
}