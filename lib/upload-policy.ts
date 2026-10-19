const imageTypes=new Set(['image/jpeg','image/png','image/webp']);
const documentTypes=new Set([...imageTypes,'application/pdf']);

export function validateUpload(file:File,bucket:string){
  const privateDocument=bucket==='founding-verification-documents';
  const image=['avatars','covers','hotel-images','room-images'].includes(bucket);
  const video=bucket==='videos';
  if(!privateDocument&&!image&&!video)throw new Error('This upload destination is not supported.');
  const allowed=privateDocument?documentTypes:image?imageTypes:new Set(['video/mp4']);
  if(!allowed.has(file.type))throw new Error(`${file.name}: unsupported file format.`);
  const limit=privateDocument?10*1024*1024:image?20*1024*1024:250*1024*1024;
  if(file.size<1||file.size>limit)throw new Error(`${file.name}: file must be between 1 byte and ${privateDocument?10:image?20:250} MB.`);
  const suffix=file.name.split('.').pop()?.toLowerCase();
  const expected=file.type==='image/jpeg'?['jpg','jpeg']:file.type==='image/png'?['png']:file.type==='image/webp'?['webp']:file.type==='application/pdf'?['pdf']:['mp4'];
  if(!suffix||!expected.includes(suffix))throw new Error(`${file.name}: the extension does not match its file type.`);
}

export async function validateUploadContent(file:File){
  const bytes=new Uint8Array(await file.slice(0,16).arrayBuffer());
  const ascii=(start:number,end:number)=>String.fromCharCode(...bytes.slice(start,end));
  const valid=file.type==='image/jpeg'?bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff:
    file.type==='image/png'?bytes[0]===0x89&&ascii(1,4)==='PNG':
    file.type==='image/webp'?ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP':
    file.type==='application/pdf'?ascii(0,5)==='%PDF-':
    file.type==='video/mp4'?ascii(4,8)==='ftyp':false;
  if(!valid)throw new Error(`${file.name}: the file content does not match its format.`);
}
