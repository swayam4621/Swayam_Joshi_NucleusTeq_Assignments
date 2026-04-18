package com.assignment.todo.service;

import com.assignment.todo.dto.TodoDTO;
import com.assignment.todo.exception.ResourceNotFoundException;
import com.assignment.todo.mapper.TodoMapper;
import com.assignment.todo.model.Todo;
import com.assignment.todo.model.TodoStatus;
import com.assignment.todo.repository.TodoRepository;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TodoService {

    private final TodoRepository todoRepository;
    private final TodoMapper todoMapper;

    //Only constructor injection and No autowired fields
    public TodoService(TodoRepository todoRepository, TodoMapper todoMapper) {
        this.todoRepository = todoRepository;
        this.todoMapper = todoMapper;
    }

    // --- CREATE TODO ---
    public TodoDTO createTodo(TodoDTO todoDTO) {
        Todo todo = todoMapper.toEntity(todoDTO);
        
        //Auto set created timestamp
        todo.setCreatedAt(Timestamp.from(Instant.now()));
        
        //Default timestamp to pending if not provided
        if (todo.getStatus() == null) {
            todo.setStatus(TodoStatus.PENDING);
        }
        
        Todo savedTodo = todoRepository.save(todo);
        return todoMapper.toDTO(savedTodo);
    }

    // --- GET ALL TODOS---
    public List<TodoDTO> getAllTodos() {
        return todoRepository.findAll().stream()
                .map(todoMapper::toDTO)
                .collect(Collectors.toList());
    }

    public TodoDTO getTodoById(Long id) {
        Todo todo = findTodoEntityById(id);
        return todoMapper.toDTO(todo);
    }

    // --- UPDATE TODO ---
    public TodoDTO updateTodo(Long id, TodoDTO updatedTodoDTO) {
        Todo existingTodo = findTodoEntityById(id);

        // Validation logic
        if (updatedTodoDTO.getStatus() != null) {
            validateStatusTransition(existingTodo.getStatus(), updatedTodoDTO.getStatus());
            existingTodo.setStatus(updatedTodoDTO.getStatus());
        }

        // Update other fields
        existingTodo.setTitle(updatedTodoDTO.getTitle());
        existingTodo.setDescription(updatedTodoDTO.getDescription());

        Todo savedTodo = todoRepository.save(existingTodo);
        return todoMapper.toDTO(savedTodo);
    }

    // --- DELETE TODO FLOW ---
    public void deleteTodo(Long id) {
        Todo todo = findTodoEntityById(id);
        todoRepository.delete(todo);
    }

    // --- HELPER METHODS ---
    private Todo findTodoEntityById(Long id) {
        return todoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Todo not found with id: " + id));
    }

    private void validateStatusTransition(TodoStatus currentStatus, TodoStatus newStatus) {
        if (currentStatus == newStatus) return; // No change, allowed

        //In this system PENDING & COMPLETED are the only states
  
        if (currentStatus == TodoStatus.COMPLETED && newStatus == TodoStatus.PENDING) {
            //allow COMPLETED to PENDING.
            return;
        } else if (currentStatus == TodoStatus.PENDING && newStatus == TodoStatus.COMPLETED) {
            //allow PENDING to COMPLETED.
            return;
        } else {
            throw new IllegalArgumentException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }
    }
}
