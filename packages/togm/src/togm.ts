import { defineNode, defineRelationship } from "./definition";
import { createGraph } from "./graph";
import { propertyFactories } from "./property";
import { referenceFactories } from "./reference";

export const ogm = {
  graph: createGraph,
  node: defineNode,
  relationship: defineRelationship,
  ...propertyFactories(),
  ...referenceFactories(),
};
