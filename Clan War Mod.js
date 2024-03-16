const GAME_OPTIONS = {
    Healing: false,
    Station_size: 3,
    Station_crystal_capacity: 1.25,
    Max_players: 100,
    Map_size: 150,
    Show_welcome_message: true,
};

const War = "";

const Teams = [
    {
        name: "Shadow Reapers Void",
        shortname: "SRV",
        Hue: [120],
        instructor: "Klaus",
    },
    {
        name: "", // enemy clan name(s), e.g: name: "ClanName",
        shortname: "", // enemy clan shortname(s), e.g: name: "SRV",
        Hue: [0], // enemy clan team hue, e.g: Hue: [ 0 ],
        instructor: "Zoltar", // Can be "Lucina", "Maria", "Kan", or "Zoltar"
    }
];





if (GAME_OPTIONS.Station_size < 1 || GAME_OPTIONS.Station_size > 5) {
    throw new game.modding.terminal.error(
        "Error: Station size must be between 1 and 5"
    );
}

if (GAME_OPTIONS.Station_crystal_capacity < 0.1 || GAME_OPTIONS.Station_crystal_capacity > 10) {
    throw new game.modding.terminal.error(
        "Error: Station crystal capacity must be between 0.1 and 10"
    );
}

const vocabulary = [
    { text: "Attack",     icon: "\u0049", key: "A" },
    { text: "Base",       icon: "\u0034", key: "B" },
    { text: "Me",         icon: "\u004f", key: "E" },
    { text: "Follow",     icon: "\u0050", key: "F" },
    { text: "Defend",     icon: "\u0025", key: "D" },
    { text: "Good Game",  icon: "\u00a3", key: "G" },
    { text: "Help!",      icon: "\u004a", key: "H" },
    { text: "Upgrade",    icon: "\u0061", key: "I" },
    { text: "Group",      icon: "\u00bd", key: "J" },
    { text: "Kill",       icon: "\u005b", key: "K" },
    { text: "Mine",       icon: "\u0044", key: "M" },
    { text: "No",         icon: "\u004d", key: "N" },
    { text: "You",        icon: "\u004e", key: "O" },
    { text: "No Prob",    icon: "\u0047", key: "P" },
    { text: "Hmm",        icon: "\u004b", key: "Q" },
    { text: "Sorry",      icon: "\u00a1", key: "S" },
    { text: "Wait",       icon: "\u0048", key: "T" },
    { text: "STAR",       icon: "\u0053", key: "W" },
    { text: "Thanks",     icon: "\u0041", key: "X" },
    { text: "Yes",        icon: "\u004c", key: "Y" },
];


function hslaToHex(h, s, l, a) {
    // Validate input
    h = parseFloat(h);
    s = parseFloat(s);
    l = parseFloat(l);
    if (isNaN(h) || isNaN(s) || isNaN(l) || h < 0 || h >= 360 || s < 0 || s > 100 || l < 0 || l > 100) {
        throw new game.modding.terminal.error("Invalid input values for hslaToHex function.");
    }
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r, g, b;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    r = Math.round((r + m) * 255)
        .toString(16)
        .padStart(2, "0");
    g = Math.round((g + m) * 255)
        .toString(16)
        .padStart(2, "0");
    b = Math.round((b + m) * 255)
        .toString(16)
        .padStart(2, "0");
    return `#${r}${g}${b}`;
};

function getShipHexColor(hslaColor) {
    let hslaColorValues = hslaColor
        .split(/\D+/)
        .filter((value) => value !== "")
        .map(parseFloat);
    return hslaToHex(...hslaColorValues);
};

