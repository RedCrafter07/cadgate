async function readFile(file: Deno.FsFile) {
	const buffer = new Uint8Array();

	await file.readSync(buffer);

	return new TextDecoder().decode(buffer);
}

export default readFile;
