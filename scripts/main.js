import { createTask, renderTasks, totalTasks, getTodo } from "./tasks.js";
import { filterButtons, state, applyFilterButton, moveFilterButtons } from "./filters.js";
import { applyCursorEvents} from './drag.js'

const todo = getTodo();
const theme = document.querySelector('.theme-button');
const body = document.querySelector('body');
const addTaskInput = document.querySelector('.add-task input');

//TASKS 
addTaskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevents the line break in the textarea 

        createTask();
    };
});

//FILTERS
if (!state.selectedFilter) {
    const defaultFilter = filterButtons[0]; // 'All'
    const savedFilter = [...filterButtons].find(btn => btn.textContent === todo.filter) || defaultFilter;

    state.selectedFilter = savedFilter;
    state.selectedFilter.style.color = 'var(--bright-blue)';
    
    localStorage.setItem('todo', JSON.stringify(todo));
}

//THEME
function updateTheme(theme) {
    if (theme === 'dark') {
        body.classList.add('dark');
    } else {
        body.classList.remove('dark');
    }
    todo.theme = theme;
    localStorage.setItem('todo', JSON.stringify(todo));
}

updateTheme(todo.theme || 'light'); // Initialize the item when the pages reload

theme.addEventListener('click', (e) => { // Switches the theme when click the 'theme' button
    e.preventDefault();
    const newTheme = body.classList.toggle('dark')? 'dark' : 'light';
    updateTheme(newTheme);
});

//RENDERER CONTENT
async function init() {
    const renderedTasks = await renderTasks();
    if (!renderedTasks || renderedTasks.length === 0) return;

    Array.from(renderedTasks).forEach(box => applyCursorEvents(box));
}
init();

totalTasks();
applyFilterButton();

window.addEventListener('resize', moveFilterButtons);
document.addEventListener('DOMContentLoaded', moveFilterButtons);
