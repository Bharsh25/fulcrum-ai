import "dotenv/config";

const getOpenAIResponse = async (message) => {
    const options={
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-5-mini",
            messages: [{role: "user", content: message}],
    })
};

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", options);
        const data = await response.json();
        return data.choices[0].message.content;
    }catch (error) {
        console.error('Error:', error);
        return { error: 'An error occurred' };
    }
}

export default getOpenAIResponse;