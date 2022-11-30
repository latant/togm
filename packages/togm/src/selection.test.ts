import { z } from "zod";
import { loadMoviesExample, moviesGraph } from "./test/movies";
import { loadNorthwindExample, northwindGraph } from "./test/northwind";
import { expectException, expectValid, useTestDatabase } from "./test/testUtils";
import { readTransaction, writeTransaction } from "./transaction";

describe("test type-safe graph selections", () => {
  const driver = useTestDatabase();

  it("should include multiple nodes one hop away from the root", async () => {
    const graph = moviesGraph();
    await writeTransaction(driver, async () => {
      await loadMoviesExample();
    });
    const selection = graph.select.Movie({ actors: {} });
    const findResult = await readTransaction(driver, () => selection.find({}));
    const findOneResult = await readTransaction(driver, () => selection.findOne({}));
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
    await writeTransaction(driver, async () => {
      await loadMoviesExample();
    });
    const selection = graph.select.Movie({ actors: { moviesActedIn: {} } });
    const findResult = await readTransaction(driver, () => selection.find({}));
    const findOneResult = await readTransaction(driver, () => selection.findOne({}));
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
        })
      ),
    });
    expectValid(findResult, z.array(type));
    expectValid(findOneResult, type);
  });

  it("should include single nodes one hop away from the root", async () => {
    const graph = northwindGraph();
    await writeTransaction(driver, async () => {
      await loadNorthwindExample();
    });
    const selection = graph.select.Product({ category: {} });
    const findResult = await readTransaction(driver, () => selection.find({}));
    const findOneResult = await readTransaction(driver, () => selection.findOne({}));
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

  it("should throw an exception when an entity reference is invalid", async () => {
    const graph = northwindGraph();
    graph.definition.Product.members.category.label = "InvalidLabel" as any;
    await expectException(() => graph.select.Product({ category: {} }));
  });

  it("should throw an exception when a relationship type in a reference is a label", async () => {
    const graph = northwindGraph();
    graph.definition.Product.members.category.relationshipType = "Supplier" as any;
    await expectException(() => graph.select.Product({ category: {} }));
  });

  it("should throw an exception when a label in a reference is a relationship type", async () => {
    const graph = northwindGraph();
    graph.definition.Product.members.category.label = "SUPPLIES" as any;
    await expectException(() => graph.select.Product({ category: {} }));
  });

  it("should throw error when the selection field is a property", async () => {
    const graph = moviesGraph();
    await expectException(() => graph.select.Movie({ actors: {}, title: {} } as any));
  });

  it("should throw an exception when a selection field is not a member of the entity", async () => {
    const graph = northwindGraph();
    await expectException(() => graph.select.Product({ description: {} } as any));
  });
});
