import {
    ActorType,
    initializeActors,
    createActor,
    createGobelin,
    actorChoose,
    attackActor,
    getActorsNearby,
    getActorType,
    moveActor,
    isTheSameActor,
    isEnemy,
    createTower,
} from "../src/actor";
import { initializeWorld } from "../src/world";
import { expect, jest, test } from "@jest/globals";

describe("initializeActors", () => {
    test("Return the list of actors", () => {
        const world = initializeWorld();
        const actors = initializeActors(world);
        const len = actors.length;
        console.log(actors);
        for (let i = 0; i < len - 1; i++) {
            expect(actors[i]).toEqual(
                {
                    pos: { x: expect.any(Number), y: expect.any(Number) },
                    actions: {
                        spawn: expect.any(Function),
                    },
                    life: Infinity,
                    type: "spawner",
                    id: expect.any(Number),
                },
            );
        }
        expect(actors[len - 1]).toEqual(
            {
                pos: { x: expect.any(Number), y: expect.any(Number) },
                actions: {
                    move: expect.any(Function),
                    attack: expect.any(Function),
                },
                life: 12,
                type: "gobelin",
                id: expect.any(Number),
            },
        );
    });
});

describe("createActor", () => {
    test("Return the actor", () => {
        const pos = { x: 0, y: 0 };
        expect(createActor("gobelin", pos, {}, 0, 0)).toEqual({
            pos: pos,
            actions: {},
            life: 0,
            type: "gobelin",
            id: expect.any(Number),
        });
    });
});

describe("createGobelin", () => {
    test("Return the gobelin", () => {
        const pos = { x: 0, y: 0 };
        const gobelin = createGobelin(pos);
        expect(gobelin).toEqual({
            pos: pos,
            actions: {
                move: expect.any(Function),
                attack: expect.any(Function),

            },
            life: 12, // Corrected default life value
            type: "gobelin",
            id: expect.any(Number),
        });
    });
});

describe("ActorChoose", () => {
    test("Return the actor", () => {
        const actor = createGobelin({ x: 0, y: 0 });
        expect(actorChoose([actor])).toEqual(actor);
    });
});

describe("getEnemies", () => {
    test("Return the list of actors on a square of center 10 and side 6", () => {
        const actor1 = createGobelin({ x: 10, y: 10 });
        const actor2 = createGobelin({ x: 10, y: 11 });
        const actor3 = createGobelin({ x: 8, y: 12 });
        const actor4 = createGobelin({ x: 3, y: 2 });
        const actor5 = createGobelin({ x: 10, y: 9 });
        const actorTab = [actor1, actor2, actor3, actor4, actor5];

        expect(getActorsNearby(actorTab, actor1, 3)).toEqual([
            actor2,
            actor3,
            actor5,
        ]);
    });
});
describe("attackActor", () => {
    test("Returns a function that attacks an actor", () => {
        const damage = 5;
        const range = 3;
        const types: ActorType[] = ["gobelin"];

        // Création d'un acteur pour effectuer le test
        const actor = createGobelin({ x: 0, y: 0 });
        actor.life = 10;

        // Création d'une liste d'acteurs pour tester la portée
        const actors = [
            createGobelin({ x: 0, y: 1 }),
            createGobelin({ x: 0, y: 2 }),
            createGobelin({ x: 0, y: 3 }),
            createGobelin({ x: 0, y: 4 }),
        ];

        // Appel de la fonction attackActor pour obtenir la fonction d'attaque
        const attackFunc = attackActor(damage, range, types);

        // Creer un monde fictif pour tester la fonction
        const world = initializeWorld();

        // Appel de la fonction d'attaque avec les paramètres appropriés
        const result = attackFunc(actor, actors, world);

        // Vérification des résultats
        expect(result).toEqual(expect.any(Object)); // Vérifie que le résultat est un objet (une cible a été attaquée)
        expect(result.life).toBeLessThan(10); // Vérifie que la vie de la cible a diminué
        expect(result.life).toBe(12 - damage); // Vérifie que la vie a été réduite du montant de dégâts spécifié
    });

    test("Returns the same actor when there is no target in range", () => {
        const damage = 5;
        const range = 3;
        const types: ActorType[] = ["gobelin"];

        // Création d'un acteur pour effectuer le test
        const actor = createGobelin({ x: 0, y: 0 });
        actor.life = 10;

        // Création d'une liste d'acteurs hors de portée
        const actors = [
            createGobelin({ x: 0, y: 4 }),
            createGobelin({ x: 0, y: 5 }),
            createGobelin({ x: 0, y: 6 }),
        ];

        // Création d'un monde fictif pour tester la fonction
        const world = initializeWorld(30, 30);

        // Appel de la fonction attackActor pour obtenir la fonction d'attaque
        const attackFunc = attackActor(damage, range, types);

        // Appel de la fonction d'attaque avec les paramètres appropriés
        const result = attackFunc(actor, actors, world);

        // Vérification des résultats
        expect(result).toBe(actor); // Vérifie que l'acteur est retourné sans modification (pas de cible dans la portée)
        expect(result.life).toBe(10); // Vérifie que la vie de l'acteur n'a pas changé
    });
});

describe("getActorType", () => {
    test("Gobelin", () => {
        const actor = createGobelin({ x: 0, y: 0 });
        expect(getActorType(actor)).toEqual("gobelin");
    });
    test("Tower", () => {
        const actor = createTower({ x: 0, y: 0 });
        expect(getActorType(actor)).toEqual("tower");
    });
});

describe("isTheSameActor", () => {
    test("Return true if the actors are the same", () => {
        const actor = createGobelin({ x: 0, y: 0 });
        expect(isTheSameActor(actor, actor)).toBe(true);
    });
    test("Return false if the actors are not the same", () => {
        const actor1 = createGobelin({ x: 0, y: 0 });
        const actor2 = createTower({ x: 0, y: 0 });
        expect(isTheSameActor(actor1, actor2)).toBe(false);
    });
});

describe("isEnemy", () => {
    test("Return true if the actor is an enemy", () => {
        const actor = createGobelin({ x: 0, y: 0 });
        expect(isEnemy(actor)).toBe(true);
    });
    test("Return false if the actor is not an enemy", () => {
        const actor = createTower({ x: 0, y: 0 });
        expect(isEnemy(actor)).toBe(false);
    });
});
