import next from "eslint-config-next";
import base from "@altec/config/eslint";

/** eslint-config-next v16 exporta el flat config ya armado, como arreglo. */
const config = [...base, ...next];

export default config;
