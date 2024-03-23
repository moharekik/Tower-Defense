import { computePhases, resolveProposals, Phase } from "../src/phases";
import {
    Actor,
    createGobelin,
    initializeActors,
} from "../src/actor";
import { initializeWorld, createPosition } from "../src/world";
import { expect, jest, test } from "@jest/globals";

describe("initializePhase", () => {
    test("-1PV", () => {
        const world = initializeWorld();
        const actors = initializeActors(world);
        const proposals = [...actors];
        const len = proposals.length;
        proposals[len - 1].life -= 1;
        expect(resolveProposals(actors, proposals)[len - 1].life).toEqual(11);
    });
});

describe("initializePhase", () => {
    test("death", () => {
        const world = initializeWorld();
        const actors = initializeActors(world);
        const proposals = [...actors];
        const len = proposals.length;
        proposals[len - 1].life -= 12;
        expect(resolveProposals(actors, proposals).length).toEqual(len - 1);
    });
});

describe("initializePhase", () => {
    test("severals actors", () => {
        const world = initializeWorld();
        const actors = initializeActors(world);
        actors.push(createGobelin(createPosition(0, 0)));
        actors.push(createGobelin(createPosition(1, 0)));
        const proposals = [...actors];
        const len = proposals.length;
        proposals[len - 1].life -= 1;
        proposals[len - 2].pos = createPosition(2, 0);
        expect(resolveProposals(actors, proposals)[len - 1].life).toEqual(11);
        expect(resolveProposals(actors, proposals)[len - 2].pos).toEqual(
            createPosition(2, 0)
        );
    });
});

describe("initializePhase", () => {
    test("severals actors", () => {
        const world = initializeWorld();
        const actors = initializeActors(world);
        const gob1 = createGobelin(createPosition(0, 0));
        const gob11 = createGobelin(createPosition(0, 0));
        const gob2 = createGobelin(createPosition(1, 0));
        const gob12 = createGobelin(createPosition(1, 0));

        actors.push(gob1);
        actors.push(gob2);
        const proposals: Array<Actor> = [];
        let newActors: Array<Actor> = [];
        proposals.push(gob11);
        proposals.push(gob12);
        const len1 = proposals.length;
        proposals[len1 - 2].life -= 1;
        proposals[len1 - 2].id = gob1.id;
        proposals[len1 - 1].life -= 1;
        proposals[len1 - 1].id = gob1.id;
        newActors = resolveProposals(actors, proposals);
        const len2 = newActors.length;
        expect(newActors[len2 - 2].life).toEqual(10);
        expect(newActors[len2 - 1].life).toEqual(12);
    });
});

describe("initializePhase", () => {
    test("add newActor", () => {
        const world = initializeWorld();
        const actors = initializeActors(world);
        const gob1 = createGobelin(createPosition(0, 0));
        const gob2 = createGobelin(createPosition(1, 0));
        const gob3 = createGobelin(createPosition(1, 0));

        actors.push(gob1);
        actors.push(gob2);
        const proposals: Array<Actor> = [];
        let newActors: Array<Actor> = [];
        proposals.push(gob3);
        newActors = resolveProposals(actors, proposals);
        const len = newActors.length;

        expect(newActors[len - 3].id).toEqual(gob1.id);
        expect(newActors[len - 2].id).toEqual(gob2.id);
        expect(newActors[len - 1].id).toEqual(gob3.id);
    });
});
