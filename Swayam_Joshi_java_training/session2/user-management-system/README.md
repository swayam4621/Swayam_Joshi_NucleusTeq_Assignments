
#  User Management System (Spring Boot)

###  Project Overview
This project is a **Spring Boot-based User Management System** designed using a clean layered architecture. It demonstrates how to build a scalable backend application with proper separation of concerns, exception handling, and modular design. 

The system supports **CRUD operations**, along with additional modules like a **Notification Service** and a **Dynamic Message Formatter**, making it a complete backend practice project.

---

###  Objectives
* Implement **RESTful APIs** using Spring Boot.
* Apply **Layered Architecture** (Controller → Service → Repository).
* Handle exceptions using a **Global Exception Handler** with `@RestControllerAdvice`.
* Demonstrate **Dependency Injection** and the **Strategy Pattern** (for the Message Formatter).
* Maintain a strict **Separation of Concerns**.

---

###  Features

#### **1. User Management**
* **Create:** Add new users with unique IDs.
* **Retrieve:** Fetch all users or a specific user by ID.
* **Update:** Modify existing user details.
* **Delete:** Remove users from the system.

#### **2. Exception Handling**
* Standardized JSON error responses for **User Not Found** (404) and **Invalid Data** (400).
* Global safety net for unexpected server errors.

#### **3. Notification Module**
* Triggers a success response via a reusable `@Component`.

#### **4. Dynamic Message Formatter**
* Supports **SHORT** and **LONG** formats.
* **The Twist:** Uses Map-based Dependency Injection to decide the format at runtime without using `if-else` blocks in the controller.

---

###  Architecture
The project follows a **Strict Layered Architecture** to ensure maintainability:

1.  **Controller Layer:** Handles HTTP requests and returns JSON responses.
2.  **Service Layer:** Contains the core business and decision logic.
3.  **Repository Layer:** Manages data storage (In-memory list).
4.  **Model Layer:** Defines the `User` entity.
5.  **Component Layer:** Holds reusable utility logic (Notification).
6.  **Formatter Layer:** Implements the Strategy Pattern for message styling.
7.  **Exception Layer:** Manages global error handling logic.

---

###  Tech Stack
* **Language:** Java 17
* **Framework:** Spring Boot 3.x
* **Build Tool:** Maven
* **API Testing:** Postman / Thunder Client

---

###  API Endpoints

#### **User APIs**
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/users` | Returns a list of all users. |
| **GET** | `/users/{id}` | Returns details of a specific user. |
| **POST** | `/users` | Adds a new user and triggers a notification. |
| **PUT** | `/users/{id}` | Updates details for an existing user. |
| **DELETE** | `/users/{id}` | Deletes a user by ID. |

#### **Notification API**
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/notify` | Returns a success message via the Notification Component. |

#### **Formatter API**
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/message?type=SHORT` | Returns a concise "Hi, [Name]" format. |
| **GET** | `/api/message?type=LONG` | Returns a detailed system welcome message. |

---
### API Testing Using Postman
### Get all users
<img width="891" height="643" alt="image" src="https://github.com/user-attachments/assets/22efde75-c6a5-4e4d-bc13-28e363be900a" />

### Get User by id
<img width="893" height="386" alt="image" src="https://github.com/user-attachments/assets/ee8b295d-4e48-405d-998f-b51f990ea382" />

### Add user
<img width="887" height="507" alt="image" src="https://github.com/user-attachments/assets/720fce44-11a3-4b88-8030-2fbb58966097" />

### Verifying added user 
<img width="947" height="407" alt="image" src="https://github.com/user-attachments/assets/14e73299-bde0-4558-9aaf-82e1fc8914a4" />

### Update user 
<img width="896" height="620" alt="image" src="https://github.com/user-attachments/assets/c3363ae5-ae8b-4ba6-98a4-512c8f4c7788" />

### Delete user
<img width="897" height="340" alt="image" src="https://github.com/user-attachments/assets/49252264-e9a5-445c-b9ae-1e082e8bb1b2" />

### Exception Handling (User Not Found exception)
<img width="890" height="402" alt="image" src="https://github.com/user-attachments/assets/8674139f-59b2-4472-adc6-3bb155f6eb0d" />

### Notification System api
<img width="906" height="498" alt="image" src="https://github.com/user-attachments/assets/38cf4371-5064-45d5-baa6-c353609cdb6c" />

### Message Formatter 
### LONG
<img width="892" height="447" alt="image" src="https://github.com/user-attachments/assets/d0e65171-3cd4-410b-a6cd-d207055696ab" />

### SHORT
<img width="887" height="353" alt="image" src="https://github.com/user-attachments/assets/b0df095d-83b7-4802-b7f0-3dbde543697c" />

---
###  How to Run the Project

1.  **Clone the repository:**
    ```bash

    git clone https://https://github.com/swayam4621/Swayam_Joshi_NucleusTeq_Assignments.git
    ```
2.  **Open in IDE:** (VS Code or IntelliJ).
3.  **Run the application:**
    * Using Maven: `mvn spring-boot:run`
    * Using Maven Wrapper: `./mvnw spring-boot:run`
4.  **Test APIs:** Use Postman or Thunder Client to hit `http://localhost:8080`.

---

###  Key Concepts Applied
* **Constructor Injection:** For safe and testable dependency management.
* **In-Memory Data Handling:** Simulating a database using Java Collections.
* **Strategy Pattern:** Dynamically picking formatters at runtime.
* **Clean Code:** Meaningful variable naming and modular file structure.

---

###  Author
**Swayam Joshi** 
