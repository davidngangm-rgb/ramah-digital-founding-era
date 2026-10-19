export function captureUploadSubmission(form:HTMLFormElement){
  if(!(form instanceof HTMLFormElement))throw new TypeError('The upload form is unavailable');
  const metadata=new FormData(form);
  const selections=Array.from(form.querySelectorAll<HTMLInputElement>('input[type="file"][data-upload-bucket]')).map(input=>({
    name:input.name,
    bucket:input.dataset.uploadBucket,
    output:input.dataset.uploadOutput,
    isPrivate:input.dataset.uploadPrivate==='true',
    files:Array.from(input.files??[]),
  }));
  // Only Storage references, never File bodies, cross the Server Action boundary.
  for(const input of selections)if(input.name)metadata.delete(input.name);
  return {metadata,selections};
}
