import { World, initializeWorld, getFinishPlaces, displayWorld } from "./world";
import {
    initializeActors,
    getActorType,
    Actor,
    isEnemy,
    resetId,
} from "./actor";
import { computePhases, resolveProposals } from "./phases";

/**
 * Check if the enemies have won :
 * - if there is an enemy on a finish place
 */
function enemiesHaveWon(actors: Array<Actor>, world: World) {
    return getFinishPlaces(world).some((finishPlace) =>
        actors.some(
            (actor) =>
                actor.pos.x === finishPlace.pos.x &&
                actor.pos.y === finishPlace.pos.y &&
                isEnemy(actor)
        )
    );
}

/**
 * Check if the defense has won :
 * - if there is no more enemy
 */
function defenseHasWon(actors: Array<Actor>, world: World) {
    return actors.filter((actor) => isEnemy(actor)).length === 0;
}

/**
 * Check if the game is over :
 * - if there is no more enemy
 * - if there is an enemy on a finish place
 */
function gameIsOver(
    actors: Array<Actor>,
    world: World,
    temp: number,
    MAX_TURN: number,
    logFunc = console.log
) {
    if (temp === MAX_TURN) {
        logFunc(
            `TimeOut error : Game ended because of the ${MAX_TURN} turns limit`
        );
        return true;
    }
    if (enemiesHaveWon(actors, world)) {
        logFunc("Enemies have won");
        return true;
    } else if (defenseHasWon(actors, world)) {
        logFunc("Defense has won");
        return true;
    }
    return false;
}

function renderConsole(world: World, actors: Actor[]) {
    displayWorld(world);
    console.log("================== Actors ==================\n");
    actors.forEach((anActor) => {
        console.log(
            `- Actor ${anActor.id} : ${getActorType(anActor)} at ${
                anActor.pos.x
            }, ${anActor.pos.y} with ${anActor.life} life`
        );
    });
    console.log("\n");
}

async function gameLoop(
    sizex: number,
    sizey: number,
    nbStarts = 1,
    nbFinishes = 1,
    render = renderConsole,
    wait = () =>
        new Promise((resolve) => {
            setTimeout(() => {
                resolve("");
            }, 1000);
        }),
    logFuncForEndGame = console.log,
    MAX_TURN = 1000
): Promise<[World, Actor[][]]> {
    resetId();

    // Initialize the world
    const world = initializeWorld(sizex, sizey, nbStarts, nbFinishes);
    const history = [];
    let actors = initializeActors(world);
    const phases = computePhases(actors);
    let temp = 0;
    while (!gameIsOver(actors, world, temp, MAX_TURN, logFuncForEndGame)) {
        actors = phases.reduce((actors, aPhase) => {
            const proposals = actors.map((anActor) => {
                const funcName = aPhase.funcName;
                return anActor.actions[funcName]
                    ? anActor.actions[funcName](anActor, actors, world)
                    : anActor;
            });
            const newActors = resolveProposals(actors, proposals);
            return newActors;
        }, actors);
        history.push(actors);
        render(world, actors);
        const status = await wait();
        if (status === "stop") {
            logFuncForEndGame("Game stopped by user at turn " + temp);
            return [world, history];
        }
        temp++;
    }
    console.log(`Game successfully ended in ${temp} turns`);
    console.log(history);
    return [world, history];
}

//renderConsole(...gameLoop(10, 10));

export { gameIsOver, gameLoop };