this.tick = function (game) {
    for (const ship of game.ships) {
        if (GAME_OPTIONS.Show_welcome_message && !ship.custom.showedInstructor) {
            const { Hue, instructor } = Teams[ship.team % Teams.length];
            const Welcome_message = `Greetings, Commander.\nBrace for the cosmic clash:\n${Teams[0].name}\nvs\n${Teams[1].name === "" ? "NONE" : Teams[1].name}\nEpic showdown inbound!`;
            ship.instructorSays(Welcome_message, [instructor]);
            ship.setUIComponent({
                id: "hideIns",
                position: [44, 30, 12, 6],
                clickable: true,
                visible: true,
                shortcut: " ",
                components: [
                    { type: "box", position: [0, 0, 100, 100], fill: `hsla(${Hue}, 85%, 72%, 0.25)`, stroke: `hsl(${Hue}, 85%, 72%)`, width: 2.5 },
                    { type: "text", value: "LET'S GO!", position: [5, 17.5, 90, 60], color: `hsl(${Hue}, 85%, 72%)` },
                ],
            });

            setTimeout(() => {
                ship.hideInstructor();
                ship.setUIComponent({
                    id: "hideIns",
                    visible: false,
                });
            }, 6 * 650);

            ship.custom.showedInstructor = true;
        }
    }
};

this.event = function (event) {
    const ship = event.ship;
    if (event.name === "ui_component_clicked" && event.id === "hideIns") {
        ship.hideInstructor();
        ship.setUIComponent({ id: "hideIns", visible: false });
    }
};

const centeredEcho = (msg, color = "") =>
    game.modding.terminal.echo(
        `${" ".repeat(
            ~~(50 / 2 - Array.from(msg).length / 2)
        )}${color}${msg}`
    );
const newLine = () => game.modding.terminal.echo(" ");

(function initialize(game) {
    if (!game.custom.started) {
        const srv = Teams[0 % Teams.length];
        const enemy = Teams[1 % Teams.length];
        newLine();
        centeredEcho(`Clan War`, `[[bg;#FFF;]`)
        newLine();
        newLine();
        centeredEcho(`${srv.name}`, `[[bg;${getShipHexColor(`hsl(${srv.Hue}, 100%, 50%)`)};]`)
        centeredEcho("VS", "[[bg;#FFF;]");
        centeredEcho(`${enemy.name === "" ? "NONE" : enemy.name}`, `[[bg;${getShipHexColor(`hsl(${enemy.Hue}, 100%, 50%)`)};]`);
        newLine();
        game.setObject({
            id: "center",
            type: {
                id: "center",
                obj: "https://starblast.data.neuronality.com/mods/objects/plane.obj",
                emissive: `https://raw.githubusercontent.com/Modraxis/Clan-War/main/Center%20Pics/Center%20obj%20${War === "" ? "default" : War}.png`,
            },
            position: { x: 0, y: 0, z: -100 },
            scale: { x: 45 * 2, y: 30 * 2, z: 0 },
            rotation: { x: Math.PI, y: 0, z: 0 },
        });
        game.custom.started = true;
    }
})(game);

game.modding.tick = function (t) {
    this.game.tick(t);
    if (this.context.tick != null) {
        this.context.tick(this.game);
    }
};

game.modding.terminal.echo = (function (echo) {
    const color = getShipHexColor(`hsl(120, 100%, 80%)`);
    return function (text) {
        if (!isNaN(text)) {
            echo.call(this, `[[b;${color};]${text}]`);
        } else if (/^https?:\/\//i.test(text)) {
            echo.call(this, text);
        } else {
            echo.call(this, `[[b;${color};]${text}]`);
        }
    };
})(game.modding.terminal.echo);

const Mod_Name = `${Teams[0].shortname} vs ${Teams[1].shortname === "" ? "NONE" : Teams[1].shortname}`;

this.options = {
    vocabulary,
    root_mode: "team",
    friendly_colors: 2,
    map_name: Mod_Name,
    release_crystal: true,
    hues: Teams.map(team => team.Hue[0]),
    map_size: GAME_OPTIONS.Map_size,
    max_players: GAME_OPTIONS.Max_players,
    healing_enabled: GAME_OPTIONS.Healing,
    station_size: GAME_OPTIONS.Station_size,
    station_crystal_capacity: GAME_OPTIONS.Station_crystal_capacity,
};
