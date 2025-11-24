/**
 * Builds a deep dive prompt for breaking down a task into smaller steps
 * @param {Object} task - The task object with title, description, and estimated_minutes
 * @returns {string} - Prompt for the AI to break down the task
 */
export const buildDeepDivePrompt = (task) => {
  if (!task || !task.title) {
    throw new Error('Task must have a title');
  }

  return `Break down this task into detailed, actionable steps:

Task: ${task.title}
Description: ${task.description || 'No description provided'}
Estimated Time: ${task.estimated_minutes || 'Unknown'} minutes

Please provide a JSON response with the following structure:
{
  "steps": [
    {
      "step_number": 1,
      "title": "Step title",
      "description": "What to do in this step",
      "estimated_minutes": 5
    }
  ]
}

Make the steps concrete and specific. Each step should be completable within 5-15 minutes.`;
};
