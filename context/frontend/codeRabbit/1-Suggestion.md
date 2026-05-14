Verify each finding against current code. Fix only still-valid issues, skip the
rest with a brief reason, keep changes minimal, and validate.

In `@frontend/src/components/layouts/DoctorLayout.jsx` around lines 23 - 41, The
current isActive computation uses strict equality against location.pathname
causing parent sidebar items (in the navigation map) to lose highlight on nested
routes; change the logic that sets isActive (in the navigation.map callback
where isActive is currently computed) to treat paths as a prefix match with a
boundary check (e.g., true when location.pathname === item.href OR when
location.pathname starts with item.href + '/' ) so child routes like
/provider/patients/:patientId keep the Patients item highlighted; alternatively
use react-router-dom's matchPath to test the pathname against item.href to
determine isActive.

Verify each finding against current code. Fix only still-valid issues, skip the
rest with a brief reason, keep changes minimal, and validate.

In `@frontend/src/pages/provider/DoctorReports.jsx` around lines 10 - 16, The UI
currently treats fetch failures as an empty list because useQuery's error state
isn't handled; update the useQuery call in DoctorReports.jsx to also destructure
isError and error (e.g., const { data: reports, refetch, isLoading, isError,
error } = useQuery(...)) and then, in the render path, short-circuit to an error
view/message when isError is true (showing error details or a retry button via
refetch) before checking reports length or rendering the empty-state card so
failures are distinguished from "no pending reports."

Verify each finding against current code. Fix only still-valid issues, skip the
rest with a brief reason, keep changes minimal, and validate.

In `@frontend/src/pages/provider/DoctorReports.jsx` around lines 82 - 84, The
"Contact Patient" Button in DoctorReports.jsx is a dead action; add an actual
handler or disable it until implemented: implement a handler function (e.g.,
handleContactPatient(patientId) or handleContactPatient(row)) inside the
DoctorReports component that opens the contact modal, navigates to a messaging
route, or triggers the appropriate API, then pass it to the Button as
onClick={() => handleContactPatient(patientId)}; alternatively, if the feature
isn't ready, change the Button to disabled and add an explanatory
aria-label/title (e.g., "Contact patient — coming soon") so it doesn't appear
actionable. Ensure you reference the Button element and the new
handleContactPatient function when making the change.

Verify each finding against current code. Fix only still-valid issues, skip the
rest with a brief reason, keep changes minimal, and validate.

In `@frontend/src/pages/provider/PatientDirectory.jsx` at line 74, The avatar
initial access unconditionally calls patient.name.charAt(0) in PatientDirectory
(where patient objects are rendered); update that expression to guard against
null/undefined names (e.g., use optional chaining and a fallback such as
patient?.name?.charAt(0) || '?' or compute a safeInitial from patient.name
before rendering) so the UI does not throw when patient.name is missing; ensure
the change is applied wherever patient.name.charAt(0) appears in the
PatientDirectory render logic.

Verify each finding against current code. Fix only still-valid issues, skip the
rest with a brief reason, keep changes minimal, and validate.

In `@frontend/src/pages/provider/ScribeConsole.jsx` around lines 17 - 24, The
patient fetch isn't being checked before enabling UI/actions; update the
useQuery call for the patient (queryKey ['patient', patientId]) to destructure
and use isSuccess/isLoading/isError flags (e.g., const { data: patient,
isSuccess, isLoading } = useQuery(...)) and then: 1) render the header loading
state based on isLoading/isError instead of just patient, 2) disable or hide
recording/generation controls (the handlers that call
startRecording/generateTranscript or similar) unless isSuccess is true, and 3)
add guards in action handlers to return early if !isSuccess or !patient to
prevent submissions for unresolved patients. Ensure references to patientId, the
patient query, and the startRecording/generate handlers are updated accordingly.

Verify each finding against current code. Fix only still-valid issues, skip the
rest with a brief reason, keep changes minimal, and validate.

In `@frontend/src/pages/provider/ScribeConsole.jsx` around lines 45 - 47, The
axios post call in ScribeConsole.jsx that sends FormData
(api.post('/scribe/upload-audio', formData, { headers: { 'Content-Type':
'multipart/form-data' } })) should not set the Content-Type header manually;
remove the headers object so the browser can auto-generate the
multipart/form-data boundary. Locate the api.post call in ScribeConsole.jsx and
delete the headers option (or pass no third argument) when uploading formData to
'/scribe/upload-audio'.

Verify each finding against current code. Fix only still-valid issues, skip the
rest with a brief reason, keep changes minimal, and validate.

In `@frontend/src/routes/AppRoutes.jsx` around lines 54 - 55, The routes for path
"/provider/visits" and "/provider/visits/:visitId" both render DoctorDashboard,
which likely hides visit details; update routing so the detailed path renders
the correct component (e.g., render VisitDetail or DoctorVisits for the
"/provider/visits/:visitId" Route) or remove the detailed route until a proper
component exists; locate the Route entries that reference DoctorDashboard and
change the element for the "/provider/visits/:visitId" Route to the appropriate
component (VisitDetail/DoctorVisits) and ensure that component accepts the
visitId param (via useParams) to fetch/display the visit.
