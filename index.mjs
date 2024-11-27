function parseKeychain(kc) {
  if (typeof kc === "string") {
    return kc.split(".");
  }
  if (Array.isArray(kc)) {
    return kc;
  }
  throw new Error(
    `Keychains must either be dot-delimited strings or arrays of keys.\nReceived: ${kc}`
  );
}

function get(kc, obj, create = false) {
  const chain = parseKeychain(kc);

  let pointer = obj;
  for (const ke of chain) {
    const nextPointer = pointer[ke];
    if (nextPointer === undefined || nextPointer === null) {
      if (create) {
        pointer[ke] = isNaN(ke) ? {} : [];
      } else {
        return null;
      }
    }
    pointer = pointer[ke];
  }
  return pointer;
}

function update(kc, v, obj) {
  const chain = parseKeychain(kc);
  const targetKc = chain.slice(0, -1);
  const target = get(targetKc, obj, true);
  target[chain[chain.length - 1]] =
    typeof v === "function" ? v(target[chain[chain.length - 1]]) : v;
}

function addToSet(kc, v, obj) {
  update(
    kc,
    (prev) => {
      if (!Array.isArray(prev)) {
        throw new Error("Attempted to add a list entry to a non-list.");
      }
      return [...new Set([...prev, v])];
    },
    obj
  );
}

function addToList(kc, v, obj) {
  update(
    kc,
    (prev) => {
      if (!Array.isArray(prev)) {
        throw new Error("Attempted to add a list entry to a non-list.");
      }
      return [...prev, v];
    },
    obj
  );
}

function removeFromList(kc, v, obj) {
  update(
    kc,
    (prev) => {
      if (!Array.isArray(prev)) {
        throw new Error("Attempted to remove a list entry from a non-list.");
      }
      return prev.filter((e) => e !== v);
    },
    obj
  );
}

export { get, update, addToSet, addToList, removeFromList };
