const test = require("node:test");
const { strict: assert } = require("node:assert");
const keychain = require("./index.cjs");

const getObj = () => ({
  a: "a",
  b: {
    c: "b.c",
  },
  c: ["a"],
});

test("It can find a property.", () => {
  const obj = getObj();
  assert.equal(keychain.get("a", obj), obj.a);
});

test("It can find a nested property.", () => {
  const obj = getObj();
  assert.equal(keychain.get("b.c", obj), obj.b.c);
});

test("It can take an array as a keychain.", () => {
  const obj = getObj();
  assert.equal(keychain.get(["b", "c"], obj), obj.b.c);
});

test("It returns null if not creating and nested property doesn't exist.", () => {
  const obj = getObj();
  assert.equal(keychain.get("a.b.c", obj), null);
});

test("It throws an error on invalid keychain.", () => {
  assert.throws(() => {
    keychain.get(1, {});
  });
});

test("It can update a property.", () => {
  const obj = getObj();
  keychain.update("a", "z", obj);
  assert.equal(obj.a, "z");
});

test("It can create a new nested property on update.", () => {
  const obj = getObj();
  keychain.update("b.d", "b.d", obj);
  assert.equal(obj.b.d, "b.d");
});

test("It can create a new nested property on get.", () => {
  const obj = getObj();
  keychain.get("b.d", obj, true);
  assert.deepEqual(obj.b.d, {});
});

test("It can add an entry to a set.", () => {
  const obj = getObj();
  keychain.addToSet("c", "d", obj);
  assert.deepEqual(obj.c, ["a", "d"]);
});

test("It can add an entry to a set, rejecting dupes.", () => {
  const obj = getObj();
  keychain.addToSet("c", "a", obj);
  assert.deepEqual(obj.c, ["a"]);
});

test("It throws if trying to add to a set that isn't a list.", () => {
  const obj = getObj();
  assert.throws(() => {
    keychain.addToSet("a", "a", obj);
  });
});

test("It can add an entry to a list.", () => {
  const obj = getObj();
  keychain.addToList("c", "d", obj);
  assert.deepEqual(obj.c, ["a", "d"]);
});

test("It can add an entry to a set, allowing dupes.", () => {
  const obj = getObj();
  keychain.addToList("c", "a", obj);
  assert.deepEqual(obj.c, ["a", "a"]);
});

test("It throws if trying to add to a set that isn't a list.", () => {
  const obj = getObj();
  assert.throws(() => {
    keychain.addToList("a", "a", obj);
  });
});

test("It can remove an entry from a list.", () => {
  const obj = getObj();
  keychain.removeFromList("c", "a", obj);
  assert.deepEqual(obj.c, []);
});

test("It throws if trying to remove froma a list that isn't a list", () => {
  const obj = getObj();
  assert.throws(() => {
    keychain.removeFromList("a", "a", obj);
  });
});
