import { joinToString } from "../base";
export const emptyIndexJs = (extraImports) => `
${joinToString(extraImports)}
console.log("hello world!");`;
