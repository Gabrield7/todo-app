import { createTask, renderTasks, totalTasks, getTodo } from "./tasks.js";
import { filterButtons, state, applyFilterButton, moveFilterButtons } from "./filters.js";
import { applyCursorEvents, rect } from './drag.js'

//const height = document.body.offsetHeight;
const todo = getTodo();
const theme = document.querySelector('.theme-button');
const body = document.querySelector('body');
const addTaskInput = document.querySelector('.add-task input');
//const boxes = Array.from(document.getElementsByClassName('task-box'));
const boxes = () => {
    return Array.from(document.getElementsByClassName('task-box'));
}

//TASKS 
addTaskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevents the line break in the textarea 

        createTask();
    };
});

// addTaskInput.addEventListener('blur', (e) => {
//     if (addTaskInput.value !== '') {
//         e.preventDefault();
        
//         createTask();
//     };
// });


//FILTERS
if (!state.selectedFilter) {
    const defaultFilter = filterButtons[0]; // 'All'
    const savedFilter = [...filterButtons].find(btn => btn.textContent === todo.filter) || defaultFilter;

    state.selectedFilter = savedFilter;
    todo.filter = savedFilter.textContent;
    state.selectedFilter.style.color = 'var(--bright-blue)';
    
    localStorage.setItem('todo', JSON.stringify(todo));
}

//DARK THEME
function updateTheme(theme) {
    if (theme === 'dark') {
        body.classList.add('dark');
    } else {
        body.classList.remove('dark');
    }
    todo.theme = theme;
    localStorage.setItem('todo', JSON.stringify(todo));
}

// Initialize the item when the pages reload
updateTheme(todo.theme || 'light');

// Switches the theme when click the 'theme' button
theme.addEventListener('click', (e) => {
    e.preventDefault();
    const newTheme = body.classList.toggle('dark')? 'dark' : 'light';
    updateTheme(newTheme);
});

//RENDERER CONTENT
async function init() {
    //console.log(await renderTasks());
    
    const renderedTasks = await renderTasks();
    if (!renderedTasks || renderedTasks.length === 0) return;
    //console.log(renderedTasks );

    //boxes().forEach(box => applyCursorEvents(box, boxes()));
    Array.from(renderedTasks).forEach(box => applyCursorEvents(box, Array.from(renderedTasks)));
}
init();

//renderTasks();
totalTasks();
applyFilterButton();

window.addEventListener('resize', moveFilterButtons);
document.addEventListener('DOMContentLoaded', moveFilterButtons);
