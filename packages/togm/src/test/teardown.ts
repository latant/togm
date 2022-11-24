export default async () => {
  await (global as any).neo4jContainer.stop();
};
