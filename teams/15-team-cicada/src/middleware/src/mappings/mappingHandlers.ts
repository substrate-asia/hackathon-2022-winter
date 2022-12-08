import { SubstrateEvent } from "@subql/types";
import { TextDecoder } from "@polkadot/x-textdecoder";
import { Category,Label,Subject,Dimension,Content,Subscribe } from "../types";

export async function handleCategoryCreatedEvent(event: SubstrateEvent): Promise<void> {
  const { event: { data: [hash, name, parent, who] } } = event;
  const record = new Category(hash.toString());
  record.blockHash = event.block.block.header.hash.toString();
  // record.name = Uint8ArrayToStr(name.toU8a());
  record.name = new TextDecoder().decode(name.toU8a().slice(1));
  logger.info(name.toU8a().toString());
  logger.info(record.name);
  record.parent = parent.toString();
  record.lastAuthor = who.toString();
  record.lastDate = new Date();
  record.flag = true;
  await record.save();
}

export async function handleCategoryUpdatedEvent(event: SubstrateEvent): Promise<void> {
  const { event: { data: [hash, name, parent, who] } } = event;
  const record = await Category.get(hash.toString());
  if(record){
    record.blockHash = event.block.block.header.hash.toString();
    // record.name = Uint8ArrayToStr(name.toU8a());
    record.name = new TextDecoder().decode(name.toU8a().slice(1));
    record.parent = parent.toString();
    record.lastAuthor = who.toString();
    record.lastDate = new Date();
    await record.update();
  }
}

export async function handleLabelCreatedEvent(event: SubstrateEvent): Promise<void> {
  const { event: { data: [hash, name, category, who] } } = event;
  const parent = await Category.get(category.toString());
  if(parent){
    const record = new Label(hash.toString());
    record.blockHash = event.block.block.header.hash.toString();

    // record.name = Uint8ArrayToStr(name.toU8a());
    record.name = new TextDecoder().decode(name.toU8a().slice(1));
    logger.info(record.name);
    record.categoryId = category.toString();
    record.lastAuthor = who.toString();
    record.lastDate = new Date();
    record.flag = true;
    await record.save();
  }
}

export async function handleLabelUpdatedEvent(event: SubstrateEvent): Promise<void> {
  const { event: { data: [hash, name, category, who] } } = event;
  const record = await Label.get(hash.toString());
  const parent = await Category.get(category.toString());
  if(record && parent){
    record.blockHash = event.block.block.header.hash.toString();
    // record.name = Uint8ArrayToStr(name.toU8a());
    record.name = new TextDecoder().decode(name.toU8a().slice(1));
    logger.info(record.name);
    record.categoryId = category.toString();
    record.lastAuthor = who.toString();
    record.lastDate = new Date();
    await record.update();
  }
}

export async function handleSubjectCreatedEvent(event: SubstrateEvent): Promise<void> {
  const { event: { data: [hash, name, category, who] } } = event;
  const parent = await Category.get(category.toString());
  if(parent){
    const record = new Subject(hash.toString());
    record.blockHash = event.block.block.header.hash.toString();

    // record.name = Uint8ArrayToStr(name.toU8a());
    record.name = new TextDecoder().decode(name.toU8a().slice(1));
    logger.info(record.name);
    record.categoryId = category.toString();
    record.lastAuthor = who.toString();
    record.lastDate = new Date();
    record.flag = true;
    await record.save();
  }
}

export async function handleSubjectUpdatedEvent(event: SubstrateEvent): Promise<void> {
  const { event: { data: [hash, name, category, who] } } = event;
  const record = await Subject.get(hash.toString());
  const parent = await Category.get(category.toString());
  if(record && parent){
    record.blockHash = event.block.block.header.hash.toString();
    // record.name = Uint8ArrayToStr(name.toU8a());
    record.name = new TextDecoder().decode(name.toU8a().slice(1));
    record.categoryId = category.toString();
    record.lastAuthor = who.toString();
    record.lastDate = new Date();
    await record.update();
  }
}

