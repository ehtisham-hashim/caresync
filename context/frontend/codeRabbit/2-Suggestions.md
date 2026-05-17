Verify each finding against current code. Fix only still-valid issues, skip the
rest with a brief reason, keep changes minimal, and validate.

In `@backend/src/routes/chatRoutes.js` at line 14, Add request validation for the
/translate route: use the existing validate middleware with a translate schema
(e.g., translateSchema or TranslateRequestSchema) before invoking
translateContent so malformed/oversized payloads are rejected early; update the
route declaration that currently reads router.post('/translate', aiLimiter,
translateContent) to include validate(translateSchema) (and create/extend
translateSchema in your validation schemas if it doesn't exist) and ensure
validate runs before aiLimiter and translateContent.

Verify each finding against current code. Fix only still-valid issues, skip the
rest with a brief reason, keep changes minimal, and validate.

In `@backend/src/services/aiService.js` around lines 311 - 316, The code currently
returns any parseable JSON from JSON.parse(response.text()) without schema
checks; update the try block to parse the response and then validate the
resulting object against the expected structure (check required keys and types)
before returning it. If validation fails, log a clear error via logger.error
including validation details and throw an ApiError(500, 'Translation formatting
failed', ERROR_CODES.AI_SERVICE_ERROR) as currently used; keep the existing
catch for parse errors but ensure validation failures produce the same error
path. Use the same symbols present (JSON.parse(response.text()), logger,
ApiError, ERROR_CODES) to locate and implement the validation.

Verify each finding against current code. Fix only still-valid issues, skip the
rest with a brief reason, keep changes minimal, and validate.

In `@frontend/src/pages/PatientVisitsPage.jsx` around lines 143 - 146, The
prescription mapping currently sends visitDetail?.prescriptions (prescriptions,
simplifiedInstructions) into the LLM and later trusts returned IDs to
re-associate translations; instead, preserve a stable mapping key that you
control (e.g., include original rx.id as a separate metadata field like
originalId or index along with simplifiedInstructions in prescriptions) and when
consuming the translated payload map translations back using that originalId or
the array index (not the model-returned id). Update the code that builds
prescriptions (where prescriptions: visitDetail?.prescriptions?.map(...)) to
attach originalId, and change the consumer/lookup logic (the translation result
handling referenced around lines 455–459) to use originalId or array position to
reattach translated simplifiedInstructions to the correct medication rather than
trusting IDs returned by the LLM.

Verify each finding against current code. Fix only still-valid issues, skip the
rest with a brief reason, keep changes minimal, and validate.

In `@frontend/src/pages/provider/PatientDirectory.jsx` at line 109, The frequency
field is being polluted by appended clock text (frequency: `${frequency}
${timeDetailStr}`), which breaks backend digit-based dose inference; instead
stop concatenating timeDetailStr into frequency — keep frequency as the
canonical schedule string (e.g., "2x/day" or "once daily") and move any clock
text into a separate property (e.g., timeDetail or doseTime) on the same
payload/object; update usages of frequency and any consumer code to read the new
timeDetail field where the clock string is needed so schedule generation and
backend parsing remain correct.

Verify each finding against current code. Fix only still-valid issues, skip the
rest with a brief reason, keep changes minimal, and validate.

In `@frontend/src/pages/provider/ScribeConsole.jsx` around lines 42 - 76, The
useEffect that creates the SpeechRecognition instance (variable rec) needs a
cleanup return to stop and detach the recognition when the component unmounts;
update the effect that calls setRecognitionInstance to return a function that
checks the current recognition instance (use the local rec and/or recognition
state set by setRecognitionInstance) and if present calls rec.stop() and/or
rec.abort(), removes/dereferences handlers (e.g., rec.onresult = null;
rec.onerror = null) and clears recognition state via
setRecognitionInstance(null) to prevent further callbacks to unmounted component
and keep the microphone off.

Verify each finding against current code. Fix only still-valid issues, skip the
rest with a brief reason, keep changes minimal, and validate.

In `@frontend/src/pages/provider/ScribeConsole.jsx` around lines 78 - 97, The
useEffect that toggles recognitionInstance on status changes can still call
start()/stop() when the recognizer is already in the target state; add a small
manual state flag (e.g., recognitionRunning or isRecognitionActive) tracked
alongside recognitionInstance and updated in the recognizer event handlers
(onstart/onend/onerror) and when you successfully start/stop, then change the
effect to check that flag before calling recognitionInstance.start() or
recognitionInstance.stop(); update references to status, recognitionInstance,
setLiveCaptions and setInterimCaption to use this guard so you avoid redundant
start/stop calls and race conditions.
