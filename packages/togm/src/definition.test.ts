import { z } from "zod";
import {
  defineNode,
  defineRelationship,
  propertyFactories,
  referenceFactories,
} from "./definition";

describe("definition tests", () => {
  it("should label node definitions as 'node'", () => {
    const User = defineNode({});
    expect(User.type).toBe("node");
  });

  it("should label relationship definitions as 'relationship'", () => {
    const KNOWS = defineRelationship({});
    expect(KNOWS.type).toBe("relationship");
  });

  it("should create valid property factories", () => {
    const p = propertyFactories();
    expect(Object.keys(p).length).toBe(9 * 2 * 2);
    expect(p.boolean().type).toBe("property");
    expect(p.boolean().array).toBe(false);
    expect(p.boolean().nullable).toBe(false);
    expect(p.boolean().propertyType).toBe("boolean");
    expect(p.booleanArray().array).toBe(true);
    expect(p.booleanArray().nullable).toBe(false);
    expect(p.booleanOrNull().nullable).toBe(true);
    expect(p.booleanOrNull().array).toBe(false);
    expect(p.booleanArrayOrNull().nullable).toBe(true);
    expect(p.booleanArrayOrNull().array).toBe(true);
    expect(p.string(z.enum(["USER", "ADMIN"])).propertyType).toBe("string");
  });

  it("should create valid reference factories", () => {
    const r = referenceFactories();
    expect(Object.keys(r).length).toBe(3 * 3);
    expect(r.manyIn("HAS_ADDRESS", "Address").direction).toBe("incoming");
    expect(r.manyIn("HAS_ADDRESS", "Address").label).toBe("Address");
    expect(r.manyIn("HAS_ADDRESS", "Address").relationshipType).toBe("HAS_ADDRESS");
    expect(r.manyIn("HAS_ADDRESS", "Address").type).toBe("reference");
    expect(r.manyIn("HAS_ADDRESS", "Address").multiplicity).toBe("many");
    expect(r.oneOut("HAS_ADDRESS", "Address").direction).toBe("outgoing");
    expect(r.oneOut("HAS_ADDRESS", "Address").type).toBe("reference");
    expect(r.oneOut("HAS_ADDRESS", "Address").multiplicity).toBe("single");
  });
});
