import { z } from "zod";
import { loadMoviesExample, moviesDAO } from "./test/movies";
import { loadNorthwindExample, northwindDAO } from "./test/northwind";
import { expectException, expectValid, useTestDatabase } from "./test/testUtils";

describe("test type-safe graph selections", () => {
  const client = useTestDatabase();

  it("should include multiple nodes one hop away from the root", async () => {
    const dao = moviesDAO();
    await client.writeTx(async () => {
      await loadMoviesExample();
    });
    const selection = dao.Movie.select({ actors: {} });
    const findResult = await client.readTx(() => selection.findAll());
    const findOneResult = await client.readTx(() => selection.findOne());
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
    const dao = moviesDAO();
    await client.writeTx(async () => {
      await loadMoviesExample();
    });
    const selection = dao.Movie.select({ actors: { moviesActedIn: {}, followers: {} } });
    const findResult = await client.readTx(() => selection.findAll());
    const findOneResult = await client.readTx(() => selection.findOne());
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
    const dao = northwindDAO();
    await client.writeTx(async () => {
      await loadNorthwindExample();
    });
    const selection = dao.Product.select({ category: {} });
    const findResult = await client.readTx(() => selection.findAll());
    const findOneResult = await client.readTx(() => selection.findOne());
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
    const dao = moviesDAO();
    await expectException(() => dao.Movie.select({ actors: {}, title: {} } as any));
  });

  it("should throw an exception when a selection field is not a member of the entity", async () => {
    const dao = northwindDAO();
    await expectException(() => dao.Product.select({ description: {} } as any));
  });

  it("should generate where clause in the cypher of a selection using a reference condition", async () => {
    const dao = moviesDAO();
    await client.writeTx(() => loadMoviesExample());
    const movie = await client.readTx(() =>
      dao.Movie.select({ actors: { $where: { roles: { contains: "Racer X" } } } }).findOne({
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
