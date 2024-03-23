import {
    World,
    Position,
    Place,
    getStartPlaces,
    getTypeOfPlace,
    getPlace,
    getPlaceOfType,
    getPlaceOfTypeAround,
    getTheNextPlaces,
} from "./world";

// Definition of types ----------------------------------------------

type ActorType = "gobelin" | "tower" | "spawner";

type Actor = {
    pos: Position;
    actions: Actions;
    life: number;
    type: ActorType;
    id: number;
};
type Action = (actor: Actor, actors: Array<Actor>, world: World) => Actor;
type Actions = { [key: string]: Action };

// Creation des Id des joueurs --------------------------------------

let currentId = 0;

/**
 * @returns a new id for an actor
 * (non pure function)
 */
function createId(): number {
    return currentId++;
}

/**
 * Reset the id counter
 * (non pure function)
 */
function resetId() {
    currentId = 0;
}

// Get Actors -------------------------------------------------------

/**
 * Select a random element in a tab
 * @param tab
 * @returns a random element of the tab
 */
function getRandom<T>(tab: Array<T>) {
    function getRandomInt(max: number) {
        return Math.floor(Math.random() * max);
    }
    return tab[getRandomInt(tab.length)];
}

/**
 * Select a random actor in a tab
 * @param tab
 * @returns a random actor of the tab
 */
function actorChoose(tab: Actor[]): Actor {
    return getRandom(tab);
}

/**
 * Return the actors nearby an actor
 * @param actors array of actors in the world
 * @param actor the actor we want to know the nearby actors
 * @param range range of the nearby actors
 * @returns Actors nearby the actor
 */
function getActorsNearby(
    actors: Array<Actor>,
    actor: Actor,
    range: number,
    target = (actorType: ActorType) => true
): Actor[] {
    return actors.filter((act) => {
        return (
            act !== actor &&
            target(getActorType(act)) &&
            act.pos.x >= actor.pos.x - range &&
            act.pos.x <= actor.pos.x + range &&
            act.pos.y >= actor.pos.y - range &&
            act.pos.y <= actor.pos.y + range
        );
    });
}

/**
 * Return the actors at a position
 * @param actors array of actors in the world
 * @param pos the position we want to know the actors
 */
function getActorsAt(actors: Actor[], pos: Position): Actor[] {
    return actors.filter(
        (actor) => actor.pos.x === pos.x && actor.pos.y === pos.y
    );
}

/**
 * Return true if the position is vacant (no actor or spawner)
 * @param actors array of actors in the world
 * @param pos the position we want to know if it is vacant
 */
function isVacant(actors: Actor[], pos: Position): boolean {
    return (
        getActorsAt(actors, pos).filter(
            (actor) => !["spawner"].includes(getActorType(actor))
        ).length === 0
    );
}

// Get Actor Properties ---------------------------------------------

/**
 * Return the type of an actor
 * @param act
 * @returns the type of the actor
 */
function getActorType(act: Actor): ActorType {
    return act.type;
}

function isTheSameActor(actorA: Actor, actorB: Actor): boolean {
    return actorA.id === actorB.id;
}

function isEnemy(actor: Actor): boolean {
    const enemies = ["gobelin"];
    return enemies.includes(getActorType(actor));
}

// Actions ----------------------------------------------------------

/**
 * Returns a function that attacks an actor
 * @param damage
 * @param range
 * @returns
 */
function attackActor(
    damage: number,
    range: number,
    types: ActorType[] = ["gobelin"]
): Action {
    return (actor: Actor, actors: Array<Actor>, world: World) => {
        // On choisit une cible parmis les ennemis dans la portée
        const target = actorChoose(
            getActorsNearby(actors, actor, range, (actorType) => {
                return types.includes(actorType);
            })
        );
        // Si il n'y a pas de cible, on ne fait rien
        if (target === undefined) {
            return actor;
        }
        // Sinon on lui enleve des points de vie
        target.life -= damage;
        // On renvoie l'acteur avec la vie changée
        return target;
    };
}

/**
 * Returns a function that moves an actor
 * @param pos
 * @returns a function that moves an actor
 */
function moveActor(radius: number): Action {
    return (actor: Actor, actors: Array<Actor>, world: World) => {
        // Get a list of the next possible steps

        const stepList: Array<Place> = getTheNextPlaces(world, actor, radius);
        // We can't move on a place if there is already an actor
        stepList.filter((place) => isVacant(actors, place.pos));
        if (stepList.length === 0) {
            return actor;
        }
        const nextStep: Place =
            stepList[Math.floor(Math.random() * stepList.length)];
        return { ...actor, pos: nextStep.pos };
    };
}

