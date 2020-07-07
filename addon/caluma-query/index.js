import { getOwner, setOwner } from "@ember/application";

export default function calumaQuery({ query, options = {} }) {
  return function (_, name) {
    const privateKey = `__${name}`;

    return {
      get() {
        if (this[privateKey]) {
          // don't initialize query if it already exists
          return this[privateKey];
        }

        if (typeof options === "string") {
          // if the options parameter is a string we interpret it as key of the
          // options property the object
          options = this[options];
        }

        const queryObj = query(options);

        setOwner(queryObj, getOwner(this));

        this[privateKey] = queryObj;

        return queryObj;
      },
    };
  };
}
