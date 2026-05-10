# Chapter 6: Testing

## Testing Methodologies

### 6.1 Unit Testing
-   **Approach**: Individual components and functions were tested in isolation to ensure they behave as expected.
-   **Examples**:
    -   Testing utility functions like temperature converters or string formatters.
    -   Verifying that state update functions in the Zustand store set the correct values.

### 6.2 Integration Testing
-   **Approach**: Verifying that different modules and services work together correctly.
-   **Examples**:
    -   Ensuring the frontend successfully calls the backend API endpoints and processes the returned data.
    -   Verifying that the Voice Assistant correctly triggers API calls and handles both text and speech outputs.
    -   Checking CORS configurations between the deployed frontend and backend.

### 6.3 System Testing
-   **Approach**: Testing the complete application as a whole against the functional requirements.
-   **Examples**:
    -   Performing a full workflow: Searching for a city -> Viewing current weather -> Opening the AI chat -> Asking a question -> Verifying the answer is relevant.
    -   Testing the site's responsiveness on mobile devices vs. large desktop monitors.

### 6.4 Testing Tools Used
-   **Browser Developer Tools**: Used extensively for debugging console logs, inspecting network requests (XHR/Fetch), and checking CSS layouts.
-   **Postman**: Used to test backend API endpoints independently before integrating them with the frontend.
-   **Manual Testing**: Continuous manual validation of UI interactions, animations, and voice recognition capabilities during development.
