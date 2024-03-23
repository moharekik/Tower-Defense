/**
 * Generate a path between two places
 * @param world
 * @param start
 * @param finish
 * @returns an array of places
 */

import { Actor } from "./actor";

type Position = { x: number; y: number };
type PlaceType =
    | "road"
    | "land"
    | "rocks"
    | "tree"
    | "start"
    | "finish"
    | "edge";
// type Place = { actors: Array<actor>; type: PlaceType };
type Place = { type: PlaceType; pos: Position };

type World = {
    places: Array<Array<Place>>;
    path: Array<Array<Array<Place>>>;
    width: number;
    height: number;
};

/**
 * Initialize the world with a finish place and a start place
 * @returns World
 */
function initializeWorld(
    sizeX = 30,
    sizeY = 30,
    nbStarts = 1,
    nbFinish = 1
): World {
    function addStarts(world: World): World {
        let newWorld = world;
        for (let i = 0; i < nbStarts; i++) {
            newWorld = addStart(newWorld);
        }
        return newWorld;
    }
    function addFinishes(world: World): World {
        let newWorld = world;
        for (let i = 0; i < nbFinish; i++) {
            newWorld = addFinish(newWorld);
        }
        return newWorld;
    }
    return replaceAllPlaceOfType(
        addPath(
            addFinishes(addFinishes(addStarts(addStarts(addEdges(createLandscapeWorld(sizeX, sizeY))))))
        ),
        "edge",
        createLandscape
    );
}

function createLandscape(x: number, y: number): Place {
    const rand = Math.random();
    if (rand < 0.3) {
        return createPlace("tree", x, y);
    } else if (rand < 0.5) {
        return createPlace("rocks", x, y);
    } else {
        return createPlace("land", x, y);
    }
}

/**
 * Create a world full of landscape
 * @param size
 * @returns World
 */
function createLandscapeWorld(sizeX: number, sizeY: number): World {
    return {
        places: Array.from({ length: sizeY }, (_, y) =>
            Array.from({ length: sizeX }, (_, x) => createLandscape(x, y))
        ),
        path: [[[]]],
        width: sizeX,
        height: sizeY,
    };
}

/**
 * Replace a place of type "toReplace" by a place of type "by"
 * @param world
 * @param toReplace
 * @param by
 * @returns world updated
 */
function replacePlaceByType(
    world: World,
    toReplace: PlaceType,
    by: PlaceType
): World {
    // We get all the places of toReplace type
    const placesToReplace = getPlaceOfType(world, toReplace);
    // We get a random place among theses places

    // If the place can be replaced, we change the type of the place

    if (placesToReplace.length === 0) {
        throw `No places of type ${toReplace} in world`;
    }

    const replaceAt =
        placesToReplace[Math.floor(Math.random() * placesToReplace.length)].pos;

    return changePlace(world, createPlace(by, replaceAt.x, replaceAt.y));
}

/**
 * Replace all the places of type "toReplace" by a place of type "by"
 * @param world
 * @param toReplace
 * @param pl
 * @returns world updated
 */
function replaceAllPlaceOfType(
    world: World,
    toReplace: PlaceType,
    pl: (x: number, y: number) => Place
): World {
    return getPlaceOfType(world, toReplace).reduce(
        (world, place) => changePlace(world, pl(place.pos.x, place.pos.y)),
        world
    );
}

/**
 * Add edges around the world
 * @param world
 * @return world with edges
 */
function addEdges(world: World): World {
    return {
        places: world.places.map((places) =>
            places.map((place) =>
                // if place is on the edge we change the place to edge
                [0, world.width - 1].includes(place.pos.x) ||
                    [0, world.height - 1].includes(place.pos.y)
                    ? createPlace("edge", place.pos.x, place.pos.y)
                    : place
            )
        ),
        path: world.path,
        width: world.width,
        height: world.height,
    };
}

/**
 * Add a start place in the world
 * @param world
 * @returns world updated
 */
function addStart(world: World): World {
    return replacePlaceByType(world, "edge", "start");
}

/**
 * Add a finish place in the world
 * @param world
 * @returns world updated
 */
