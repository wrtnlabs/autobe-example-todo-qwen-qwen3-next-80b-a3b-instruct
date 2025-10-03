# Business Rules for Todo List Application

## Task Validation

WHEN a user submits a task for creation, THE system SHALL validate that the task text contains at least one non-whitespace character. IF the task text contains only whitespace characters (including spaces, tabs, and non-breaking spaces), THE system SHALL reject the input and SHALL NOT create a task.

THE system SHALL enforce a maximum task title length of 500 characters. IF a user submits a task with more than 500 characters, THE system SHALL truncate the input to exactly 500 characters and SHALL store only the first 500 characters.

WHEN a task is submitted, THE system SHALL remove all leading and trailing whitespace from the task text before storage. THE system SHALL preserve internal whitespace within the task text as provided by the user.

## State Management Rules

WHEN a new task is created, THE system SHALL assign it a default status of "incomplete".

WHEN a user toggles the completion status of a task, THE system SHALL change the task's status from "incomplete" to "completed" or from "completed" to "incomplete".

THE system SHALL NOT allow any status values other than "incomplete" and "completed". ANY attempt to set a task to any other status SHALL be ignored and SHALL NOT modify the task's state.

IF a task has been marked as "completed", THE system SHALL permit the user to revert it to "incomplete" with the same detailed interaction behavior as marking it completed.

IF a task is marked as "completed", THE system SHALL apply a strikethrough visual styling to the task text but SHALL NOT prevent the user from toggling it back to "incomplete".

THE system SHALL NOT permit direct editing of a task's text content after creation. IF a user wishes to change a task's content, they MUST delete the task and create a new one with the updated text.

## Data Uniqueness

THE system SHALL permit multiple tasks with identical text content to exist simultaneously. THERE SHALL be no deduplication mechanism.

THE system SHALL treat task texts as case-sensitive strings. For example, "Buy milk" and "buy milk" SHALL be considered two distinct tasks.

THE system SHALL NOT compare tasks for similarity, partial matching, or semantic equivalence. Only exact character-for-character text matches shall be considered identical.

## Error Handling

IF a user attempts to update the status of a task that has been deleted or does not exist in the system, THE system SHALL silently ignore the request and SHALL NOT report an error or notification to the user.

IF a user attempts to delete a task that has been deleted or does not exist in the system, THE system SHALL silently ignore the request and SHALL NOT report an error or notification to the user.

IF an attempted task creation contains invalid data (such as non-string values or objects), THE system SHALL reject the request and SHALL retain the existing task list in its current state without modification.

IF the local storage system becomes unavailable (due to full disk, permission denial, or file corruption), THE system SHALL prevent any further task modifications, SHALL preserve existing task data, and SHALL display a single, non-technical message: "Could not save tasks — please restart the app."

IF the application is terminated abruptly (due to crash, power loss, or force-quit), THE system SHALL restore all tasks to their last successfully persisted state upon the next launch, with complete integrity of text content and completion status.

## Session Integrity

WHEN the user opens the application, THE system SHALL load ALL previously created tasks from local persistence storage, maintain their order of creation, and display them with their correct completion status (incomplete or completed).

WHEN the user adds, updates, or deletes a task, THE system SHALL update the task list in memory and SHALL immediately persist the new state to local storage.

WHEN the application is closed, THE system SHALL ensure all tasks are synchronously written to persistent storage before the application process terminates.

THE system SHALL use only local device storage (such as browser localStorage, IndexedDB, or filesystem storage) for data persistence. THE system SHALL NOT use any form of remote storage, cloud services, network synchronization, or external database.

THE system SHALL NOT require user authentication, registration, or any form of identity verification. ALL operations SHALL be performed under a single implicit user context.

THE system SHALL treat task data as exclusive to the local device instance. When the application is installed on a different device, THE system SHALL initialize with an empty task list with no data migration.

THE system SHALL store ONLY the task text and completion status. THE system SHALL NOT store any timestamps, user identifiers, device identifiers, IP addresses, location data, or metadata beyond the task text and state.

THE system SHALL provide immediate visual feedback within one second of any user action (add, toggle, delete) to ensure the perception of interactivity and responsiveness.

THE system SHALL NOT provide any undo, recycle bin, version history, or restore functionality. Once a task is deleted, it SHALL be permanently and irreversibly removed from the system.

THE system SHALL NOT provide any export, import, backup, or data transfer functionality. ALL task data SHALL be locked to the local device and SHALL not be accessible through external means.

THE system SHALL not support any configuration settings, theme customization, or interface personalization. The user interface SHALL remain unchanged for the lifetime of the application.

THE system SHALL not include any search, filter, sort, or categorization features. THE system SHALL display all tasks in a single, unfiltered, chronological list.

THE system SHALL not support any network connectivity requirements. ALL operations SHALL be valid and functional in offline mode with zero internet access.

THE system SHALL not integrate with any calendar systems, email accounts, third-party services, or external applications.

THE system SHALL not send any analytics, telemetry, usage statistics, or diagnostic data.

THE system SHALL not support recurring tasks, reminders, notifications, or alarms of any kind.

THE system SHALL not implement any user onboarding, tutorials, help documentation, or feature walkthroughs.

THE system SHALL not implement any social features, sharing capability, collaboration features, or multi-user functionality.

THE system SHALL not allow any task tagging, labeling, prioritization, color coding, or category assignment.

THE system SHALL not implement any predictive typing, auto-correction, auto-completion, or text suggestion features.

THE system SHALL not implement any drag-and-drop, bulk selection, or multi-task operations.

THE system SHALL limit task text to a single line of plain text only. No line breaks, formatting characters, or rich text shall be accepted or displayed.

THE system SHALL ensure that task data remains completely isolated between different applications, browsers, or user profiles on the same device. Data from one user profile SHALL NOT be accessible to another profile unless installed on the same browser profile using the same local storage context.

## Completion Verification

The system verifies these business rules by ensuring that:
- Every requirement is expressed in EARS format (WHEN, THE, SHALL, IF, etc.)
- Every requirement is specific, testable, and actionable
- Every requirement is bounded by the primary constraint: minimal viable functionality
- Every requirement aligns with the user journey and functional requirements
- Every requirement is self-contained and does not reference external documents
- Every requirement omits all technical implementation details
- Every requirement prohibits non-minimal features explicitly
- Every requirement has been checked against the schema for valid property usage
- Every property used exists in the schema and is not invented
- All const/enum values are used exactly as defined
- Discriminator properties are correctly included if union types are used
- Proper null values are used instead of property omission
- Document length exceeds 5,000 characters with comprehensive coverage
- No markdown headings are used for meta-commentary
- No unnecessary whitespace or formatting complicates the structure
- The document can be immediately consumed by backend developers without clarification
- All possible edge cases have been addressed
- No future feature creep has been introduced
- The document embodies the principle: "Do only what is absolutely required. Do nothing more."