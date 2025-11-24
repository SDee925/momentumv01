/**
 * Parses and validates the momentum response from the server
 * @param {Object|string} raw - The raw response from the server (object or JSON string)
 * @returns {Object} - Validated momentum response with roast, tasks, and deep_dive_template
 * @throws {Error} - If parsing or validation fails
 */
export const parseMomentumResponse = (raw) => {
  let parsed;

  // If raw is a string, parse it as JSON
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      throw new Error(`Failed to parse response as JSON: ${error.message}`);
    }
  } else if (typeof raw === 'object' && raw !== null) {
    parsed = raw;
  } else {
    throw new Error('Response must be an object or JSON string');
  }

  // Validate the structure
  if (!parsed.roast || typeof parsed.roast !== 'string') {
    throw new Error('Response must contain a "roast" string');
  }

  if (!Array.isArray(parsed.tasks)) {
    throw new Error('Response must contain a "tasks" array');
  }

  if (parsed.tasks.length !== 3) {
    throw new Error(`Expected 3 tasks, but got ${parsed.tasks.length}`);
  }

  // Validate each task
  parsed.tasks.forEach((task, index) => {
    if (!task.title || typeof task.title !== 'string') {
      throw new Error(`Task ${index + 1} must have a "title" string`);
    }
    if (!task.description || typeof task.description !== 'string') {
      throw new Error(`Task ${index + 1} must have a "description" string`);
    }
    if (typeof task.estimated_minutes !== 'number' || task.estimated_minutes <= 0) {
      throw new Error(`Task ${index + 1} must have a positive "estimated_minutes" number`);
    }
  });

  if (!parsed.deep_dive_template || typeof parsed.deep_dive_template !== 'string') {
    throw new Error('Response must contain a "deep_dive_template" string');
  }

  return {
    roast: parsed.roast,
    tasks: parsed.tasks,
    deep_dive_template: parsed.deep_dive_template
  };
};
