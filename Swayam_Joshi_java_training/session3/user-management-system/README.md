# User Management System (Session 3)

### Project Overview
This project is a **Spring Boot-based User Management System**. It focuses on implementing a robust backend using **Java 17**, **Maven**, and a strict **Layered Architecture**. 

The system provides a set of RESTful APIs to manage user data stored in an in-memory repository, demonstrating advanced Spring concepts like Constructor Injection, Global Exception Handling, and Component-based validation.

---

### Objectives
* **IoC & Dependency Injection:** Strict use of **Constructor Injection** (no `@Autowired` on fields).
* **Layered Architecture:** Clear separation between Controller, Service, and Repository layers.
* **Manual Validation:** Implementing custom validation logic within a dedicated `@Component`.
* **Global Exception Handling:** Providing meaningful JSON error responses for invalid inputs and missing resources.
* **Version Control:** Maintaining a clean history with 10+ logical commits.

---

### Features

#### **1. Advanced User Search**
* **Endpoint:** `GET /users/search`
* **Filtering Logic:** * Supports filtering by `name`, `age`, and `role` via `@RequestParam`.
    * **Case-insensitive** matching for Name and Role.
    * **Exact match** for Age.
    * Returns all users if no parameters are provided.

#### **2. Structured Data Submission**
* **Endpoint:** `POST /submit`
* **Validation:** Uses a custom `UserValidatorComponent` to manually check for null or empty fields before saving.
* **Responses:** Returns `201 Created` on success and `400 Bad Request` with an "invalid input" message for validation failures.

#### **3. Delete with Confirmation**
* **Endpoint:** `DELETE /users/{id}`
* **Safeguard:** Requires a mandatory query parameter `confirm=true`. 
* **Logic:** If `confirm` is `false` or missing, the system rejects the deletion with a "Confirmation required" message.

#### **4. Global Exception Handling**
* Standardized JSON responses for `UserNotFoundException`.
* Handles `HttpMessageNotReadableException` to ensure data type mismatches (e.g., sending text for age) return a clean `400 Bad Request`.

---

### Architecture
The project follows a **Strict Layered Architecture**:

1.  **Controller:** Manages HTTP requests/responses and URL mapping.
2.  **Service:** Orchestrates business flow and coordinates between the repository and validator.
3.  **Repository:** Manages the in-memory `ArrayList` of dummy users.
4.  **Component:** Handles reusable validation logic (`UserValidatorComponent`).
5.  **Exception:** Centralized error handling logic using `@RestControllerAdvice`.
6.  **Model:** Defines the core `User` POJO.

---

### Tech Stack
* **Language:** Java 17
* **Framework:** Spring Boot 3.x
* **Build Tool:** Maven
* **Testing:** Postman 

---

### API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/users` | Lists all dummy users in the system. |
| **GET** | `/users/search` | Filters users by `name`, `age`, or `role`. |
| **POST** | `/submit` | Validates and adds a new user to the list. |
| **DELETE** | `/users/{id}` | Deletes a user (requires `?confirm=true`). |

---

### API Testing (Postman)
### GET USERS/SEARCH API

#### SEARCHING WITH NO PARAMETERS - Returns all users

<img width="800" height="500" alt="image" src="https://github.com/user-attachments/assets/7704167a-7697-4f0f-b1df-42a7cddc26e9" />

#### SEARCH WITH FILTERS

#### 1) Search by name (Case Insensitive search for name)
<img width="800" height="500" alt="image" src="https://github.com/user-attachments/assets/0384c4ae-3c55-496b-8032-c584b1ec3672" />

#### 2) Search by age
<img width="800" height="500" alt="image" src="https://github.com/user-attachments/assets/ed7f9f4b-22bc-400b-a832-d3748d61d80b" />

#### 3) Search by role
<img width="800" height="500" alt="image" src="https://github.com/user-attachments/assets/e5215d47-9e97-43c6-a62f-387800a615c6" />

#### 4) Cross filters
<img width="800" height="500" alt="image" src="https://github.com/user-attachments/assets/34d80bf5-99bd-4000-b837-0ea5914c6744" />

### DATA SUBMISSION API

#### Basic checks (NULL & Empty (400))
<img width="800" height="500" alt="image" src="https://github.com/user-attachments/assets/d8dd7f4c-ca5e-4628-90d9-8141a8459dd6" />

#### Successful submission (201)
<img width="800" height="500" alt="image" src="https://github.com/user-attachments/assets/7ba6d78f-c96f-4aa6-811b-433cc1a25786" />


### DELETE WITH CONFIRMATION CHECK
#### Deleting without confirmation
<img width="800" height="500" alt="image" src="https://github.com/user-attachments/assets/d55b9afe-7b9a-4e72-9da4-9d4525cb3861" />

#### Deleting with confirmation 
<img width="800" height="500" alt="image" src="https://github.com/user-attachments/assets/fa9e3f30-d126-4afa-99f6-d140796b8c12" />

### EXCEPTION HANDLING
#### Global Exception Handling (fallback)
<img width="800" height="500" alt="image" src="https://github.com/user-attachments/assets/e44a0579-88da-41a7-b076-be13d50691ff" />

### Edge Case Handling
#### Deleting a user that does not exist (after confirmation)
<img width="800" height="500" alt="image" src="https://github.com/user-attachments/assets/8a751ca7-7a14-4f00-8fdd-80f49941fb50" />

#### Search resulting no records (Resulting in message stating the records not found for the particular search item)
<img width="800" height="500" alt="image" src="https://github.com/user-attachments/assets/186a2c60-c6dc-4003-875d-d46bde3a4299" />

---

### How to Run

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/swayam4621/Swayam_Joshi_NucleusTeq_Assignments.git
    ```
2.  **Navigate to the project:**
    ```bash
    cd Swayam_Joshi_java_training/session3/user-management-system/
    ```
3.  **Build and Run:**
    ```bash
    mvn spring-boot:run
    ```
4.  **Access the API:** `http://localhost:8080/users`

---

### Author
**Swayam Joshi**
