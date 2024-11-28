function parseString(input) {
  const regex = /'([^']*)'|[^.]+/g;
  const result = [];
  let match;

  while ((match = regex.exec(input)) !== null) {
    if (match[1] !== undefined) {
      result.push(match[1]);
    } else {
      result.push(isNaN(match[0]) ? match[0] : +match[0]);
    }
  }

  return result;
}

export function parseKeychain(kc) {
  if (typeof kc === "string") {
    return parseString(kc);
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
  for (const ki in chain) {
    const ke = chain[ki];
    const nextPointer = pointer[ke];
    if (nextPointer === undefined || nextPointer === null) {
      if (create && ki < chain.length - 1) {
        pointer[ke] = typeof chain[+ki + 1] === "number" ? [] : {};
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
  let target = get(targetKc, obj, true);
  if (!target) {
    get(targetKc.slice(0, -1), obj)[targetKc[targetKc.length - 1]] =
      typeof targetKc[targetKc.length - 1] === "number" ? [] : {};
    target = get(targetKc, obj, true);
  }
  target[chain[chain.length - 1]] =
    typeof v === "function" ? v(target[chain[chain.length - 1]]) : v;
}

function addToSet(kc, v, obj) {
  update(
    kc,
    (prev = []) => {
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
    (prev = []) => {
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
    (prev = []) => {
      if (!Array.isArray(prev)) {
        throw new Error("Attempted to remove a list entry from a non-list.");
      }
      return prev.filter((e) => e !== v);
    },
    obj
  );
}

module.exports = {
  get,
  update,
  addToSet,
  addToList,
  removeFromList,
};
