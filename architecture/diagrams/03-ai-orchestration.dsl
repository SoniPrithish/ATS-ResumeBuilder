@direction TB
@spacing 50

(Incoming AI Request) -> [Check Redis Cache]
[Check Redis Cache] -> {Cache Hit?}
{Cache Hit?} -> "yes" -> (Return Cached Result)
{Cache Hit?} -> "no" -> [Load Prompt Template]
[Load Prompt Template] -> [Estimate Token Count]
[Estimate Token Count] -> {Within Budget?}
{Within Budget?} -> "no" -> (Reject - Over Budget)
{Within Budget?} -> "yes" -> [Route to LLM Provider]
[Route to LLM Provider] -> {Task Complexity?}
{Task Complexity?} -> "simple" -> [Rules Engine - No LLM]
{Task Complexity?} -> "medium" -> [Groq Llama 3.3 Free]
{Task Complexity?} -> "complex" -> [Gemini 2.0 Flash Free]
[Rules Engine - No LLM] -> [Validate Output Schema]
[Groq Llama 3.3 Free] -> [Validate Output Schema]
[Gemini 2.0 Flash Free] -> [Validate Output Schema]
[Validate Output Schema] -> {Valid?}
{Valid?} -> "yes" -> [Cache Result in Redis]
{Valid?} -> "no" -> [Retry with Stricter Prompt]
[Cache Result in Redis] -> (Stream Response to Client)
[Retry with Stricter Prompt] -> [Validate Output Schema]
