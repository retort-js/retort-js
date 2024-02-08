import fs from "fs/promises";
import { Conversation } from "../dist/index.js";
let { chat, user, assistant, system } = new Conversation();

async function readFile(path) {
  try {
    const data = await fs.readFile(path, "utf8");
    return data;
  } catch (err) {
    console.error(`Error reading file from disk: ${err}`);
  }
}

const vuelidateUpdate = `
You are an expert on the Vuelidate Vue Js library. You are tasked with updating vuelidate code to version 2. These are your guidelines:
1. Use Vuelidate V2
2. Here is the link to the documentation: https://vuelidate-next.netlify.app/
3. Here is an example: import { useVuelidate } from '@vuelidate/core'
import { required, email } from '@vuelidate/validators' const state = reactive({
    firstName: '',
    lastName: '',
    contact: {
      email: ''
    }
  })
  const rules = {
    firstName: { required }, // Matches state.firstName
    lastName: { required }, // Matches state.lastName
    contact: {
      email: { required, email } // Matches state.contact.email
    }
  }

  const v$ = useVuelidate(rules, state)`;

const instructions = `
You are code translator, that takes a vuejs 2 component written with vue-class-component and vue-property-decorator and converts it to a vuejs 3 using composition API. These are your guidelines:

1. Replace class-based component with the Composition API.

2. Use the '<script lang="ts" setup>' syntax for the script section.

3. Define props using 'defineProps', maintaining and specifying their types with type annotations, eg.: 'const props = defineProps<{ propName: Type; }>();'

4. Convert methods to regular anonymous functions inside constants, eg.: 'const coolFunction = () => {}';.

5. Use 4 spaces for indentation.

6. Avoid destructuring props; use 'props.propName'.

7. Convert computed properties to use the 'computed' function.

8. Use TypeScript and type annotations wherever possible.

9. Make sure function declarations are above their usage.

10. When the vue router function is used - import useRouter from services/utilities/useRoute.ts and use it instead.

11. Do not change debug statements.

Think this through step by step.`;

system(instructions);

assistant`Please enter the path to the file you want to convert: `;

const filePath = await user();
const vueComponent = await readFile(filePath.content);


if (!vueComponent) {
    assistant`File not found. Please try again.`;
    process.exit(0);
}

const closingScriptTag = vueComponent.indexOf("</script>");
const scriptAndTemplateOnly = vueComponent.slice(0, closingScriptTag);

user(scriptAndTemplateOnly);

const vue3Component = await assistant();



// const chat2 = new Conversation();


// chat2.system(vuelidateUpdate);

// chat2.user(reply)

// const secondReply = await assistant();
process.exit(0);
