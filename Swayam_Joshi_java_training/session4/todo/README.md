# Todo Application (Session 4)

### Project Overview
This project is a **Spring Boot-based Todo Application**. It focuses on implementing a robust backend using **Java 17**, **Maven**, and a strict **Layered Architecture** while integrating a database via **Spring Data JPA**. 

The system provides a set of RESTful APIs to manage Todo tasks stored in an **H2 in-memory database**. It demonstrates advanced Spring concepts like Constructor Injection, Manual DTO-to-Entity mapping, Jakarta Validation, and Global Exception Handling.

---

### Objectives
* **JPA & Database Integration:** Strict use of Spring Data JPA (`@Entity`, `@Table`, `@Id`) with an H2 in-memory database.
* **DTO Pattern:** Implementation of a strict DTO layer to ensure database entities are never directly exposed to the API client.
* **Manual Data Mapping:** Custom mapper classes to handle conversions between `Todo` entities and `TodoDTO`s.
* **IoC & Dependency Injection:** Strict use of **Constructor Injection** (no `@Autowired` on fields).
* **Layered Architecture:** Clear separation between Controller, Service, and Repository layers, ensuring absolutely zero business logic resides in the Controller.
* **Validation & Exception Handling:** Using `@Valid` for request validation and providing meaningful JSON error responses via `@RestControllerAdvice`.
* **Unit Testing:** Implementing test cases for the Service layer using JUnit 5 and Mockito.

---

### Features

#### **1. Create TODO**
* **Endpoint:** `POST /todos`
* **Validation:** Uses `@Valid` to ensure the `title` is not null and is at least 3 characters long.
* **Logic:** Automatically sets the `createdAt` timestamp and defaults the `status` to `PENDING` if not provided.

#### **2. Retrieve TODOs**
* **Endpoint:** `GET /todos` (All) and `GET /todos/{id}` (By ID)
* **Logic:** Fetches data from the repository, maps it to a DTO, and safely returns it to the client. Returns custom error responses if the ID does not exist.

#### **3. Update & Status Transitions**
* **Endpoint:** `PUT /todos/{id}`
* **Logic:** Allows updating of the title, description, and status. Implements strict business rules that only allow specific status transitions (e.g., `PENDING` ↔ `COMPLETED`). 

#### **4. Delete TODO**
* **Endpoint:** `DELETE /todos/{id}`
* **Logic:** Completely removes the task from the database.

---

### Architecture
The project follows a **Strict Layered Architecture**:

1.  **Controller:** Manages HTTP requests/responses, triggers `@Valid`, and maps endpoints.
2.  **Service:** Orchestrates core business flow, handles status transition logic, and coordinates mappings.
3.  **Repository:** Extends `JpaRepository` for abstracted database access.
4.  **Mapper:** Manages manual mapping between `Todo` entities and `TodoDTO`s (`TodoMapper`).
5.  **Exception:** Centralized error handling logic (`GlobalExceptionHandler`, `ResourceNotFoundException`).
6.  **Model/DTO:** Defines the core `Todo` JPA Entity, `TodoStatus` Enum, and the client-facing `TodoDTO`.

---

### Tech Stack
* **Language:** Java 17
* **Framework:** Spring Boot 3.x
* **Database:** H2 In-Memory Database
* **ORM:** Spring Data JPA (Hibernate)
* **Build Tool:** Maven
* **Testing:** JUnit 5, Mockito, Postman 

---

### API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/todos` | Creates a new Todo task. |
| **GET** | `/todos` | Lists all Todo tasks in the system. |
| **GET** | `/todos/{id}` | Fetches a specific Todo task by its ID. |
| **PUT** | `/todos/{id}` | Updates an existing Todo task. |
| **DELETE**| `/todos/{id}` | Deletes a Todo task by its ID. |

---

### API Testing (Postman)

### 1. CREATE TODO API (POST)

#### Successful Creation (Auto-sets timestamp & default status)
<img width="902" height="592" alt="image" src="https://github.com/user-attachments/assets/23cc300e-34ee-4662-81de-738261026b44" />


#### Validation Failure (Title too short or null - Returns 400)
<img width="902" height="497" alt="image" src="https://github.com/user-attachments/assets/c50e638c-0230-427f-8c22-dbf32d6044df" />

### 2. GET TODOs API

#### Get All Todos

<img width="902" height="726" alt="image" src="https://github.com/user-attachments/assets/1f8f0a1a-49d3-4934-bcaf-a40af6c1b66a" />

#### Get Todo by ID
<img width="902" height="382" alt="image" src="https://github.com/user-attachments/assets/74730a9e-ef87-447a-9966-78991bf4aba6" />

### 3. UPDATE TODO API (PUT)

#### Successful Update (Status changed to COMPLETED)
<img width="902" height="588" alt="image" src="https://github.com/user-attachments/assets/dd928de4-5754-4595-9dba-8a9e7b6278c0" />


### 4. DELETE TODO API
#### Successful Deletion (Returns 204 No Content)
<img width="902" height="345" alt="image" src="https://github.com/user-attachments/assets/a69fa729-7eea-48a3-8201-1bf92da789fe" />


### EXCEPTION & EDGE CASE HANDLING

#### Resource Not Found (Getting/Updating/Deleting an ID that doesn't exist)
<img width="902" height="338" alt="image" src="https://github.com/user-attachments/assets/199dfdc4-2a1c-43ad-ad05-407b7cb6f94e" />


#### Changing state from Completed to Pending not allowed
<img width="902" height="597" alt="image" src="https://github.com/user-attachments/assets/ba19815d-ddd5-4a73-9bf4-2994c3345f16" />


---

### How to Run

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/swayam4621/Swayam_Joshi_NucleusTeq_Assignments.git
    ```
2.  **Navigate to the project:**
    ```bash
    cd Swayam_Joshi_java_training/session4/todo/
    ```
3.  **Build and Run:**
    ```bash
    mvn spring-boot:run
    ```
4.  **Access the API:** `http://localhost:8080/todos`
5.  **Access the H2 Database Console:** `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:tododb`, Username: `sa`, Password: `<blank>`)

---

### Author
**Swayam Joshi**
