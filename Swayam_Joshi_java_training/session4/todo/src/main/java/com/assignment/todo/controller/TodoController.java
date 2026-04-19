package com.assignment.todo.controller;

import com.assignment.todo.dto.TodoDTO;
import com.assignment.todo.service.TodoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
// Importing necessary classes for logging, exception handling, and collections session5
import org.slf4j.Logger;
import org.slf4j.LoggerFactory; 

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/todos")
public class TodoController {

    private static final Logger log = LoggerFactory.getLogger(TodoController.class);
    private final TodoService todoService;

    // Strict constructor injection
    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    @PostMapping
    public ResponseEntity<TodoDTO> createTodo(@Valid @RequestBody TodoDTO todoDTO) {
        log.info("Received post request to create a new Todo: {}", todoDTO.getTitle());
        TodoDTO createdTodo = todoService.createTodo(todoDTO);
        return new ResponseEntity<>(createdTodo, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TodoDTO>> getAllTodos() {
        log.info("Received get request to fetch all Todos");
        return ResponseEntity.ok(todoService.getAllTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TodoDTO> getTodoById(@PathVariable Long id) {
        log.info("Received get request for Todo with ID: {}", id);
        return ResponseEntity.ok(todoService.getTodoById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TodoDTO> updateTodo(@PathVariable Long id, @Valid @RequestBody TodoDTO todoDTO) {
        log.info("Received put request to update Todo with ID: {}", id);
        return ResponseEntity.ok(todoService.updateTodo(id, todoDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTodo(@PathVariable Long id) {
        log.info("Received delete request for Todo with ID: {}", id);
        todoService.deleteTodo(id);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Todo item with ID " + id + " was successfully deleted.");
        
        //Return a 200 OK status instead of 204 No Content
        return ResponseEntity.ok(response);
    }
}