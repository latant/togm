import { z } from "zod";

console.log(z.object({ a: z.number().optional() }).partial().parse({ a: null }));
