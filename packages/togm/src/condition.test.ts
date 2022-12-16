/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { z } from "zod";
import { loadMoviesExample, moviesGraph } from "./test/movies";
import { expectValid, useTestDatabase } from "./test/testUtils";
import { neo } from "./togm";

describe("condition tests", () => {
  const driver = useTestDatabase();

  it("should filter correctly by equaling a property", async () => {
    const graph = moviesGraph();
    await neo.writeTx(driver, () => loadMoviesExample());
    const result = await neo.readTx(driver, () =>
      graph.Movie.where({ released: { "=": 2000 } }).findAll()
    );
    expect(result.length).toBe(3);
    expect(result[0].released).toEqual(2000);
    expect(result[1].released).toEqual(2000);
    expect(result[2].released).toEqual(2000);
  });

  it("should find node by id", async () => {
    const graph = moviesGraph();
    await neo.writeTx(driver, () => loadMoviesExample());
    const movie = await neo.readTx(driver, () => graph.Movie.select({}).findOne());
    const foundMovies = await neo.readTx(driver, () =>
      graph.Movie.where({ $id: movie!.$id }).findAll({})
    );
    expect(foundMovies).toEqual([movie]);
  });

  it("should find node by ids", async () => {
    const graph = moviesGraph();
    await neo.writeTx(driver, () => loadMoviesExample());
    const [first, second] = await neo.readTx(driver, () => graph.Movie.findAll());
    const foundMovies = await neo.readTx(driver, () =>
      graph.Movie.where({ $id: [first.$id, second.$id] }).findAll({})
    );
    expect(foundMovies).toEqual([first, second]);
  });

  it("should find nodes that satisfy all conditions", async () => {
    const graph = moviesGraph();
    await neo.writeTx(driver, () => loadMoviesExample());
    const movies99 = await neo.readTx(driver, () =>
      graph.Movie.where({ released: { "=": 1999 } }).findAll()
    );
    expect(movies99.length).toBe(4);
    const movies99a = await neo.readTx(driver, () =>
      graph.Movie.where({ released: { "=": 1999 }, title: { contains: "a" } }).findAll()
    );
    expect(movies99a.length).toBe(3);
    expect(movies99.filter((m) => m.title.includes("a"))).toEqual(movies99a);
  });

  it("should find all nodes that satisfy one of the conditions in a field's $any clause", async () => {
    const graph = moviesGraph();
    await neo.writeTx(driver, () => loadMoviesExample());
    const movies = await neo.readTx(driver, () =>
      graph.Movie.where({
        released: {
          $any: {
            "<": 1992,
            ">": 1995,
          },
        },
      }).findAll()
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
    await neo.writeTx(driver, () => loadMoviesExample());
    const movies = await neo.readTx(driver, () =>
      graph.Movie.where({
        $any: {
          released: { ">": 1999 },
          title: { contains: "x" },
        },
      }).findAll()
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
    await neo.writeTx(driver, () => loadMoviesExample());
    const movies = await neo.readTx(driver, () =>
      graph.Movie.where({
        released: {
          $not: {
            ">=": 1992,
            "<=": 1995,
          },
        },
      }).findAll()
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
    await neo.writeTx(driver, () => loadMoviesExample());
    const movies = await neo.readTx(driver, () =>
      graph.Movie.where({
        $not: {
          released: { $not: { ">": 1999 } },
          title: { $not: { contains: "x" } },
        },
      }).findAll()
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
    await neo.writeTx(driver, () => loadMoviesExample());
    const allMovies = await neo.readTx(driver, () => graph.Movie.findAll());
    const moviesWithTagline = await neo.readTx(driver, () =>
      graph.Movie.where({ tagline: { null: false } }).findAll()
    );
    const moviesWithoutTagline = await neo.readTx(driver, () =>
      graph.Movie.where({ tagline: { null: true } }).findAll()
    );
    expect(moviesWithoutTagline.length).toBe(1);
    expect(moviesWithTagline.length + moviesWithoutTagline.length).toBe(allMovies.length);
  });
});
