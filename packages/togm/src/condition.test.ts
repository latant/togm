/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { z } from "zod";
import { loadMoviesExample, moviesDAO } from "./test/movies";
import { expectValid, useTestDatabase } from "./test/testUtils";

describe("condition tests", () => {
  const client = useTestDatabase();

  it("should filter correctly by equaling a property", async () => {
    const dao = moviesDAO();
    await client.writeTx(() => loadMoviesExample());
    const result = await client.readTx(() => dao.Movie.findAll({ released: { "=": 2000 } }));
    expect(result.length).toBe(3);
    expect(result[0].released).toEqual(2000);
    expect(result[1].released).toEqual(2000);
    expect(result[2].released).toEqual(2000);
  });

  it("should find node by id", async () => {
    const dao = moviesDAO();
    await client.writeTx(() => loadMoviesExample());
    const movie = await client.readTx(() => dao.Movie.select({}).findOne());
    const foundMovies = await client.readTx(() => dao.Movie.findAll({ $id: movie!.$id }));
    expect(foundMovies).toEqual([movie]);
  });

  it("should find node by ids", async () => {
    const dao = moviesDAO();
    await client.writeTx(() => loadMoviesExample());
    const [first, second] = await client.readTx(() => dao.Movie.findAll());
    const foundMovies = await client.readTx(() =>
      dao.Movie.findAll({ $id: [first.$id, second.$id] })
    );
    expect(foundMovies).toEqual([first, second]);
  });

  it("should find nodes that satisfy all conditions", async () => {
    const dao = moviesDAO();
    await client.writeTx(() => loadMoviesExample());
    const movies99 = await client.readTx(() => dao.Movie.findAll({ released: { "=": 1999 } }));
    expect(movies99.length).toBe(4);
    const movies99a = await client.readTx(() =>
      dao.Movie.findAll({ released: { "=": 1999 }, title: { contains: "a" } })
    );
    expect(movies99a.length).toBe(3);
    expect(movies99.filter((m) => m.title.includes("a"))).toEqual(movies99a);
  });

  it("should find all nodes that satisfy one of the conditions in a field's $any clause", async () => {
    const dao = moviesDAO();
    await client.writeTx(() => loadMoviesExample());
    const movies = await client.readTx(() =>
      dao.Movie.findAll({
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
    const dao = moviesDAO();
    await client.writeTx(() => loadMoviesExample());
    const movies = await client.readTx(() =>
      dao.Movie.findAll({
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
    const dao = moviesDAO();
    await client.writeTx(() => loadMoviesExample());
    const movies = await client.readTx(() =>
      dao.Movie.findAll({
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
    const dao = moviesDAO();
    await client.writeTx(() => loadMoviesExample());
    const movies = await client.readTx(() =>
      dao.Movie.findAll({
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
    const dao = moviesDAO();
    await client.writeTx(() => loadMoviesExample());
    const allMovies = await client.readTx(() => dao.Movie.findAll());
    const moviesWithTagline = await client.readTx(() =>
      dao.Movie.findAll({ tagline: { null: false } })
    );
    const moviesWithoutTagline = await client.readTx(() =>
      dao.Movie.findAll({ tagline: { null: true } })
    );
    expect(moviesWithoutTagline.length).toBe(1);
    expect(moviesWithTagline.length + moviesWithoutTagline.length).toBe(allMovies.length);
  });
});
