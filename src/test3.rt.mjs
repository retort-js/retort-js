let reply = await assistant()

if (await reply.query(Boolean)`Was that in french?`) {
    // continue conversation
}
else {
    throw new Error("Assistant stopped talking in french.");
}