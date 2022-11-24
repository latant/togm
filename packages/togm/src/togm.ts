import {
  defineGraph,
  defineNode,
  defineRelationship,
  propertyFactories,
  referenceFactories,
} from "./definition";

export const def = {
  graph: defineGraph,
  node: defineNode,
  relationship: defineRelationship,
  ...propertyFactories(),
  ...referenceFactories(),
};