function addFinish(world: World): World {
    return replacePlaceByType(world, "edge", "finish");
}

/**
 * Generate a path between two places
 * @param world
 * @param start
 * @param finish
 * @returns an array of places
 */
function genPath(world: World, start: Place, finish: Place): Array<Place> {
    let x = start.pos.x;
    let y = start.pos.y;
    const xFinish = finish.pos.x;
    const yFinish = finish.pos.y;

    // We chose of moving on x or y axis
    if (Math.random() < 0.5) {
        // We move on x axis
        x = x < xFinish ? x + 1 : x > xFinish ? x - 1 : x;
    } else {
        // We move on y axis
        y = y < yFinish ? y + 1 : y > yFinish ? y - 1 : y;
    }

    const nextPlace = getPlace(world, { x: x, y: y });

    // If the next place is undefined, we continue the path
    if (nextPlace === undefined) {
        return genPath(world, start, finish);
    }

    // If we are at the finish, we are done
    if (nextPlace.pos.x === finish.pos.x && nextPlace.pos.y === finish.pos.y) {
        return [];
    }

    return [nextPlace, ...genPath(world, nextPlace, finish)];
}

/**
 * call steps times genPath and link them together
 * @param world
 * @param start
 * @param steps
 * @param finish
 * @returns an array of places
 */
function genRandomPath(
    world: World,
    start: Place,
    finish: Place
): Array<Place> {
    const path = [start];

    // Choose a random place in the world between the last place of the path and a random place
    const step = getPlace(world, {
        x: Math.floor(Math.abs((start.pos.x - finish.pos.x) / 2)),
        y: Math.floor(Math.abs((start.pos.y - finish.pos.y) / 2)),
    });

    // If we found a place, and it is not the start or finish, then we add it to the path
    if (step !== undefined && !["finish", "start"].includes(step.type)) {
        path.push(...genPath(world, path[path.length - 1], step));
    }

    return [...path, ...genPath(world, path[path.length - 1], finish), finish];
}

/**
 * Create a path between the start and the finish
 * @param world
 * @returns world
 */
function addPath(world: World): World {
    const starts = getStartPlaces(world);
    const finishs = getFinishPlaces(world);
    // create a path between each start place and finish place

    world.path = starts.map((start) =>
        finishs.map((finish) => genRandomPath(world, start, finish))
    );

    // Add the path to the world

    world.path.forEach((path) => {
        path.forEach((places) => {
            world = places.reduce(
                (world, place) =>
                    !["start", "finish"].includes(place.type)
                        ? changePlace(
                            world,
                            createPlace("road", place.pos.x, place.pos.y)
                        )
                        : world,
                world
            );
        });
    });

    return world;
}

// /**
//  *
//  * @param posA : Position
//  * @param posB : Position
//  * @returns true if the two positions are different
// */

function comparePosition(posA: Position, posB: Position): boolean {
    return posA.x === posB.x && posA.y === posB.y;
}

/**
 * Change place at pos
 * @param world
 * @param pos
 * @param newPlace
 */

function changePlace(world: World, newPlace: Place): World {
    return {
        places: world.places.map((places) =>
            places.map((place) =>
                comparePosition(place.pos, newPlace.pos) ? newPlace : place
            )
        ),
        path: world.path,
        width: world.width,
        height: world.height,
    };
}

/**
 * Create a position type
 * @param x
 * @param y
 * @returns Position
 */
function createPosition(x: number, y: number): Position {
    return { x: x, y: y };
}

/**
 * Create a place type
 * @param type
 * @param x
 * @param y
 * @returns Place
 */
function createPlace(type: PlaceType, x: number, y: number): Place {
    return { type: type, pos: createPosition(x, y) };
}

/**
 * Get the type of a place
 * @param place
 */
function getTypeOfPlace(place: Place): PlaceType {
    return place.type;
}

/**
 * Get a place of a specific type
 * @param world where to search
 * @param type of the place
 * @returns {Array<Place>}
 */
function getPlaceOfType(world: World, type: PlaceType): Array<Place> {
    let placesArray: Array<Place> = [];
    world.places.forEach((places) => {
        placesArray = placesArray.concat(
            places.filter((place) => place.type === type)
        );
    });
    return placesArray;
}