function spawnActor(position: Position): Action {
    return (actor: Actor, actors: Actor[], world: World) => {
        // Cannot spawn if there is already an actor
        return isVacant(actors, actor.pos)
            ? spawnActorOfType(
                actorAllowed(world, actor.pos)[0],
                world,
                actors
            )(position) ?? actor
            : actor;
    };
}

// Actors -----------------------------------------------------------

function defaultLifeOf(actorType: ActorType): number {
    switch (actorType) {
        case "gobelin":
            return 12;
        case "tower":
            return 10;
        case "spawner":
            return Infinity;
        default:
            return 1;
    }
}

function actorAllowed(world: World, pos: Position): ActorType[] {
    const placeType = getPlace(world, pos);
    if (placeType === undefined) {
        throw new Error("actorAllowed: placeType is undefined");
    }
    switch (getTypeOfPlace(placeType)) {
        case "start":
            return ["gobelin"];
        case "land":
            return ["tower"];
        default:
            return [];
    }
}

/**
 * Create a gobelin
 * @param pos
 * @param id
 * @returns a gobelin
 */
function createGobelin(pos: Position, id = createId()): Actor {
    //getRandom(getStartPlaces(world)).pos,
    return createActor(
        "gobelin",
        pos,
        {
            move: moveActor(1),
            attack: attackActor(1, 1, ["tower"]),
        },
        defaultLifeOf("gobelin"),
        id
    );
}

function createTower(
    position: Position,
    life = defaultLifeOf("tower"),
    id = createId()
): Actor {
    return createActor(
        "tower",
        position,
        {
            attack: attackActor(2, 1),
        },
        life,
        id
    );
}

/**
 * Create an actor
 * @param type
 * @param pos
 * @param life
 * @returns an actor
 */
function createActor(
    type: ActorType,
    pos: Position,
    actions: Actions,
    life = defaultLifeOf(type),
    id = createId()
): Actor {
    return { pos: pos, actions: actions, life: life, type: type, id: id };
}

function spawnActorOfType(
    type: ActorType,
    world: World,
    actors: Actor[]
): (position: Position) => Actor | undefined {
    // Get the number of towers
    const nbTower: number = actors.filter(
        (actor) => getActorType(actor) === "tower"
    ).length;

    // Get actor type to spawn
    switch (type) {
        case "gobelin":
            return (position) =>
                Math.random() > 0.5 ? createGobelin(position) : undefined;
        case "tower":
            // Probability to spawn a tower depends on the number of towers already in the world
            // If there are too many towers, we don't spawn a new one
            return (position) =>
                Math.random() > 0.95 &&
                    nbTower < Math.min(world.height, world.width)
                    ? createTower(position)
                    : undefined;
        default:
            return (position) => createSpawner(position);
    }
}

function createSpawner(position: Position, id = createId()): Actor {
    return createActor(
        "spawner",
        position,
        {
            spawn: spawnActor(position),
        },
        defaultLifeOf("spawner"),
        id
    );
}

// Init -------------------------------------------------------------

/**
 * Initialize the actors
 * Put a spawner in each start place
 * @param world
 * @returns the actors
 */
function initializeActors(world: World): Actor[] {
    // Then we create the spawners of gobelins in the start places
    const gobelinSpawners = getStartPlaces(world).map((place) =>
        createSpawner(place.pos)
    );

    // Then we create the spawners of towers in the land places

    const towerSpawners = getPlaceOfType(world, "land").map((place) =>
        [
            ...getPlaceOfTypeAround(world, "road", place.pos, 1),
            ...getPlaceOfTypeAround(world, "start", place.pos, 1),
            ...getPlaceOfTypeAround(world, "finish", place.pos, 1),
        ].length > 0
            ? createSpawner(place.pos)
            : undefined
    );

    // By we put a gobelin in a random start place

    const gobelin = createGobelin(getRandom(gobelinSpawners).pos);

    return [...gobelinSpawners, ...towerSpawners, gobelin].filter(
        (actor) => actor !== undefined
    ) as Actor[];
}

export {
    ActorType,
    Actor,
    getActorType,
    initializeActors,
    isTheSameActor,
    isEnemy,
    actorChoose,
    moveActor,
    getActorsNearby,
    attackActor,
    createActor,
    createGobelin,
    createSpawner,
    createTower,
    resetId,
};
