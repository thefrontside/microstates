"use strict";

import 'jest';
require("babel-core/register");
require("babel-polyfill");

import { Example } from "./Example";

describe("Example", () => {
    it("Should be pass sanity", () => {
        expect(typeof Example).toBe("function");
    });

    it("Should be able to create new instance", () => {
        expect(typeof new Example()).toBe("object");
    });
});
