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
import { propertyFactories } from "./property";
import { referenceFactories } from "./reference";
import { loadMoviesExample, moviesGraph } from "./test/movies";
import { expectException, expectValid, useTestDatabase } from "./test/testUtils";
import { neo, ogm } from "./togm";
import { CreateNode } from "./update";
import { getKeys } from "./util";

describe("definition tests", () => {
  const driver = useTestDatabase();

  it("should label node definitions as 'node'", () => {
    const User = ogm.node({});
    expect(User.type).toBe("node");
  });

  it("should label relationship definitions as 'relationship'", () => {
    const KNOWS = ogm.relationship({});
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
    expect(r.manyIn("HAS_ADDRESS", "Address").direction).toBe("in");
    expect(r.manyIn("HAS_ADDRESS", "Address").label).toBe("Address");
    expect(r.manyIn("HAS_ADDRESS", "Address").relationshipType).toBe("HAS_ADDRESS");
    expect(r.manyIn("HAS_ADDRESS", "Address").type).toBe("reference");
    expect(r.manyIn("HAS_ADDRESS", "Address").multiplicity).toBe("many");
    expect(r.oneOut("HAS_ADDRESS", "Address").direction).toBe("out");
    expect(r.oneOut("HAS_ADDRESS", "Address").type).toBe("reference");
    expect(r.oneOut("HAS_ADDRESS", "Address").multiplicity).toBe("one");
  });

  it("should properly handle any type of property", async () => {
    const graph = ogm.graph({
      Node: ogm.node({
        stringField: ogm.string(),
        numberField: ogm.number(),
        booleanField: ogm.boolean(),
        durationField: ogm.duration(),
        localTimeField: ogm.localTime(),
        dateField: ogm.date(),
        localDateTimeField: ogm.localDateTime(),
        dateTimeField: ogm.dateTime(),
        pointField: ogm.point(),
      }),
    });
    const creations: CreateNode[] = [];
    for (let i = 0; i < 10; i++) {
      creations.push(
        graph.Node.create({
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
    await neo.writeTransaction(driver, () => neo.runCommands(creations));
    const nodes = await neo.readTransaction(driver, () => graph.Node.select({}).find({}));
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
    const graph = ogm.graph({
      Node: ogm.node({
        numberField: ogm.number(),
      }),
    });
    const creations: CreateNode[] = [];
    for (let i = 0; i < 10; i++) {
      creations.push(
        graph.Node.create({
          numberField: BigInt(0) as any,
        })
      );
    }
    await neo.writeTransaction(driver, () => neo.runCommands(creations));
    const nodes = await neo.readTransaction(driver, () => graph.Node.select({}).find({}));
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
    const graph = ogm.graph({
      User: ogm.node({
        phone: ogm.optOut("HAS_PHONE", "Phone"),
      }),
      Phone: ogm.node({
        value: ogm.string(),
        user: ogm.oneIn("HAS_PHONE", "User"),
      }),
      HAS_PHONE: ogm.relationship({}),
    });
    await neo.writeTransaction(driver, async () => {
      const u0 = graph.User.create({});
      const u1 = graph.User.create({});
      const p = graph.Phone.create({ value: "+36702555555" });
      const r = graph.HAS_PHONE.create(u0, p, {});
      await neo.runCommands([u0, u1, p, r]);
    });
    const nodes = await neo.readTransaction(driver, () =>
      graph.User.select({ phone: {} }).find({})
    );
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
    await neo.writeTransaction(driver, () => loadMoviesExample());
    const movie = await neo.readTransaction(driver, () =>
      graph.Movie.select({}).findOne({
        title: { "=": "Something's Gotta Give" },
      })
    );
    await neo.writeTransaction(driver, () =>
      neo.runCommands([
        graph.Movie.update(movie!.$id, {
          tagline: "awesome tagline",
          title: "Something",
        }),
      ])
    );
    const updatedMovie = await neo.readTransaction(driver, () =>
      graph.Movie.select({}).findOne({
        title: { "=": "Something" },
      })
    );
    expect(updatedMovie?.tagline).toBe("awesome tagline");
    expect(updatedMovie?.title).toBe("Something");
    expect(updatedMovie?.released).toBe(movie?.released);
  });

  it("should correctly update relationship with type-safe wrappers", async () => {
    const graph = moviesGraph();
    await neo.writeTransaction(driver, () => loadMoviesExample());
    const person = await neo.readTransaction(driver, () =>
      graph.Person.select({ moviesActedIn: {} }).findOne({
        name: { "=": "Keanu Reeves" },
      })
    );
    const relId = person!.moviesActedIn.find((m) => m.roles.includes("Julian Mercer"))!.$rid;
    await neo.writeTransaction(driver, () =>
      neo.runCommands([
        graph.ACTED_IN.update(relId, {
          roles: ["Neo", "Julian Mercer"],
        }),
      ])
    );
    const movie = await neo.readTransaction(driver, () =>
      graph.Movie.select({ actors: {} }).findOne({
        title: { "=": "Something's Gotta Give" },
      })
    );
    const actor = movie!.actors.find((a) => a.roles.includes("Julian Mercer"))!;
    expect(actor.$id).toBe(person?.$id);
    expect(actor.roles).toEqual(["Neo", "Julian Mercer"]);
  });

  it("should throw exception when one of the references refer to an undefined node label", async () => {
    await expectException(() => {
      ogm.graph({
        User: ogm.node({
          phone: ogm.oneOut("HAS_PHONE", "Phone"),
        }),
        HAS_PHONE: ogm.relationship({}),
      } as any);
    });
  });

  it("should throw exception when one of the references refer to an undefined relationship type", async () => {
    await expectException(() => {
      ogm.graph({
        User: ogm.node({
          phone: ogm.oneOut("HAS_PHONE", "Phone"),
        }),
        Phone: ogm.node({}),
      } as any);
    });
  });
});
