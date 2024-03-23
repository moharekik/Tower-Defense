import { gameLoop } from "./motor";
import { World } from "./world";
import { Actor, getActorType } from "./actor";

// games -----------------------------------------------------------

const games: Array<Promise<[World, Actor[][]]>> = [];
let stop = false;
const timeout = document.querySelector<HTMLInputElement>(
    ".timeout"
) as HTMLInputElement;

/**
 * Define timeout between turns.
 * If the user launch a new game before the timeout, the previous game is stopped.
 * Not a pure function.
 */
function waitOrStop(): Promise<string> {
    if (games.length > 1 || stop) {
        // We need to pop the current game
        stop = false;
        games.shift();
        return new Promise((resolve) => {
            resolve("stop");
        });
    }
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("wait");
        }, timeout.valueAsNumber * 100);
    });
}

/**
 * Lunch a game with the given parameters
 * @param sizeX
 * @param sizeY
 * @param renderer
 * @returns
 */
async function playGame(
    sizeX: number,
    sizeY: number,
    nbstarts = 1,
    nbfinishes = 1,
    renderer = render,
    wait = waitOrStop
) {
    // terminate previous game and wait for the previous game to end
    if (games.length > 0) {
        console.log(games);
        stop = true;
        await new Promise((resolve) =>
            setTimeout(resolve, timeout.valueAsNumber * 100)
        );
        console.log(games);
        console.log(stop);
    }
    const startbtn = document.querySelector<HTMLButtonElement>(
        ".startbtn"
    ) as HTMLButtonElement;
    startbtn.textContent = "Stop";
    startbtn.classList.add("stopbtn");
    const game = gameLoop(
        sizeX,
        sizeY,
        nbstarts,
        nbfinishes,
        renderer,
        wait,
        finalScreen
    );
    games.push(game);
    game.then(() => {
        games.shift();
        startbtn.textContent = "Start";
        startbtn.classList.remove("stopbtn");
    });
}

// render ----------------------------------------------------------

/**
 * Log the result of the game in a splash screen
 * @param textToDisplay
 */
function finalScreen(textToDisplay: string) {
    // Get the final splash div
    const final = document.querySelector(".final") as HTMLDivElement;
    const msg = document.querySelector(".final h1") as HTMLHeadingElement;
    final.style.transform = "translateY(0)";

    setTimeout(() => {
        showFinalScreen(textToDisplay, final, msg);
    }, 300);
}

/**
 * Show the final screen
 * @param textToDisplay
 * @param final
 * @param msg
 */
function showFinalScreen(
    textToDisplay: string,
    final: HTMLDivElement,
    msg: HTMLHeadingElement
) {
    const playAgain = document.querySelector(
        ".final button"
    ) as HTMLButtonElement;
    msg.textContent = textToDisplay;
    playAgain.style.visibility = "visible";
    playAgain.style.opacity = "1";
    playAgain.textContent = "Close";
    playAgain.addEventListener("click", () => {
        hideFinalScreen(msg, final);
    });
}

/**
 * Hide the final screen
 * @param msg
 * @param final
 */
function hideFinalScreen(msg: HTMLHeadingElement, final: HTMLDivElement) {
    const playAgain = document.querySelector(
        ".final button"
    ) as HTMLButtonElement;
    playAgain.style.visibility = "hidden";
    playAgain.style.opacity = "0";
    msg.textContent = "";
    final.style.transform = "translateY(-100%)";
}

/**
 * Delete all children of an element
 * @param element
 */
function clearElement(element: Element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/**
 * Render the world
 * @param world
 */
function renderWorld(world: World) {
    // Get the world div
    const worldDiv = document.querySelector(".world") as HTMLDivElement;

    // Clear the world div

    clearElement(worldDiv);

    // Create the places divs

    for (const places of world.places) {
        const placesDiv = document.createElement("div");
        placesDiv.classList.add("places");
        worldDiv.appendChild(placesDiv);
        for (const place of places) {
            const placeDiv = document.createElement("div");
            const span = document.createElement("span");
            span.textContent = `Place : ${place.pos.x}, ${place.pos.y} - ${place.type}`;
            span.classList.add("tooltiptext");
            placeDiv.appendChild(span);
            placeDiv.classList.add("place");
            placeDiv.classList.add(place.type);
            placeDiv.id = place.pos.x + "-" + place.pos.y;
            placeDiv.ariaPlaceholder = `${place.pos.x}, ${place.pos.y}`;
            placesDiv.appendChild(placeDiv);
        }
    }
}

/**
 * Render the actors on the world
 * @param actors[]
 */
function renderActors(actors: Actor[]) {
    actors.forEach((actor) => {
        // We don't render the spawners
        if (actor.type === "spawner") {
            return;
        }
        const place = document.getElementById(
            `${actor.pos.x}-${actor.pos.y}`
        ) as HTMLDivElement;
        const span = place.querySelector("span") as HTMLSpanElement;
        span.textContent = `${span.textContent} \r\n Actor : ${
            actor.id
        } - ${getActorType(actor)} - ${actor.life}`;
        const actorDiv = document.createElement("div");
        actorDiv.classList.add("actor");
        actorDiv.classList.add(getActorType(actor));
        place.appendChild(actorDiv);
    });
}

/**
 * Render the world and the actors
 * @param world
 * @param actors[]
 */
function render(world: World, actors: Actor[]) {
    renderWorld(world);
    renderActors(actors);
}

// Panel control ---------------------------------------------------------------

// Get the size inputs

const sizeX = document.querySelector<HTMLInputElement>(".sizex");
const sizeY = document.querySelector<HTMLInputElement>(".sizey");

if (!sizeX || !sizeY) {
    throw new Error("SizeX and SizeY must be defined");
}

// get the number of starting and finish positions

const nbstarts = document.querySelector<HTMLInputElement>(".nbstarts");

const nbfinishes = document.querySelector<HTMLInputElement>(".nbfinishes");

if (!nbstarts || !nbfinishes) {
    throw new Error("nbstarts and nbfinishes must be defined");
}

// start button

const startbtn = document.querySelector<HTMLButtonElement>(
    ".startbtn"
) as HTMLButtonElement;

startbtn?.addEventListener("click", () => {
    if (games.length > 0) {
        stop = true;
    } else if (sizeX && sizeY) {
        hideFinalScreen(
            document.querySelector(".final h1") as HTMLHeadingElement,
            document.querySelector(".final") as HTMLDivElement
        );
        playGame(
            sizeX.valueAsNumber,
            sizeY.valueAsNumber,
            nbstarts.valueAsNumber,
            nbfinishes.valueAsNumber
        );
    }
});

// add event listener on space key

document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        if (sizeX && sizeY) {
            hideFinalScreen(
                document.querySelector(".final h1") as HTMLHeadingElement,
                document.querySelector(".final") as HTMLDivElement
            );
            playGame(
                sizeX.valueAsNumber,
                sizeY.valueAsNumber,
                nbstarts.valueAsNumber,
                nbfinishes.valueAsNumber
            );
        }
    }
});

// Start the game ---------------------------------------------------------------

playGame(
    sizeX.valueAsNumber,
    sizeY.valueAsNumber,
    nbstarts.valueAsNumber,
    nbfinishes.valueAsNumber
);
