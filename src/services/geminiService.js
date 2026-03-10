export const chatWithKnowledgeBase = async (userMessage, knowledgeBaseContent, conversationHistory = []) => {
    try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMessage,
                knowledgeBase: knowledgeBaseContent,
                history: conversationHistory
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch from chat API');
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error("Chat API Error:", error);
        throw error;
    }
};

/**
 * Generate 3 clarifying questions based on user feedback and knowledge base content
 */
export const generateClarifyingQuestions = async (feedback, knowledgeBaseContent) => {
    try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/api/feedback/questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                feedback,
                knowledgeBase: knowledgeBaseContent
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate questions');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Generate Questions API Error:", error);
        throw error;
    }
};

/**
 * Summarize feedback and answers into a clear proposal
 */
export const summarizeFeedback = async (feedback, questions, answers, knowledgeBaseContent) => {
    try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/api/feedback/summarize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                feedback,
                questions,
                answers,
                knowledgeBase: knowledgeBaseContent
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to summarize feedback');
        }

        const data = await response.json();
        return data.summary;
    } catch (error) {
        console.error("Summarize Feedback API Error:", error);
        throw error;
    }
};

/**
 * Add feedback to the queue for later application
 */
export const applyFeedbackToQueue = async (feedbackItem) => {
    try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/api/feedback/queue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(feedbackItem)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to queue feedback');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Queue Feedback API Error:", error);
        throw error;
    }
};

/**
 * Get all pending feedback items from the queue
 */
export const getFeedbackQueue = async () => {
    try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/api/feedback/queue`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get feedback queue');
        }

        const data = await response.json();
        return data.queue;
    } catch (error) {
        console.error("Get Feedback Queue API Error:", error);
        throw error;
    }
};

/**
 * Apply a specific feedback item to update the knowledge base
 */
export const applyFeedbackToKnowledgeBase = async (feedbackId) => {
    try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/api/feedback/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feedbackId })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to apply feedback');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Apply Feedback API Error:", error);
        throw error;
    }
};
