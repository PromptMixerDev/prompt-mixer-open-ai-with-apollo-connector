import OpenAI from 'openai';
import { config } from './config.js';
import { ChatCompletion } from 'openai/resources';
import axios from 'axios';

const OPENAI_API_KEY = 'OPENAI_API_KEY';
const APOLLO_KEY = 'APOLLO_KEY';

interface Message {
  role: string;
  content: string;
  tool_call_id?: string | null;
  name?: string | null;
}

interface Completion {
  Content: string | null;
  Error?: string | undefined;
  TokenUsage: number | undefined;
  ToolCalls?: any;
}

interface ConnectorResponse {
  Completions: Completion[];
  ModelType: string;
}

interface ErrorCompletion {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error: string;
  model: string;
  usage: undefined;
}

const mapToResponse = (
  outputs: Array<ChatCompletion | ErrorCompletion>,
  model: string,
): ConnectorResponse => {
  return {
    Completions: outputs.map((output) => {
      if ('error' in output) {
        return {
          Content: null,
          TokenUsage: undefined,
          Error: output.error,
        };
      } else {
        return {
          Content: output.choices[0]?.message?.content,
          TokenUsage: output.usage?.total_tokens,
        };
      }
    }),
    ModelType: outputs[0].model || model,
  };
};

const mapErrorToCompletion = (error: any, model: string): ErrorCompletion => {
  const errorMessage = error.message || JSON.stringify(error);
  return {
    choices: [],
    error: errorMessage,
    model,
    usage: undefined,
  };
};

async function searchPeopleUsingApollo(
  apiKey: string,
  organizationDomains?: string,
  locations?: string,
  titles?: string,
  limit?: number
) {
  const query: Record<string, any> = {};

  if (organizationDomains) {
    query.q_organization_domains = organizationDomains;
  }
  if (locations) {
    query.person_locations = [locations];
  }
  if (titles) {
    query.person_titles = [titles];
  }
  if (limit) {
    query.per_page = limit;
  }

  console.log('API Key:', apiKey);
  console.log('Searching people using Apollo API with query:', query);

  try {
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/search',
      query,
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': apiKey,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Apollo API request failed:', error);
    throw error;
  }
}

async function main(
  model: string,
  prompts: string[],
  properties: Record<string, unknown>,
  settings: Record<string, unknown>,
) {
  const openai = new OpenAI({
    apiKey: settings?.[OPENAI_API_KEY] as string,
  });

  const total = prompts.length;
  const { prompt, ...restProperties } = properties;
  const systemPrompt = (prompt || config.properties.find((prop) => prop.id === 'prompt')?.value) as string;
  const messageHistory: Message[] = [{ role: 'system', content: systemPrompt }];
  const outputs: Array<ChatCompletion | ErrorCompletion> = [];

  const tools = [
    {
      type: 'function',
      function: {
        name: 'searchPeopleUsingApollo',
        description: 'Use this function to search for people using the Apollo API. Provide the search query parameters to filter and find specific individuals based on criteria such as organization domains, locations, titles, and limit. The results can include detailed information about the people matching the query.',
        parameters: {
          type: 'object',
          properties: {
            apiKey: {
              type: 'string',
              description: 'The API key to authenticate requests to the Apollo API. Obtain this key from your settings.',
            },
            organizationDomains: {
              type: 'string',
              description: 'The organization domains to search for, joined by a new line character (e.g., "google.com\nfacebook.com").',
            },
            locations: {
              type: 'string',
              description: 'The allowed locations of the person (e.g., "California, US").',
            },
            titles: {
              type: 'string',
              description: 'The person\'s titles to search for (e.g., "sales manager").',
            },
            limit: {
              type: 'integer',
              description: 'The maximum number of results to return (default: 10).',
            },
          },
          required: ['apiKey'],
        },
      },
    },
  ];

  try {
    for (let index = 0; index < total; index++) {
      try {
        messageHistory.push({ role: 'user', content: prompts[index] });
        const chatCompletion = await openai.chat.completions.create({
          messages: messageHistory as unknown as [],
          model,
          tools: tools.map(tool => ({ type: "function", function: tool.function })),
          tool_choice: "auto",
          ...restProperties,
        });

        const assistantResponse = chatCompletion.choices[0].message.content || 'No response.';
        messageHistory.push({ role: 'assistant', content: assistantResponse });

        const toolCalls = chatCompletion.choices[0].message.tool_calls;
        if (toolCalls) {
          for (const toolCall of toolCalls) {
            if (toolCall.function.name === 'searchPeopleUsingApollo') {
              console.log('Tool call arguments:', toolCall.function.arguments);
              const functionArgs = JSON.parse(toolCall.function.arguments);
              functionArgs.apiKey = settings?.[APOLLO_KEY] as string;
              console.log('Parsed function arguments:', functionArgs);
              const { apiKey, organizationDomains, locations, titles, limit } = functionArgs;
              const functionResponse = await searchPeopleUsingApollo(
                apiKey,
                organizationDomains,
                locations,
                titles,
                limit
              );
              messageHistory.push({
                tool_call_id: toolCall.id,
                role: 'function',
                name: 'searchPeopleUsingApollo',
                content: JSON.stringify(functionResponse),
              });
            }
          }
          const secondResponse = await openai.chat.completions.create({
            model: model,
            messages: messageHistory as unknown as [],
            ...restProperties,
          });
          const secondAssistantResponse = secondResponse.choices[0].message.content || 'No response.';
          outputs.push(secondResponse);
          messageHistory.push({ role: 'assistant', content: secondAssistantResponse });
        } else {
          outputs.push(chatCompletion);
        }
      } catch (error) {
        console.error('Error in main loop:', error);
        const completionWithError = mapErrorToCompletion(error, model);
        outputs.push(completionWithError);
      }
    }

    return mapToResponse(outputs, model);
  } catch (error) {
    console.error('Error in main function:', error);
    return { Error: error, ModelType: model };
  }
}

export { main, config };