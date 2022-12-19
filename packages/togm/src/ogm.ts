import { propertyFactories } from "./property";
import { referenceFactories } from "./reference";

export {
  defineGraph as graph,
  defineNode as node,
  defineRelationship as relationship,
} from "./definition";

export { createGraphModel as dao } from "./model";

export const {
  boolean,
  booleanArray,
  booleanArrayOrNull,
  booleanOrNull,
  date,
  dateArray,
  dateArrayOrNull,
  dateOrNull,
  dateTime,
  dateTimeArray,
  dateTimeArrayOrNull,
  dateTimeOrNull,
  duration,
  durationArray,
  durationArrayOrNull,
  durationOrNull,
  localDateTime,
  localDateTimeArray,
  localDateTimeArrayOrNull,
  localDateTimeOrNull,
  localTime,
  localTimeArray,
  localTimeArrayOrNull,
  localTimeOrNull,
  number,
  numberArray,
  numberArrayOrNull,
  numberOrNull,
  point,
  pointArray,
  pointArrayOrNull,
  pointOrNull,
  string,
  stringArray,
  stringArrayOrNull,
  stringOrNull,
} = propertyFactories();

export const {
  manyIn,
  manyOut,
  manyUndirected,
  oneIn,
  oneOut,
  oneUndirected,
  optIn,
  optOut,
  optUndirected,
} = referenceFactories();
