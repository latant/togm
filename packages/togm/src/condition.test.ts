import { z } from "zod";
import { loadMoviesExample, moviesGraph } from "./test/movies";
import { expectValid, useTestDatabase } from "./test/testUtils";
import { readTransaction, writeTransaction } from "./transaction";

describe("condition tests", () => {
  const driver = useTestDatabase();

  it("should filter correctly by equaling a property", async () => {
    const graph = moviesGraph();
    await writeTransaction(driver, () => loadMoviesExample());
    const result = await readTransaction(driver, () =>
      graph.select.Movie({}).find({
        released: { "=": 2000 },
      })
    );
    expect(result.length).toBe(3);
    expect(result[0].released).toEqual(2000);
    expect(result[1].released).toEqual(2000);
    expect(result[2].released).toEqual(2000);
  });

  it("should find node by id", async () => {
    const graph = moviesGraph();
    await writeTransaction(driver, () => loadMoviesExample());
    const movie = await readTransaction(driver, () => graph.select.Movie({}).findOne({}));
    const foundMovies = await readTransaction(driver, () =>
      graph.select.Movie({}).find({ $id: movie!.$id })
    );
    expect(foundMovies).toEqual([movie]);
  });

  it("should find node by ids", async () => {
    const graph = moviesGraph();
    await writeTransaction(driver, () => loadMoviesExample());
    const [first, second] = await readTransaction(driver, () => graph.select.Movie({}).find({}));
    const foundMovies = await readTransaction(driver, () =>
      graph.select.Movie({}).find({ $id: [first.$id, second.$id] })
    );
    expect(foundMovies).toEqual([first, second]);
  });

  it("should find nodes that satisfy all conditions", async () => {
    const graph = moviesGraph();
    await writeTransaction(driver, () => loadMoviesExample());
    const movies99 = await readTransaction(driver, () =>
      graph.select.Movie({}).find({ released: { "=": 1999 } })
    );
    expect(movies99.length).toBe(4);
    const movies99a = await readTransaction(driver, () =>
      graph.select.Movie({}).find({
        released: { "=": 1999 },
        title: { contains: "a" },
      })
    );
    expect(movies99a.length).toBe(3);
    expect(movies99.filter((m) => m.title.includes("a"))).toEqual(movies99a);
  });

  it("should find all nodes that satisfy one of the conditions in a field's $any clause", async () => {
    const graph = moviesGraph();
    await writeTransaction(driver, () => loadMoviesExample());
    const movies = await readTransaction(driver, () =>
      graph.select.Movie({}).find({
        released: {
          $any: {
            "<": 1992,
            ">": 1995,
          },
        },
      })
    );
    expect(movies.length).toBe(31);
    expectValid(
      movies,
      z.array(
        z.object({
          released: z.number().refine((r) => r < 1992 || r > 1995),
        })
      )
    );
  });

  it("should find all nodes that satisfy one of the conditions in a regular $any clause", async () => {
    const graph = moviesGraph();
    await writeTransaction(driver, () => loadMoviesExample());
    const movies = await readTransaction(driver, () =>
      graph.select.Movie({}).find({
        $any: {
          released: { ">": 1999 },
          title: { contains: "x" },
        },
      })
    );
    expect(movies.length).toBe(16);
    expectValid(
      movies,
      z.array(
        z
          .object({
            released: z.number(),
            title: z.string(),
          })
          .refine((m) => m.released > 1999 || m.title.includes("x"))
      )
    );
  });

  it("should find all nodes that does not satisfy the conditions in a field's $not clause", async () => {
    const graph = moviesGraph();
    await writeTransaction(driver, () => loadMoviesExample());
    const movies = await readTransaction(driver, () =>
      graph.select.Movie({}).find({
        released: {
          $not: {
            ">=": 1992,
            "<=": 1995,
          },
        },
      })
    );
    expect(movies.length).toBe(31);
    expectValid(
      movies,
      z.array(
        z.object({
          released: z.number().refine((r) => r < 1992 || r > 1995),
        })
      )
    );
  });

  it("should find all nodes that does not satisfy the condition in a regular $not clause", async () => {
    const graph = moviesGraph();
    await writeTransaction(driver, () => loadMoviesExample());
    const movies = await readTransaction(driver, () =>
      graph.select.Movie({}).find({
        $not: {
          released: { $not: { ">": 1999 } },
          title: { $not: { contains: "x" } },
        },
      })
    );
    expect(movies.length).toBe(16);
    expectValid(
      movies,
      z.array(
        z
          .object({
            released: z.number(),
            title: z.string(),
          })
          .refine((m) => m.released > 1999 || m.title.includes("x"))
      )
    );
  });

  it("should properly use 'is null' and 'is not null' conditions", async () => {
    const graph = moviesGraph();
    await writeTransaction(driver, () => loadMoviesExample());
    const allMovies = await readTransaction(driver, () => graph.select.Movie({}).find({}));
    const moviesWithTagline = await readTransaction(driver, () =>
      graph.select.Movie({}).find({
        tagline: { null: false },
      })
    );
    const moviesWithoutTagline = await readTransaction(driver, () =>
      graph.select.Movie({}).find({
        tagline: { null: true },
      })
    );
    expect(moviesWithoutTagline.length).toBe(1);
    expect(moviesWithTagline.length + moviesWithoutTagline.length).toBe(allMovies.length);
  });
});
