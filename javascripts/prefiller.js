import { getParameterByName } from "params";

class Prefiller {
  constructor(schema) {
    this.schema = schema;
  }

  existed(json) {
    var result = {};

    Object.keys(this.schema)
    .map((name) => {
      let param = json[name];
      if (param) { return [name, param] }
    })
    .filter((obj) => {
      return obj != undefined;
    })
    .map((pair) => {
      result[pair[0]] = pair[1];
    });

    return result;
  }

  // For every key in schema, find its value in params
  // and return as an object.
  params() {
    var result = {};

    Object.keys(this.schema)
    .map((name) => {
      let param = getParameterByName(name);
      if (param) { return [name, param] }
    })
    .filter((obj) => {
      return obj != undefined;
    })
    .map((pair) => {
      result[pair[0]] = pair[1];
    });

    return result;
  }
}

export default Prefiller;
