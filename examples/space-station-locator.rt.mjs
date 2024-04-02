import { retort } from "../dist/index.js";

// Function to fetch space station location from the Open Notify API
const getCoordinates = async function () {
  try {
    const response = await fetch(
      'https://api.wheretheiss.at/v1/satellites/25544'
    );
    const data = await response.json();
    return [data["longitude"], data["latitude"]];
  } catch (err) {
    console.log("Couldn't fetch coordinates", err);
    throw err;
  }
};

export default retort(async ($) => {
  let coordinates = await getCoordinates();
  
  $.system`
  You are an expert on the Open Notify Recipe API. Using the location of the ISS, please go into detail on where it is currently located.
  Here is the link to the documentation: https://wheretheiss.at/w/developer
  You should respond with the current location in the world based on these coordinates: ${coordinates}.
  Respond with the location of the coordinates as in Country, be exact.
  Answer any question about the current location.
  `;

  $.user`Where is the ISS currently?`;

  await $.assistant.generation();
});