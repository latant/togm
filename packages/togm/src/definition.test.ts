/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Date,
  DateTime,
  Duration,
  isDate,
  isDateTime,
  isDuration,
  isLocalDateTime,
  isLocalTime,
  isPoint,
  LocalDateTime,
  LocalTime,
  Point,
} from "neo4j-driver";
import { z } from "zod";
import {
  defineNode,
  defineRelationship,
  propertyFactories,
  referenceFactories,
} from "./definition";
import { loadMoviesExample, moviesGraph } from "./test/movies";
import { expectValid, useTestDatabase } from "./test/testUtils";
import { def } from "./togm";
import { readTransaction, writeTransaction } from "./transaction";
import { bulkUpdate, CreateNode } from "./update";
import { getKeys } from "./util";

describe("definition tests", () => {
  const driver = useTestDatabase();

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
    expect(getKeys(p).length).toBe(9 * 2 * 2);
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
    expect(getKeys(r).length).toBe(3 * 3);
    expect(r.manyIn("HAS_ADDRESS", "Address").direction).toBe("incoming");
    expect(r.manyIn("HAS_ADDRESS", "Address").label).toBe("Address");
    expect(r.manyIn("HAS_ADDRESS", "Address").relationshipType).toBe("HAS_ADDRESS");
    expect(r.manyIn("HAS_ADDRESS", "Address").type).toBe("reference");
    expect(r.manyIn("HAS_ADDRESS", "Address").multiplicity).toBe("many");
    expect(r.oneOut("HAS_ADDRESS", "Address").direction).toBe("outgoing");
    expect(r.oneOut("HAS_ADDRESS", "Address").type).toBe("reference");
    expect(r.oneOut("HAS_ADDRESS", "Address").multiplicity).toBe("single");
  });

  it("should properly handle any type of property", async () => {
    const graph = def.graph({
      Node: def.node({
        stringField: def.string(),
        numberField: def.number(),
        booleanField: def.boolean(),
        durationField: def.duration(),
        localTimeField: def.localTime(),
        dateField: def.date(),
        localDateTimeField: def.localDateTime(),
        dateTimeField: def.dateTime(),
        pointField: def.point(),
      }),
    });
    const creations: CreateNode[] = [];
    for (let i = 0; i < 10; i++) {
      creations.push(
        graph.create.Node({
          stringField: "",
          numberField: 0,
          booleanField: true,
          durationField: new Duration(2, 1, 3, 4),
          localTimeField: new LocalTime(12, 0, 0, 0),
          dateField: new Date(2022, 12, 1),
          localDateTimeField: new LocalDateTime(2022, 12, 1, 18, 53, 0, 0),
          dateTimeField: new DateTime(2022, 12, 1, 18, 53, 0, 0, 3600, "Africa/Brazzaville"),
          pointField: new Point(4326, 0, 0),
        })
      );
    }
    await writeTransaction(driver, () => bulkUpdate(creations));
    const nodes = await readTransaction(driver, () => graph.select.Node({}).find({}));
    expect(nodes.length).toBe(10);
    expectValid(
      nodes,
      z.array(
        z.strictObject({
          $id: z.number(),
          stringField: z.string(),
          numberField: z.number(),
          booleanField: z.boolean(),
          durationField: z.custom<Duration<number>>((v: any) => isDuration(v)),
          localTimeField: z.custom<LocalTime<number>>((v: any) => isLocalTime(v)),
          dateField: z.custom<Date<number>>((v: any) => isDate(v)),
          localDateTimeField: z.custom<LocalDateTime<number>>((v: any) => isLocalDateTime(v)),
          dateTimeField: z.custom<DateTime<number>>((v: any) => isDateTime(v)),
          pointField: z.custom<Point<number>>((v: any) => isPoint(v)),
        })
      )
    );
  });

  it("should properly coerce bigint to number", async () => {
    const graph = def.graph({
      Node: def.node({
        numberField: def.number(),
      }),
    });
    const creations: CreateNode[] = [];
    for (let i = 0; i < 10; i++) {
      creations.push(
        graph.create.Node({
          numberField: BigInt(0) as any,
        })
      );
    }
    await writeTransaction(driver, () => bulkUpdate(creations));
    const nodes = await readTransaction(driver, () => graph.select.Node({}).find({}));
    expect(nodes.length).toBe(10);
    expectValid(
      nodes,
      z.array(
        z.strictObject({
          $id: z.number(),
          numberField: z.number(),
        })
      )
    );
  });

  it("should handle optional references properly", async () => {
    const graph = def.graph({
      User: def.node({
        phone: def.optOut("HAS_PHONE", "Phone"),
      }),
      Phone: def.node({
        value: def.string(),
        user: def.oneIn("HAS_PHONE", "User"),
      }),
      HAS_PHONE: def.relationship({}),
    });
    await writeTransaction(driver, async () => {
      const u0 = graph.create.User({});
      const u1 = graph.create.User({});
      const p = graph.create.Phone({ value: "+36702555555" });
      const r = graph.create.HAS_PHONE(u0, p, {});
      await bulkUpdate([u0, u1, p, r]);
    });
    const nodes = await readTransaction(driver, () => graph.select.User({ phone: {} }).find({}));
    expect(nodes.length).toBe(2);
    expectValid(
      nodes,
      z.array(
        z.strictObject({
          $id: z.number(),
          phone: z
            .strictObject({
              $id: z.number(),
              $rid: z.number(),
              value: z.string(),
            })
            .nullable(),
        })
      )
    );
  });

  it("should correctly update node with type-safe wrappers", async () => {
    const graph = moviesGraph();
    await writeTransaction(driver, () => loadMoviesExample());
    const movie = await readTransaction(driver, () =>
      graph.select.Movie({}).findOne({
        title: { "=": "Something's Gotta Give" },
      })
    );
    await writeTransaction(driver, () =>
      bulkUpdate([
        graph.update.Movie(movie!.$id, {
          tagline: "awesome tagline",
          title: "Something",
        }),
      ])
    );
    const updatedMovie = await readTransaction(driver, () =>
      graph.select.Movie({}).findOne({
        title: { "=": "Something" },
      })
    );
    expect(updatedMovie).toBeTruthy();
    expect(updatedMovie?.tagline).toBe("awesome tagline");
    expect(updatedMovie?.title).toBe("Something");
    expect(updatedMovie?.released).toBe(movie?.released);
  });

  it("should correctly update relationship with type-safe wrappers", async () => {
    const graph = moviesGraph();
    await writeTransaction(driver, () => loadMoviesExample());
    const person = await readTransaction(driver, () =>
      graph.select.Person({ moviesActedIn: {} }).findOne({
        name: { "=": "Keanu Reeves" },
      })
    );
    const relId = person!.moviesActedIn.find((m) => m.roles.includes("Julian Mercer"))!.$rid;
    await writeTransaction(driver, () =>
      bulkUpdate([
        graph.update.ACTED_IN(relId, {
          roles: ["Neo", "Julian Mercer"],
        }),
      ])
    );
    const movie = await readTransaction(driver, () =>
      graph.select.Movie({ actors: {} }).findOne({
        title: { "=": "Something's Gotta Give" },
      })
    );
    const actor = movie!.actors.find((a) => a.roles.includes("Julian Mercer"))!;
    expect(actor.$id).toBe(person?.$id);
    expect(actor.roles).toEqual(["Neo", "Julian Mercer"]);
  });
});
