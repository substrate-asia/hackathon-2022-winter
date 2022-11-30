import { SubstrateEvent } from "@subql/types";
import { TextDecoder } from "@polkadot/x-textdecoder";
import { Category,Label,Subject,Dimension,Content } from "../types";

export async function handleCategoryCreatedEvent(event: SubstrateEvent): Promise<void> {
  const { event: { data: [hash, name, parent, who] } } = event;
  const record = new Category(hash.toString());
  record.blockHash = event.block.block.header.hash.toString();

  // record.name = Uint8ArrayToStr(name.toU8a());
  record.name = new TextDecoder().decode(name.toU8a());
  logger.info(name.toU8a().toString());
  logger.info(name.toString());
  logger.info(record.name);
  record.parent = parent.toString();
  record.lastModifier = who.toString();
  record.lastmodifyDate = new Date();
  await record.save();
}

export async function handleLabelCreatedEvent(event: SubstrateEvent): Promise<void> {
  const { event: { data: [hash, name, category, who] } } = event;
  const parent = Category.get(category.toString());
  if(parent){
    const record = new Label(hash.toString());
    record.blockHash = event.block.block.header.hash.toString();

    // record.name = Uint8ArrayToStr(name.toU8a());
    record.name = new TextDecoder().decode(name.toU8a());
    logger.info(record.name);
    record.categoryId = category.toString();
    record.lastModifier = who.toString();
    record.lastmodifyDate = new Date();
    await record.save();
  }
}

export async function handleSubjectCreatedEvent(event: SubstrateEvent): Promise<void> {
  const { event: { data: [hash, name, category, who] } } = event;
  const parent = Category.get(category.toString());
  if(parent){
    const record = new Subject(hash.toString());
    record.blockHash = event.block.block.header.hash.toString();

    // record.name = Uint8ArrayToStr(name.toU8a());
    record.name = new TextDecoder().decode(name.toU8a());
    logger.info(record.name);
    record.categoryId = category.toString();
    record.lastModifier = who.toString();
    record.lastmodifyDate = new Date();
    await record.save();
  }
}

export async function handleDimensionCreatedEvent(event: SubstrateEvent): Promise<void> {
  const { event: { data: [hash, name, subject, who] } } = event;
  const parent = Subject.get(subject.toString());
  if(parent){
    const record = new Dimension(hash.toString());
    record.blockHash = event.block.block.header.hash.toString();

    // record.name = Uint8ArrayToStr(name.toU8a());
    record.name = new TextDecoder().decode(name.toU8a());
    logger.info(record.name);
    record.subjectId = subject.toString();
    record.lastModifier = who.toString();
    record.lastmodifyDate = new Date();
    await record.save();
  }
}

export async function handleContentCreatedEvent(event: SubstrateEvent): Promise<void> {
  const { event: { data: [hash, category, label, subject, dimension, content, who] } } = event;
  const pCategory = Category.get(category.toString());
  const pDimension = Dimension.get(dimension.toString());
  if(pCategory && pDimension) {
    const record = new Content(hash.toString());
    record.blockHash = event.block.block.header.hash.toString();

    // record.content = Uint8ArrayToStr(content.toU8a());
    // record.label = Uint8ArrayToStr(label.toU8a());
    record.content = new TextDecoder().decode(content.toU8a());
    record.label = new TextDecoder().decode(label.toU8a());
    logger.info(record.content);
    logger.info(record.label);
    record.categoryId = category.toString();
    record.dimensionId = dimension.toString();
    record.lastModifier = who.toString();
    record.lastmodifyDate = new Date();
    await record.save();
  }
}

// function Uint8ArrayToStr(array) {
//   var out, i, len, c;
//   var char2, char3;

//   out = "";
//   len = array.length;
//   i = 0;
//   while (i < len) {
//     c = array[i++];
//     switch (c >> 4) {
//       case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
//         // 0xxxxxxx
//         out += String.fromCharCode(c);
//         break;
//       case 12: case 13:
//         // 110x xxxx 10xx xxxx
//         char2 = array[i++];
//         out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
//         break;
//       case 14:
//         // 1110 xxxx 10xx xxxx 10xx xxxx
//         char2 = array[i++];
//         char3 = array[i++];
//         out += String.fromCharCode(((c & 0x0F) << 12) |
//           ((char2 & 0x3F) << 6) |
//           ((char3 & 0x3F) << 0));
//         break;
//     }
//   }
//   return out;
// }
