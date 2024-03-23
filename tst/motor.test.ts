import { gameIsOver } from "../src/motor";
import { Actor } from "../src/actor";
import { initializeWorld, getFinishPlaces } from "../src/world";
import { expect, test } from "@jest/globals";

test("Conditions d'arrets", () => {
    const world = initializeWorld();
    const loosing_temp = 10;
    const not_loosing_temp = 9;
    const MAX_TURN = 10;
    const notWinningActor: Actor = {
        pos: { x: 0, y: 0 },
        actions: {},
        life: 3,
        type: "gobelin",
        id: 1,
    };
    const winningActor: Actor = {
        pos: getFinishPlaces(world)[0].pos,
        actions: {},
        life: 3,
        type: "gobelin",
        id: 2,
    };
    expect(gameIsOver([notWinningActor], world, loosing_temp, MAX_TURN)).toBe(true);
    expect(gameIsOver([notWinningActor], world, not_loosing_temp, MAX_TURN)).toBe(false);
    expect(gameIsOver([winningActor], world, not_loosing_temp, MAX_TURN)).toBe(true);
    expect(gameIsOver([winningActor, notWinningActor], world, not_loosing_temp, MAX_TURN)).toBe(true);
});
