'use strict';

export interface Interface {
  type: "interface" | "type"
  name: string
  regex: Record<string, RegExp>
  ignore: string[]
  properties: Property
}

export type NamedProperty = Property & { name: string }
export type Property =
  | { optional?: boolean, type: "string", regex?: RegExp }
//  | { optional?: boolean, type: "string", valid: string[] }
  | { optional?: boolean, type: "number", validRanges?: [number, number][], regex?: RegExp } // valid?: number[] }
  | { optional?: boolean, type: "boolean" }
  | { optional?: boolean, type: "object", value: NamedProperty[], typeguardFunctionName?: string }
  | { optional?: boolean, type: "array", value: Property[] }
  | { optional?: boolean, type: "union", valid: Property[] }

export namespace Interface {
  export function create(value: any, name?: string): Interface | undefined {
    return typeof value == "string" ? { name: name ?? "Unnamed", type: "type", regex: {}, ignore: [], properties: { optional: false, type: "string" } } : undefined
  }
  export function generateTypeguard(value: Interface): string {
    return `export function is(value: any | ${value.name}): value is ${value.name} {
      return ${generateTypeguardPart("", value.properties)}
    }`
  }
  export function generateTypeguardPart(prefix: string, property: Property | NamedProperty): string {
    let result: string
    const name = ("name" in property ? property.name : "")
    const fullName = prefix + (prefix ? "." : "") + name
    result = "(" + property.optional ? fullName + " == undefined || " : ""
    switch (property.type) {
      case "array":
        result = `Array.isArray(${fullName} && ${property.value.map(p => generateTypeguardPart(fullName, p)).join(" && ")}`
        break
      case "object":
        result = `${(property.typeguardFunctionName ? property.typeguardFunctionName + "(" + fullName + ")" : `typeof ${fullName} == "object" && ${fullName}`)} && ${property.value.map(p => generateTypeguardPart(fullName, p)).join(" && ")}`
        break;
      case "union":
        result = `${property.valid.join(" || ")})`
        break;
      case "boolean":
        result = `false || true`
        break;
      case "string":
        result = `typeof ${fullName} == "string"${property.regex ? ` && ${property.regex.source}.test(${fullName})` : ""}`
        break;
      case "number":
        result = `typeof ${fullName} == "number"${property.regex ? ` && ${property.regex.source}.test(${fullName}.toString())` : ""}${property.validRanges ? ` && ${property.validRanges.map(range => `${fullName} > ${range[0]} && ${fullName} < ${range[1]}`).join(" && ")}` : ""}`
        break;
      default:
        break;
    }
    return result + ")"
  }
  /*export function generateTypeCheck(fullName: string, property: Property | NamedProperty): string {
    let result: string
    switch (property.type) {
      case "array":
        result = `Array.isArray(${fullName})`
        break
      case "object":
        result = `typeof ${fullName} == "${property.type}"`
        break;

      default:
        break;
    }
  }*/
}
