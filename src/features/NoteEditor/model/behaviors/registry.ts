import { BlockByType, BlockType } from "@/entities/note/model/blockTypes";
import { textBehavior } from "./text/behavior";
import { BlockBehavior } from "./types";
import { listBehavior } from "./list/behavior";
import { headerBehavior } from "./header/behavior";
import { quoteBehavior } from "./quote/behavior";
import { codeBehavior } from "./code/behavior";
import { imageBehavior } from "./img/behavior";
import { fileBehavior } from "./file/behavior";


export const blockBehaviors = {
  text: textBehavior,
  header: headerBehavior,
  list: listBehavior,
  quote: quoteBehavior,
  code: codeBehavior,
  img: imageBehavior,
  link: undefined,
  file: fileBehavior,
} satisfies Partial<{
  [K in BlockType]: BlockBehavior<BlockByType<K>>;
}>;