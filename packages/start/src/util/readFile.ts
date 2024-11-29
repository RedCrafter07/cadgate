async function readFile(file: Deno.FsFile) {
	const buffer = new Uint8Array();

	await file.read(buffer);

	return buffer.toString();
}

export default readFile;
