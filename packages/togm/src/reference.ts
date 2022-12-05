import { z } from "zod";
import { capitalize, Flatten1, getKeys, PascalizeKeys } from "./util";

export type Multiplicity = z.infer<typeof Multiplicity>;
export const Multiplicity = z.enum(["one", "many", "opt"]);

export type WithMultiplicity<M extends Multiplicity, T> = M extends "one"
  ? T
  : M extends "many"
  ? T[]
  : T | null;
export const zWithMultiplicity = (multiplicity: Multiplicity, type: z.ZodType): z.ZodType => {
  if (multiplicity === "many") {
    return type.array();
  }
  if (multiplicity === "opt") {
    return type.nullable();
  }
  return type;
};

export type Direction = z.infer<typeof zDirection>;
export const zDirection = z.enum(["out", "in", "undirected"]);

export type Reference = z.infer<typeof zReference>;
export const zReference = z.object({
  type: z.literal("reference"),
  relationshipType: z.string(),
  label: z.string(),
  direction: zDirection,
  multiplicity: Multiplicity,
});

export type ReferenceFactories = {
  [M in Multiplicity]: {
    [D in Direction]: <T extends string, L extends string>(
      relationshipType: T,
      label: L
    ) => {
      type: "reference";
      relationshipType: T;
      label: L;
      multiplicity: M;
      direction: D;
    };
  };
};

export const referenceFactories = () => {
  const result = {} as { [key: string]: (relType: string, label: string) => Reference };
  for (const m of getKeys(Multiplicity.Values)) {
    for (const d of getKeys(zDirection.Values)) {
      result[`${m}${capitalize(d)}`] = (relType: string, label: string) => ({
        type: "reference",
        relationshipType: relType,
        label: label,
        multiplicity: m,
        direction: d,
      });
    }
  }
  return result as PascalizeKeys<Flatten1<ReferenceFactories>>;
};
