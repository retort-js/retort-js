import { retort } from "../dist/index.js";

const retorter = retort(async ($) => {
  $.system`You are an expert on SEO keywords. 
  That can identify unique and relevant keywords for a business.
  Ask questions about the user's business that will help you come up with keywords.
  Once you have enough information you will say "READY".
  Ask one question at a time.`;

  await $.assistant.generation();

  let response;

  do {
    await $.user.input({ query: 'answer: ' });
    response = await $.assistant.generation();
  } while (!response.content.toUpperCase().includes("READY"));

  $.user`Use all the information you have about my business to generate 5 unique keywords.`;

  await $.assistant();
});

retorter._run(); // Run the conversation