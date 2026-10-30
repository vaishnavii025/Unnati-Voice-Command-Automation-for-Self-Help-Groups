const asyncHandler = require('../utils/asyncHandler');

const {
  transcribeAudio,
  synthesizeSpeech,
  respondToAssistant,
} = require('../services/geminiSpeechService');


function handleSpeechError(res, error, operation) {
  const providerError =
    error?.providerError ||
    error?.response?.data?.error ||
    error?.cause ||
    error;

  if (providerError?.code === 429) {
    return res.status(503).json({
      message:
        'Gemini request limit reached. Please wait a moment and try again.',
    });
  }

  if (providerError?.code === 503) {
    return res.status(503).json({
      message:
        'Gemini is temporarily busy. Please try again in a moment.',
    });
  }

  console.error(
    `Speech ${operation} error:`,
    error
  );

  return res.status(502).json({
    message:
      'Gemini speech processing is temporarily unavailable',
  });
}


/*
 * Transcribe audio
 */
exports.transcribe = asyncHandler(
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        message: 'Audio recording is required',
      });
    }

    if (
      !['en', 'hi', 'mr'].includes(
        req.body.language
      )
    ) {
      return res.status(400).json({
        message: 'Unsupported speech language',
      });
    }

    try {
      const result =
        await transcribeAudio({
          audio: req.file.buffer,
          mimeType:
            req.file.mimetype.split(';')[0],
          language: req.body.language,
        });

      return res.json(result);
    } catch (error) {
      return handleSpeechError(
        res,
        error,
        'transcription'
      );
    }
  }
);


/*
 * Synthesize speech
 */
exports.synthesize = asyncHandler(
  async (req, res) => {
    const {
      text,
      language,
    } = req.body;

    if (
      typeof text !== 'string' ||
      !text.trim() ||
      text.length > 5000
    ) {
      return res.status(400).json({
        message:
          'Speech text must contain 1 to 5000 characters',
      });
    }

    if (
      !['en', 'hi', 'mr'].includes(
        language
      )
    ) {
      return res.status(400).json({
        message: 'Unsupported speech language',
      });
    }

    try {
      const result =
        await synthesizeSpeech({
          text: text.trim(),
          language,
        });

      return res.json(result);
    } catch (error) {
      return handleSpeechError(
        res,
        error,
        'synthesis'
      );
    }
  }
);


/*
 * AI Assistant response
 */
exports.assistant = asyncHandler(
  async (req, res) => {
    const {
      text,
      language,
      modules,
      history,
    } = req.body;

    if (
      typeof text !== 'string' ||
      !text.trim() ||
      text.length > 5000
    ) {
      return res.status(400).json({
        message:
          'Assistant text must contain 1 to 5000 characters',
      });
    }

    if (
      !['en', 'hi', 'mr'].includes(
        language
      )
    ) {
      return res.status(400).json({
        message:
          'Unsupported assistant language',
      });
    }

    try {
      const result =
        await respondToAssistant({
          text: text.trim(),
          language,
          role: req.user?.role,
          modules: Array.isArray(modules)
            ? modules
            : [],
          history: Array.isArray(history)
            ? history
            : [],
        });

      return res.json(result);
    } catch (error) {
      return handleSpeechError(
        res,
        error,
        'assistant response'
      );
    }
  }
);