/**
 * Get a place at a specific position
 * @param world
 * @param pos
 * @param radius
 * @returns Place around pos within the radius
 */
function getPlaceOfTypeAround(
    world: World,
    type: PlaceType,
    pos: Position,
    radius: number
): Array<Place> {
    return getPlaceOfType(world, type).filter((place) => {
        return (
            Math.abs(place.pos.x - pos.x) <= radius &&
            Math.abs(place.pos.y - pos.y) <= radius
        );
    });
}

/**
 *
 */
function getTheNextPlaces(
    world: World,
    actor: Actor,
    radius: number
): Array<Place> {
    const stepList: Array<Place> = [];
    for (let i = 0; i < world.path.length; i++) {
        for (let j = 0; j < world.path[i].length; j++) {
            for (let k = 0; k < world.path[i][j].length; k++) {
                if (world.path[i][j][k].pos === actor.pos) {
                    stepList.push(world.path[i][j][k + radius]);
                }
            }
        }
    }
    return stepList;
}

/**S
 * Get the start places of the world
 * @param world
 * @returns {Array<Place>}
 */
function getStartPlaces(world: World): Array<Place> {
    return getPlaceOfType(world, "start");
}

/**
 * Get the finish place of the world
 * @param world
 * @returns {Array<Place>}
 */
function getFinishPlaces(world: World): Array<Place> {
    return getPlaceOfType(world, "finish");
}

/**
 * Get a place in the world
 * Return undefined if the place is out of the world
 * @param world
 * @param pos
 * @returns {Place | undefined}
 */
function getPlace(world: World, pos: Position): Place | undefined {
    if (
        pos.x < world.width &&
        pos.y < world.height &&
        pos.x >= 0 &&
        pos.y >= 0
    ) {
        return world.places[pos.y][pos.x]; // /!\ y and x are inverted
    }
    return undefined;
}

function getRandomNeighbor(
    world: World,
    place: Place,
    rand: () => number
): Place {
    // We generate a number to add x and y between -1 and 1
    const x = rand();
    const y = rand();
    const neighbor = getPlace(world, {
        x: place.pos.x + x,
        y: place.pos.y + y,
    });

    if (neighbor && getPlace(world, neighbor.pos)) {
        return neighbor;
    }
    return getRandomNeighbor(world, place, rand);
}

function displayWorld(world: World): void {
    function displayPlace(place: Place): string {
        if (place.type === "start") {
            return `\x1b[102m S (${place.pos.x}, ${place.pos.y}) \x1b[0m`;
        } else if (place.type === "finish") {
            return `\x1b[101m F (${place.pos.x}, ${place.pos.y}) \x1b[0m`;
        } else if (place.type === "road") {
            return `\x1b[46m P (${place.pos.x}, ${place.pos.y}) \x1b[0m`;
        } else if (place.type === "land") {
            return `\x1b[44m L (${place.pos.x}, ${place.pos.y}) \x1b[0m`;
        } else if (place.type === "edge") {
            return `\x1b[45m E (${place.pos.x}, ${place.pos.y}) \x1b[0m`;
        } else if (place.type === "tree") {
            return `\x1b[43m T (${place.pos.x}, ${place.pos.y}) \x1b[0m`;
        } else if (place.type === "rocks") {
            return `\x1b[47m R (${place.pos.x}, ${place.pos.y}) \x1b[0m`;
        } else {
            return `\x1b[46m A (${place.pos.x}, ${place.pos.y}) \x1b[0m`;
        }
    }
    console.log(`Display world of size ${world.height}x${world.width}`);
    world.places.forEach((places) => {
        console.log(...places.map((place) => displayPlace(place)));
        console.log("");
    });
}

export {
    World,
    PlaceType,
    Place,
    Position,
    initializeWorld,
    createPosition,
    getPlace,
    getFinishPlaces,
    getStartPlaces,
    getTypeOfPlace,
    getPlaceOfType,
    getPlaceOfTypeAround,
    displayWorld,
    getTheNextPlaces,
};
