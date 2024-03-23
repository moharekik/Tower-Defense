import {
    Actor,
    isTheSameActor,
} from "./actor";

type Phase = { funcName: string };
/* phases = {movements, attack, construction} */
/* takes actions from actors like movements, attack, construction and 
add them to the phases array */

function computePhases(actors: Array<Actor>): Array<Phase> {
    return [
        { funcName: "attack" },
        { funcName: "move" },
        { funcName: "spawn" },
    ];
}

type Changes = (act: Actor) => void;

// PRECOND : actorA.life >= actorB.life  or  actorB is the newPosition
function applyChanges(actorA: Actor, actorB: Actor): (actor: Actor) => void {
    return (actor: Actor) => {
        if (isTheSameActor(actor, actorB)) {
            actor.pos = actorB.pos;
            actor.life = actor.life - (actorA.life - actorB.life);
        }
    };
}

function resolveProposals(
    actors: Array<Actor>,
    proposals: Array<Actor>
): Array<Actor> {
    const newActors: Array<Actor> = [...actors];
    const changes: Array<Changes> = [];
    for (let index = 0; index < proposals.length; index++) {
        const actProp = proposals[index];
        let exist: boolean = false;
        for (let index2 = 0; index2 < actors.length; index2++) {
            const act = actors[index2];
            if (isTheSameActor(actProp, act)) {
                const actCopy = { ...act };
                changes.push(applyChanges(actCopy, actProp));
                exist = true;
            }
        }
        if (!exist) {
            newActors.push(actProp);
        }
    }
    for (let index = 0; index < changes.length; index++) {
        newActors.map(changes[index]);
    }
    for (let index = 0; index < newActors.length; index++) {
        const nAct = newActors[index];
        if (nAct.life <= 0) {
            newActors.splice(index, 1);
        }
    }
    return newActors;
}

export { computePhases, resolveProposals, Phase };
