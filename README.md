# OpenAI Connector with Apollo API Function Calling

This connector for Prompt Mixer allows you to access the OpenAI API and the Apollo API from within Prompt Mixer. 

## Features

- Connect to the OpenAI API and use various models to generate text, code, and more.
- Integrate with the Apollo API to search for contacts and retrieve detailed information.
- Pass prompts and settings to the OpenAI API with just a few clicks.
- Output is displayed directly in Prompt Mixer.
- Test OpenAI functions to ensure they work as expected.
- Includes a testing function that simulates a database request returning a user list from the database.

## Installation

To install:

1. In Prompt Mixer, go to **Connectors > All Connectors**.
2. Find the OpenAI Connector with Apollo API Function Calling and click **Install**.
3. Go to **Connectors > Installed > OpenAI with Apollo API Function Calling** to configure your API keys.

## Usage

After installing and configuring your API keys, you can start using any OpenAI model and the Apollo API through the assistant panel in Prompt Mixer.

### Function Calling

During an API call, you can specify functions which the model will use to intelligently generate a JSON object. This object contains the necessary arguments for calling one or several functions. Note that the Chat Completions API will not execute these functions; it merely creates the JSON for you to use in your function calls within your own code.

For more details on how this works, consult the OpenAI documentation: [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)

To test your functions, please fork this repository, then add and describe your functions.

### Apollo API Integration

The Apollo API allows you to search for contacts and retrieve detailed information. For more information, check the Apollo API documentation: [Apollo People API](https://apolloio.github.io/apollo-api-docs/?shell#people-api)

## Step-by-Step Instructions

### Configuring API Keys

1. Open Prompt Mixer and navigate to **Connectors > Installed > OpenAI with Apollo API Function Calling**.
2. Enter your OpenAI API key and Apollo API key in the respective fields.
3. Click **Save** to apply the changes.

### Using the Connector

1. Open the assistant panel in Prompt Mixer.
2. Select the OpenAI model you wish to use.
3. Enter your prompt and any necessary settings.
4. If using Apollo API functions, specify the required parameters.
5. Click **Run** to execute the API call and view the output.

## Troubleshooting and FAQs

### Common Issues

- **Invalid API Key**: Ensure that you have entered the correct API keys for both OpenAI and Apollo.
- **Function Not Found**: Verify that the function name and parameters are correct.

### Frequently Asked Questions

1. **How do I get my OpenAI API key?**
   - Visit the OpenAI website and sign in to your account. Navigate to the API section to generate and copy your API key.

2. **How do I get my Apollo API key?**
   - Visit the Apollo website and sign in to your account. Navigate to the API section to generate and copy your API key.

3. **Can I use both OpenAI and Apollo APIs simultaneously?**
   - Yes, you can use both APIs simultaneously by specifying the functions and parameters for each API in your prompts.

## Contributing

Pull requests and issues are welcome! Let me know if you have any problems using the connector or ideas for improvements.

For guidance on building your own connector, refer to this documentation: [Prompt Mixer Custom Connector](https://docs.promptmixer.dev/tutorial-extras/create-a-custom-connector)

## License

MIT
