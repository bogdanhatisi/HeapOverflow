# HeapOverflow
# Table of Contents

- [Overview](#overview)
- [Installation Guide](#installation-guide)
- [Features](#features)
- [Why Monolithic Architecture?](#why-monolithic-architecture)
- [API Versioning](#api-versioning)
- [Authentication](#authentication)
- [Real-Time Notifications](#real-time-notifications)
- [Caching](#caching)
- [Scalability](#scalability)
- [API Endpoints](#api-endpoints)
  - [1. Post a Question](#1-post-a-question)
  - [2. Get All User Questions](#2-get-all-user-questions)
  - [3. Create Answer](#3-create-answer)
  - [4. Upvote Post](#4-upvote-post)
  - [5. Downvote Post](#5-downvote-post)
  - [6. Get Question Details](#6-get-question-details)
  - [7. Get Stats](#7-get-stats)
  - [8. Get All Questions](#8-get-all-questions)
  - [9. Check API v1](#9-check-api-v1)
  - [10. Check API v2](#10-check-api-v2)
- [Future Improvements](#future-improvements)


## Overview

HeapOverflow is a backend for StackOverflow inspired platform where users can ask questions, respond with answers, and engage via upvotes and downvotes. This project focuses on backend functionality, providing a robust API for a seamless user experience without a front-end interface. The design mirrors the proven monolithic architecture of Stack Overflow, chosen to simplify development and scalability in this PoC (Proof Of Concept) stage.

### Installation Guide

To get HeapOverflow up and running quickly, follow these steps to run the Docker container:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/bogdanhatisi/HeapOverflow/
   cd heapoverflow
    ```
2. **Build and run the Docker Container:**
  ```bash
  docker-compose up --build
  ```

## Features

- **Question & Answer Functionality:** Users can pose questions and provide answers.
- **Voting System:** Both questions and answers can be upvoted or downvoted to signify relevance and accuracy.
- **Authentication Required:** Posting questions or answers requires user authentication to ensure accountability.
- **Real-Time Updates:** Real-time updates for question, answer, and vote modifications can be pushed to clients.
- **Scalable Architecture:** Designed to dynamically scale with user activity levels.

## Why Monolithic Architecture?

For this PoC (Proof Of Concept), a monolithic architecture is employed, reflecting the successful structure used by Stack Overflow. This architecture was chosen for several reasons:

- **Simplicity:** Monolithic applications are simpler to develop and deploy, especially when starting new projects. It allows for faster, more cohesive development cycles without the complexity of managing multiple services.
- **Performance:** As all components run within the same process, communication between various parts of the application is fast and straightforward, which is crucial for real-time features.
- **Reliability:** Fewer moving parts mean fewer points of failure, which enhances the overall reliability of the application during the initial deployment phases.
- **Scalability:** Despite common beliefs, monoliths can be scaled efficiently, especially when deployed on modern cloud platforms that support automatic scaling and load balancing.

## API Versioning

To ensure the API remains backward compatible and adaptable to future changes, we implement versioning:

- **Version Format:** Our API versions are number based, for example, `v2`.
- **Deprecation Strategy:** Older versions are supported for 12 months after a new version is released, with plenty of notice given to developers about deprecations and upgrades.

## Authentication

HeapOverflow supports two main authentication methods: JWT (JSON Web Tokens) and OAuth with Google. Both methods ensure secure access to protected endpoints, but they cater to different use cases and preferences.

### Google OAuth Authentication

Google OAuth authentication is implemented in the `oauth-google` branch. It leverages Google's OAuth 2.0 to authenticate users, providing a seamless login experience with their Google accounts.

**Workflow:**
1. **User Initiates Login:** The user initiates the login process by clicking a "Login with Google" button.
2. **Redirect to Google:** The application redirects the user to Google's OAuth 2.0 server.
3. **Google Authentication:** The user authenticates with Google, granting the application permission to access their basic profile information and email.
4. **Callback Handling:** After authentication, Google redirects the user back to the application with an authorization code.
5. **Token Exchange:** The application exchanges the authorization code for an access token.
6. **User Information Retrieval:** The application uses the access token to retrieve the user's profile information from Google.
7. **User Session Creation:** The application creates a session for the user and logs them in.

**Implementation Details:**
- **Passport.js:** Passport.js, a popular authentication middleware for Node.js, is used to handle the OAuth 2.0 flow.
- **Google Strategy:** The `passport-google-oauth20` strategy is configured with client ID, client secret, and callback URL.
- **User Management:** Upon successful authentication, the user's profile information is retrieved from Google. If the user does not already exist in the database, a new user record is created. If the user exists, their session is updated.

**Endpoints for Google OAuth Authentication:**

**1. Initiate Google Login**
- **Endpoint:** `/api/v1/users/google`
- **Method:** `GET`
- **Description:** Redirects the user to Google's OAuth 2.0 server for authentication.
- **Response:** Redirects to Google for user authentication.

**2. Google OAuth Callback**
- **Endpoint:** `/api/v1/users/google/callback`
- **Method:** `GET`
- **Description:** Handles the callback from Google's OAuth 2.0 server. This endpoint is where Google redirects the user after authentication, along with an authorization code.
- **Response:** If authentication is successful, the user is logged in and redirected to the user questions page. If authentication fails, the user is redirected to the login page.


### JWT Authentication

JWT (JSON Web Tokens) authentication is implemented in the `main` branch. It uses JSON Web Tokens to secure endpoints and ensure that only authenticated users can perform certain actions.

**Workflow:**
1. **User Registration:** The user registers and provides necessary information such as username, email, and password.
2. **User Login:** The user logs in using their credentials. Upon successful authentication, the server issues a JWT.
3. **Token Usage:** The JWT is included in the `Authorization` header of subsequent requests to access protected routes.
4. **Token Verification:** The server verifies the token on each request to ensure it is valid.

**Routes for User Registration and Login:**

**1. User Registration**
- **Endpoint:** `/api/v1/users/register`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "displayName": "Bogdan Hatisi",
    "emailAddress": "bogdan@example.com",
    "password": "Password12356@",
    "aboutMe": "I am a test user.",
    "location": "Test City"
  }
  ```
- **Response:**
  ```json
  {
    "id": 3,
    "display_name": "Bogdan Hatisi",
    "email_address": "bogdan@example.com",
    "password": "$2a$10$cFaK6Ab3auwuVv6WnMW3CePZBRpechxS3TktCVrdX3.hfs4nBrdcC",
    "about_me": "I am a test user.",
    "location": "Test City",
    "created_date": "2024-07-16T14:19:59.411Z"
  }
  ```

**2. User Registration**
- **Endpoint:** `/api/v1/users/login`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "emailAddress": "bogdan@example.com",
    "password": "Password12356@"
  }
  ```
- **Response:**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcyMTEzNDUyOSwiZXhwIjoxNzIxMjIwOTI5fQ.mLpyA96TvTGG6kHeTohgPlZ1TcyXw-LxUVwC5BONqN4"
  }
  ```


### Real-Time Notifications

HeapOverflow implements real-time notifications using WebSockets to enhance user engagement and ensure timely updates. This feature allows the server to push updates to connected clients instantly, ensuring that users receive immediate feedback on actions such as new votes, answers, and questions.

**Implementation:**
- **WebSocket Server:** A WebSocket server is set up alongside the HTTP server. This server listens for new connections and manages communication with connected clients.
- **Broadcast Function:** A broadcast function is used to send messages to all connected clients. This function ensures that any significant event, such as a new vote, answer, or question, is immediately communicated to all active users.

**Workflow:**
1. **Client Connection:** When a client connects to the WebSocket server, a connection is established, and the server logs the new connection.
2. **Event Handling:** Events such as new votes, answers, or questions trigger the broadcast function. This function sends a message containing the event details to all connected clients.
3. **Client Notification:** Connected clients receive the message and can update their user interface in real-time to reflect the latest information.

**Example Usage:**
- **Upvoting and Downvoting Posts:** When a user upvotes or downvotes a post, the server broadcasts the updated vote count to all connected clients.
- **Posting Answers:** When a new answer is posted, the server broadcasts the new answer details to all connected clients.
- **Posting Questions:** When a new question is posted, the server broadcasts the new question details to all connected clients.

**Example Client:**
An example client can connect to the WebSocket server and log received messages. This client can be run using the provided script `npm run client` to demonstrate real-time updates.



### Caching

To enhance performance and reduce the load on the database, HeapOverflow implements caching using Redis. Caching frequently accessed data helps to deliver faster responses to the users and improves overall application efficiency.

**Middleware:**
The caching middleware intercepts requests and checks if the data is already present in the Redis cache. If it is, the cached data is returned immediately, bypassing the database. If the data is not in the cache, the request proceeds to the controller, retrieves the data from the database, and then stores it in the cache for future requests.

**Usage:**
- **User-Specific Data:** Caches data such as the questions posted by a specific user.
- **Question Details:** Caches detailed data about specific questions, including answers and votes.
- **Questions Feed:** Caches the paginated list of questions to quickly serve the questions feed.

**Cache Invalidation:**
When data is modified, such as when a new question or answer is posted, the relevant cache entries are invalidated to ensure users receive the most current information. This includes invalidating caches for user-specific questions, basic statistics, and the questions feed.


### Scalability

HeapOverflow is designed to scale dynamically based on user activity. Given that the application is dockerized, it can leverage AWS services such as Amazon ECS (Elastic Container Service) or EKS (Elastic Kubernetes Service) for container orchestration. By using AWS Auto Scaling, the application can automatically adjust the number of running containers in response to traffic loads, ensuring efficient resource utilization and maintaining performance. Elastic Load Balancing (ELB) distributes incoming traffic across multiple containers to enhance availability and reliability. This approach allows HeapOverflow to efficiently handle spikes in usage and reduce costs during low-activity periods.


## API Endpoints

### 1. Post a Question
- **Endpoint:** `/api/v1/questions`
- **Method:** POST
- **Auth Required:** Yes
- **Request:**
  - **Headers:**
    - Authorization: Bearer `<token>`
- **Request Body:**
    ```json
  {
      "postTitle": "How to make an LLM?",
      "postDetails": "I want to develop ChatGpt 2",
      "postTypeId": 1
  }
   ```

- **Response:**
  ```json
  {
    "id": 4,
    "created_by_user_id": 1,
    "parent_question_id": null,
    "post_type_id": 1,
    "post_title": "How to make an LLM?",
    "post_details": "I want to develop ChatGpt 2",
    "created_date": "2024-07-16T13:32:51.976Z",
    "accepted_answer_id": null
  }
  ```
### 2. Get All User Questions
- **Endpoint:** `/api/v1/questions/user-questions`
- **Method:** `GET`
- **Auth Required:** Yes
- **Request:**
  - **Headers:**
    - Authorization: Bearer `<token>`
- **Response:**
  ```json
  [
    {
      "id": 4,
      "post_title": "How to make an LLM?",
      "post_details": "I want to develop ChatGpt 2",
      "created_date": "2024-07-16T13:32:51.976Z",
      "votes": 10,
      "answers_count": 2
    }
  ]
  ```
### 3. Create Answer
- **Endpoint:** `/api/v1/questions/create-answer`
- **Method:** `POST`
- **Auth Required:** Yes
- **Request:**
  - **Headers:**
    - Authorization: Bearer `<token>`
- **Request Body:**
    ```json
  {
      "postDetails": "You should start by understanding transformers.",
      "parentQuestionId":1
  }

  ```
- **Response:**
  ```json
  
  {
    "id": 5,
    "created_by_user_id": 1,
    "parent_question_id": 1,
    "post_type_id": 2,
    "post_title": null,
    "post_details": "You should start by understanding transformers.",
    "created_date": "2024-07-16T13:42:27.572Z",
    "accepted_answer_id": null
  }
  
  ```
  ### 4. Upvote Post
- **Endpoint:** `/api/v1/votes/upvote`
- **Method:** `POST`
- **Auth Required:** Yes
- **Request:**
  - **Headers:**
    - Authorization: Bearer `<token>`
- **Request Body:**
    ```json
  {
    "postId": 2
  }
    ```
- **Response:**
  ```json
  
  {
    "id": 2,
    "post_id": 2,
    "vote_type_id": 1,
    "user_id": 1,
    "created_date": "2024-07-16T13:50:14.921Z"
  }
  
  ```
- **If called again with the same parameter(remove vote)**
- **Response:**
  ```json
  
  {
    "message": "Vote removed"
  }
  
  ```
  ### 5. Downvote Post
- **Endpoint:** `/api/v1/votes/downvote`
- **Method:** `POST`
- **Auth Required:** Yes
- **Request:**
  - **Headers:**
    - Authorization: Bearer `<token>`
- **Request Body:**
    ```json
  {
    "postId": 3
  }
    ```
- **Response:**
  ```json
  
  {
    "id": 2,
    "post_id": 3,
    "vote_type_id": 2,
    "user_id": 1,
    "created_date": "2024-07-16T13:51:14.921Z"
  }
  
  ```
- **If called again with the same parameter(remove vote)**
- **Response:**
  ```json
  
  {
    "message": "Vote removed"
  }
  
  ```
### 6. Get Question Details
- **Endpoint:** `/api/v1/questions/details/{questionId}`
- **Method:** `GET`
- **Auth Required:** Yes
- **Request:**
  - **Headers:**
    - Authorization: Bearer `<token>`
- **Response:**
  ```json
  {
  "question": {
    "id": 4,
    "created_by_user_id": 1,
    "parent_question_id": null,
    "post_type_id": 1,
    "post_title": "How to make an LLM?",
    "post_details": "I want to develop ChatGpt 2",
    "created_date": "2024-07-16T13:32:51.976Z",
    "accepted_answer_id": null,
    "children": [
      {
        "id": 6,
        "created_by_user_id": 1,
        "parent_question_id": 4,
        "post_type_id": 2,
        "post_title": null,
        "post_details": "You should start by understanding transformers.",
        "created_date": "2024-07-16T13:57:03.280Z",
        "accepted_answer_id": null
      }
    ],
    "votes": []
  },
  "answers": [
    {
      "id": 6,
      "created_by_user_id": 1,
      "parent_question_id": 4,
      "post_type_id": 2,
      "post_title": null,
      "post_details": "You should start by understanding transformers.",
      "created_date": "2024-07-16T13:57:03.280Z",
      "accepted_answer_id": null
    }
  ],
  "upvotes": 0,
  "downvotes": 0
  }
  ```

### 7. Get Stats
- **Endpoint:** `/api/v1/stats/basic`
- **Method:** `GET`
- **Auth Required:** Yes
- **Request:**
  - **Headers:**
    - Authorization: Bearer `<token>`
- **Response:**
  ```json
  {
    "popularDay": {
        "day": "Tuesday",
        "count": 6
    },
    "averageMetrics": {
        "average_votes": 0.5,
        "average_questions": 1.5,
        "average_answers": 1.5
    },
    "totalMetrics": {
        "total_questions": 3,
        "total_answers": 3,
        "total_votes": 1
    }
  }
  ```
  
### 8. Get All Questions
- **Endpoint:** `/api/v1/questions/feed`
- **Method:** `GET`
- **Auth Required:** Yes
- **Request:**
  - **Headers:**
    - Authorization: Bearer `<token>`
  - **Query Parameters:**
    - `page`: The page number (e.g., `1`)
    - `pageSize`: The number of questions per page (e.g., `10`)
- **Response:**
  ```json
  {
    "totalQuestions": 3,
    "totalPages": 1,
    "currentPage": 1,
    "pageSize": 10,
    "questions": [
        {
            "id": 1,
            "post_title": "How to invalidate cache second time?",
            "post_details": "How do I check if the WebSocket is up?.",
            "created_date": "2024-07-16T12:55:37.367Z",
            "upvotes": 0,
            "downvotes": 0,
            "answersCount": 2,
            "popularityScore": 2
        },
        {
            "id": 4,
            "post_title": "How to make an LLM?",
            "post_details": "I want to develop ChatGpt 2",
            "created_date": "2024-07-16T13:32:51.976Z",
            "upvotes": 0,
            "downvotes": 0,
            "answersCount": 1,
            "popularityScore": 1
        },
        {
            "id": 3,
            "post_title": "How to invalidate cache second time from OAUTH?",
            "post_details": "How do I check if the WebSocket is up?.",
            "created_date": "2024-07-16T13:01:51.191Z",
            "upvotes": 0,
            "downvotes": 0,
            "answersCount": 0,
            "popularityScore": 0
        }
    ]
  }
  ```

### 9. Check API v1
- **Endpoint:** `/api/v1/`
- **Method:** `GET`
- **Auth Required:** No
- **Response:**
  ```json
  {
    "message": "Welcome to the API V1"
  }
  ```
### 10. Check API v2
- **Endpoint:** `/api/v2/`
- **Method:** `GET`
- **Auth Required:** No
- **Response:**
  ```json
  {
    "message": "Welcome to the API V2"
  }
  ```

### Future Improvements

HeapOverflow aims to continuously improve and expand its features. Here are some future enhancements planned for the platform:

1. **Enhanced User Interface:** Developing a robust front-end interface to provide a seamless and engaging user experience.
2. **Advanced Search Functionality:** Implementing advanced search capabilities to help users quickly find relevant questions and answers.
3. **Notification System:** Adding email and in-app notifications to alert users about important activities such as new answers, votes, or comments on their posts.
5. **Rate Limiting:** Implementing rate limiting to prevent abuse and ensure fair usage of the API.
8. **Swagger Documentation:** Integrating Swagger to provide interactive API documentation, making it easier for developers to understand and interact with the API.
9. **Automated Testing:** Implementing comprehensive automated testing (unit tests, integration tests, and end-to-end tests) to ensure the reliability and stability of the platform.
10. **Additional Authentication Methods:** Adding support for more authentication methods like OAuth with other providers, SSO (Single Sign-On), and more.



<h1>Thank you for viewing my project, I hope you liked it! 😊</h1>
