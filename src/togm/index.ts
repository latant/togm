import { defineGraph, defineNode, defineRelationship, propertyFactories, referenceFactories } from "./define";

export const def = {
  graph: defineGraph,
  node: defineNode,
  relationship: defineRelationship,
  ...propertyFactories(),
  ...referenceFactories(),
};