export async function handleDimensionCreatedEvent(event: SubstrateEvent): Promise<void> {
  const { event: { data: [hash, name, subject, who] } } = event;
  const parent = await Subject.get(subject.toString());
  if(parent){
    const record = new Dimension(hash.toString());
    record.blockHash = event.block.block.header.hash.toString();

    // record.name = Uint8ArrayToStr(name.toU8a());
    record.name = new TextDecoder().decode(name.toU8a().slice(1));
    logger.info(record.name);
    record.subjectId = subject.toString();
    record.lastAuthor = who.toString();
    record.lastDate = new Date();
    record.flag = true;
    await record.save();
  }
}

export async function handleDimensionUpdatedEvent(event: SubstrateEvent): Promise<void> {
  const { event: { data: [hash, name, subject, who] } } = event;
  const record = await Dimension.get(hash.toString());
  const parent = await Subject.get(subject.toString());
  if(record && parent){
    record.blockHash = event.block.block.header.hash.toString();
    // record.name = Uint8ArrayToStr(name.toU8a());
    record.name = new TextDecoder().decode(name.toU8a().slice(1));
    logger.info(record.name);
    record.subjectId = subject.toString();
    record.lastAuthor = who.toString();
    record.lastDate = new Date();
    await record.update();
  }
    
}

export async function handleContentCreatedEvent(event: SubstrateEvent): Promise<void> {
  const { event: { data: [hash, category, label, subject, dimension, content, who] } } = event;
  const pCategory = await Category.get(category.toString());
  const pDimension = await Dimension.get(dimension.toString());
  if(pCategory && pDimension) {
    const record = new Content(hash.toString());
    record.blockHash = event.block.block.header.hash.toString();

    // record.content = Uint8ArrayToStr(content.toU8a());
    // record.label = Uint8ArrayToStr(label.toU8a());
    record.content = new TextDecoder().decode(content.toU8a().slice(1));
    record.label = new TextDecoder().decode(label.toU8a().slice(1));
    logger.info(record.content);
    logger.info(record.label);
    record.categoryId = category.toString();
    record.dimensionId = dimension.toString();
    record.lastAuthor = who.toString();
    record.lastDate = new Date();
    record.flag = true;
    await record.save();
  }
}

export async function handleContentUpdatedEvent(event: SubstrateEvent): Promise<void> {
  const { event: { data: [hash, category, label, subject, dimension, content, who] } } = event;
  const record = await Content.get(hash.toString());
  const pCategory = await Category.get(category.toString());
  const pDimension = await Dimension.get(dimension.toString());
  if(record && pCategory && pDimension) {
    record.blockHash = event.block.block.header.hash.toString();
    // record.content = Uint8ArrayToStr(content.toU8a());
    // record.label = Uint8ArrayToStr(label.toU8a());
    record.content = new TextDecoder().decode(content.toU8a().slice(1));
    record.label = new TextDecoder().decode(label.toU8a().slice(1));
    logger.info(record.content);
    logger.info(record.label);
    record.categoryId = category.toString();
    record.dimensionId = dimension.toString();
    record.lastAuthor = who.toString();
    record.lastDate = new Date();
    await record.update();
  }
}

export async function handleSubscribeEvent(event: SubstrateEvent): Promise<void> {
  const { event: { data: [hash, subject, who] } } = event;
  const parent = await Subject.get(subject.toString());
  if(parent){
    const record = new Subscribe(hash.toString());
    record.blockHash = event.block.block.header.hash.toString();
    record.subjectId = subject.toString();
    record.subscriber = who.toString();
    record.subscribeDate = new Date();
    record.flag = true;
    await record.save();
  }
    
}

export async function handleSubscribeCancelEvent(event: SubstrateEvent): Promise<void> {
  const { event: { data: [hash, who] } } = event;
  const record = await Subscribe.get(hash.toString());
  if(record){
    record.flag = false;
    await record.update();
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
