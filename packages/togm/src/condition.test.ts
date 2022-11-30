import { loadMoviesExample, moviesGraph } from "./test/movies";
import { useTestDatabase } from "./test/testUtils";
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
});
