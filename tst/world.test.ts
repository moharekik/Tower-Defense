import {
    initializeWorld,
    getPlaceOfType,
    getStartPlaces,
    getFinishPlaces,
    getTypeOfPlace,
    Place,
} from "../src/world";


describe("getPlaceOfType", () => {
    test("Return the list of places of a certain type", () => {
        const world = initializeWorld();
        expect(getPlaceOfType(world, "finish")).toEqual([
            {
                type: "finish",
                pos: { x: expect.any(Number), y: expect.any(Number) },
            },
        ]);
    });
});

describe("getTypeOfPlace", () => {
    test("Return the type of a place", () => {
        const place: Place = {
            type: "finish",
            pos: { x: expect.any(Number), y: expect.any(Number) },
        };
        expect(getTypeOfPlace(place)).toEqual("finish");
    });
});

describe("getStartPlaces & getFinishPlaces", () => {
    test("Return the list of start places", () => {
        const world = initializeWorld();
        expect(getStartPlaces(world)).toEqual([
            {
                type: "start",
                pos: { x: expect.any(Number), y: expect.any(Number) },
            },
        ]);
    });
    test("Return the list of finish places", () => {
        const world = initializeWorld();
        expect(getFinishPlaces(world)).toEqual([
            {
                type: "finish",
                pos: { x: expect.any(Number), y: expect.any(Number) },
            },
        ]);
    });
});
