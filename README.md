# HeapOverflow
# Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Why Monolithic Architecture?](#why-monolithic-architecture)
- [API Versioning](#api-versioning)
- [Authentication](#authentication)
- [Real-Time Notifications](#real-time-notifications)
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

## Features

- **Question & Answer Functionality:** Users can pose questions and provide answers.
- **Voting System:** Both questions and answers can be upvoted or downvoted to signify relevance and accuracy.
- **Authentication Required:** Posting questions or answers requires user authentication to ensure accountability.
- **Real-Time Updates:** Real-time updates for question, answer, and vote modifications can be pushed to clients.
- **Scalable Architecture:** Designed to dynamically scale with user activity levels.

## Why Monolithic Architecture?

For this MVP, a monolithic architecture is employed, reflecting the successful structure used by Stack Overflow. This architecture was chosen for several reasons:

- **Simplicity:** Monolithic applications are simpler to develop and deploy, especially when starting new projects. It allows for faster, more cohesive development cycles without the complexity of managing multiple services.
- **Performance:** As all components run within the same process, communication between various parts of the application is fast and straightforward, which is crucial for real-time features.
- **Reliability:** Fewer moving parts mean fewer points of failure, which enhances the overall reliability of the application during the initial deployment phases.
- **Scalability:** Despite common beliefs, monoliths can be scaled efficiently, especially when deployed on modern cloud platforms that support automatic scaling and load balancing.

## API Versioning

To ensure the API remains backward compatible and adaptable to future changes, we implement versioning:

- **Version Format:** Our API versions are number based, for example, `v2`.
- **Deprecation Strategy:** Older versions are supported for 12 months after a new version is released, with plenty of notice given to developers about deprecations and upgrades.

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

