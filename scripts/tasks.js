import { initializeDragAndDrop } from './dragAndDrop.js';
import { state, filterButtons, displayElement } from './filters.js';
import { applyCursorEvents } from './drag.js';

const addTaskInput = document.querySelector('.add-task input');
const tasksList = document.querySelector('.list-tasks');

//const todo = JSON.parse(localStorage.getItem('todo')) || initialtodo;

function getTodo(){
    const initialTodo = {
        tasks: [],
        theme: 'light',
        filter: state.selectedFilter || 'All'
    };

    return JSON.parse(localStorage.getItem('todo')) || initialTodo;
}

function updateTaskList(task){
    const todo = getTodo();
    todo.tasks.push(task); //adds the new task to the 'tasks' array
    localStorage.setItem('todo', JSON.stringify(todo)); //updates the task list in the localStorage
    totalTasks();
    return todo.tasks;
}

function createTaskElement(taskID, taskDescription){
    const taskBox = document.createElement('li');
    taskBox.classList.add('task-box');

    const taskElement = document.createElement('div');
    taskElement.classList.add('task');
    
    taskElement.innerHTML = `
    <input id='task-${taskID}' type='checkbox'>
    <label for='task-${taskID}' class="custom-checkbox"></label>
    <p class='task-description'>${taskDescription}</p>
    <button class='task-exclude'></button>`;
    
    taskBox.appendChild(taskElement);
    tasksList.appendChild(taskBox);

    const input = taskElement.querySelector('input');
    taskCheckEvent(input);

    const deleteButton = taskElement.querySelector('.task-exclude');
    deleteEventClick(deleteButton); //adds the 'delete task' event to the 'delete button'

    //applyCursorEvents(taskBox);
    //initializeDragAndDrop();
    return taskElement;
}

function createTask(){
    const todo = getTodo();
    const taskIdArray = todo.tasks.map((_, index) => index);
    const taskID = taskIdArray.length > 0? Math.max(...taskIdArray)+1 : 0; //gets the max task number saved in localStorage
    
    if(addTaskInput.value !== ''){
        const task = {
            "description": addTaskInput.value,
            "completed": false
        };
    
        createTaskElement(taskID, task.description);
        addTaskInput.value = '';
    
        updateTaskList(task);

        const taskBoxes = tasksList.querySelectorAll('.task-box');
        displayElement(taskBoxes, state.selectedFilter);
    };
};

function deleteTask(element){
    element.remove();

    const todo = getTodo();
    const taskID = element.querySelector('input').id;
    const taskNumber = Number(taskID.split('-')[1]);
    
    todo.tasks.splice(taskNumber, 1); //Removes que selected task
    
    localStorage.setItem('todo', JSON.stringify(todo));
    
    //Restore the 'filter' button style
    if(tasksList.childElementCount === 0){
        filterButtons.forEach(button => {
            button.style.color = 'var(--dark-grayish-blue)';
        });
    };
}

function deleteEventClick(button){
    button.addEventListener('click', () => {
        const li = button.parentElement.parentElement;
        deleteTask(li);
        totalTasks();   
    })
};

async function renderTasks() {
    const todo = getTodo();
    if(todo.tasks.length === 0) return;

    await Promise.all(todo.tasks.map((task, index) => {
        const taskElement = createTaskElement(index, task.description); //recreate the tasks when the page is reloaded

        const taskInput = taskElement.querySelector('input');
        taskInput.checked = task && task.completed? true:false;
        strikeDescription(taskInput);
    }));

    const taskBoxes = tasksList.querySelectorAll('.task-box');
    displayElement(taskBoxes, state.selectedFilter);

    return taskBoxes;
    //taskBoxes.forEach(box => applyCursorEvents(box));
};

function taskCheckEvent(input){
    const todo = getTodo();
    input.addEventListener('change', () => {
        const taskID = Number(input.id.split('-')[1]); //task number regitered in DOM
        const taskIndex = todo.tasks.findIndex((_, index) => index === taskID);
        
        todo.tasks[taskIndex].completed = input.checked ? true:false;
        
        localStorage.setItem('todo', JSON.stringify(todo));
        strikeDescription(input);
        totalTasks();

        const taskBoxes = tasksList.querySelectorAll('.task-box');
        displayElement(taskBoxes, state.selectedFilter);
    });
};

function strikeDescription(input){ //Adds an 'strike' effect to content tasks marked as completed 
    const taskDescription = input.parentElement.querySelector('.task-description');
    
    if (!taskDescription.dataset.originalColor) {
        const originalColor = window.getComputedStyle(taskDescription).getPropertyValue('color'); //gets the propert 'color' regitered in css file
        taskDescription.dataset.originalColor = originalColor; //save the original color
    }
    
    taskDescription.style.textDecoration = input.checked ? 'line-through':'none';
    taskDescription.style.color = input.checked ? 'var(--dark-grayish-blue)':taskDescription.dataset.originalColor;
}

function totalTasks(){ //Shows (and update) how many tasks left to complete
    const todo = getTodo();
    const tasks = todo.tasks;
    const taskFilters = document.querySelector('.task-filters span');

    const total = tasks.filter(task => task.completed === false).length;
    taskFilters.textContent = `${total} items left`;
}

export {createTask, renderTasks, deleteTask, totalTasks, getTodo};
