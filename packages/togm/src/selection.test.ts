import { z } from "zod";
import { loadMoviesExample, moviesGraph } from "./test/movies";
import { loadNorthwindExample, northwindGraph } from "./test/northwind";
import { expectException, expectValid, useTestDatabase } from "./test/testUtils";
import { neo } from "./togm";

describe("test type-safe graph selections", () => {
  const driver = useTestDatabase();

  it("should include multiple nodes one hop away from the root", async () => {
    const graph = moviesGraph();
    await neo.writeTx(driver, async () => {
      await loadMoviesExample();
    });
    const selection = graph.Movie.select({ actors: {} });
    const findResult = await neo.readTx(driver, () => selection.findAll({}));
    const findOneResult = await neo.readTx(driver, () => selection.findOne({}));
    const type = z.strictObject({
      $id: z.number(),
      title: z.string(),
      released: z.number(),
      tagline: z.string().nullable(),
      actors: z.array(
        z.strictObject({
          $rid: z.number(),
          $id: z.number(),
          name: z.string(),
          born: z.number().nullable(),
          roles: z.string().array(),
        })
      ),
    });
    expectValid(findResult, z.array(type));
    expectValid(findOneResult, type);
  });

  it("should include multiple nodes two hop away from the root", async () => {
    const graph = moviesGraph();
    await neo.writeTx(driver, async () => {
      await loadMoviesExample();
    });
    const selection = graph.Movie.select({ actors: { moviesActedIn: {}, followers: {} } });
    const findResult = await neo.readTx(driver, () => selection.findAll({}));
    const findOneResult = await neo.readTx(driver, () => selection.findOne({}));
    const type = z.strictObject({
      $id: z.number(),
      title: z.string(),
      released: z.number(),
      tagline: z.string().nullable(),
      actors: z.array(
        z.strictObject({
          $rid: z.number(),
          $id: z.number(),
          name: z.string(),
          born: z.number().nullable(),
          roles: z.string().array(),
          moviesActedIn: z.array(
            z.strictObject({
              $rid: z.number(),
              $id: z.number(),
              title: z.string(),
              released: z.number(),
              tagline: z.string().nullable(),
              roles: z.string().array(),
            })
          ),
          followers: z.array(
            z.strictObject({
              $rid: z.number(),
              $id: z.number(),
              name: z.string(),
              born: z.number().nullable(),
              roles: z.string().array(),
            })
          ),
        })
      ),
    });
    expectValid(findResult, z.array(type));
    expectValid(findOneResult, type);
  });

  it("should include single nodes one hop away from the root", async () => {
    const graph = northwindGraph();
    await neo.writeTx(driver, async () => {
      await loadNorthwindExample();
    });
    const selection = graph.Product.select({ category: {} });
    const findResult = await neo.readTx(driver, () => selection.findAll({}));
    const findOneResult = await neo.readTx(driver, () => selection.findOne({}));
    const type = z.strictObject({
      $id: z.number(),
      unitPrice: z.number(),
      unitsInStock: z.number(),
      reorderLevel: z.number(),
      discontinued: z.boolean(),
      quantityPerUnit: z.string(),
      productName: z.string(),
      unitsOnOrder: z.number(),
      category: z.strictObject({
        $rid: z.number(),
        $id: z.number(),
        description: z.string(),
        categoryName: z.string(),
      }),
    });
    expectValid(findResult, z.array(type));
    expectValid(findOneResult, type);
  });

  it("should throw error when the selection field is a property", async () => {
    const graph = moviesGraph();
    await expectException(() => graph.Movie.select({ actors: {}, title: {} } as any));
  });

  it("should throw an exception when a selection field is not a member of the entity", async () => {
    const graph = northwindGraph();
    await expectException(() => graph.Product.select({ description: {} } as any));
  });

  it("should generate where clause in the cypher of a selection using a reference condition", async () => {
    const graph = moviesGraph();
    await neo.writeTx(driver, loadMoviesExample);
    const movie = await neo.readTx(driver, () =>
      graph.Movie.select({ actors: { $where: { roles: { contains: "Racer X" } } } }).findOne({
        title: { "=": "Speed Racer" },
      })
    );
    expectValid(
      movie,
      z.strictObject({
        $id: z.number(),
        tagline: z.literal("Speed has no limits"),
        title: z.literal("Speed Racer"),
        released: z.literal(2008),
        actors: z.tuple([
          z.strictObject({
            $id: z.number(),
            $rid: z.number(),
            born: z.literal(1966),
            name: z.literal("Matthew Fox"),
            roles: z.tuple([z.literal("Racer X")]),
          }),
        ]),
      })
    );
  });
});
