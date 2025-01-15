import { createTask, renderTasks, totalTasks, todo } from "./tasks.js";
import { filterButtons, state, applyFilterButton, moveFilterButtons } from "./filters.js";

const tasksList = document.querySelector('.list-tasks');
const theme = document.querySelector('.theme-button');
const body = document.querySelector('body');
const addTaskInput = document.querySelector('.add-task input');

//TASKS 
addTaskInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevents the line break in the textarea 

        createTask();
    };
});

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

// Initialize the tem when the pages reload
updateTheme(todo.theme || 'light');

// Switches the theme when click the 'theme' button
theme.addEventListener('click', (e) => {
    e.preventDefault();
    const newTheme = body.classList.toggle('dark')? 'dark' : 'light';
    updateTheme(newTheme);
});

//RENDERER CONTENT
renderTasks();
totalTasks();
applyFilterButton();

window.addEventListener('resize', moveFilterButtons);
document.addEventListener('DOMContentLoaded', moveFilterButtons);

