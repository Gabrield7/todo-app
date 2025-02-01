import { createTask, renderTasks, totalTasks, getTodo, strikeDescription } from "./tasks.js";
import { filterButtons, state, applyFilterButton, moveFilterButtons } from "./filters.js";
import { element, autoScroll, applyCursorEvents } from './drag.js'

const todo = getTodo();
const theme = document.querySelector('.theme-button');
const body = document.querySelector('body');
const addTaskInput = document.querySelector('.add-task input');
const boxes = () => Array.from(document.getElementsByClassName('task-box'));
const allItems = () => boxes().map(box => box.querySelector('.task'));

//TASKS 
addTaskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevents the line break in the textarea 

        createTask();

        addTaskInput.blur();
    };
});

export let keyboardActive = false;
addTaskInput.addEventListener('focusin', () => {
    keyboardActive = true;
    console.log('teclado ativo');
});

addTaskInput.addEventListener('focusout', () => {
    keyboardActive = false;
    console.log('teclado inativo');
});

//FILTERS
if (!state.selectedFilter) {
    const defaultFilter = filterButtons[0]; // 'All'
    const savedFilter = [...filterButtons].find(btn => btn.textContent === todo.filter) || defaultFilter;

    state.selectedFilter = savedFilter;
    state.selectedFilter.style.color = 'var(--bright-blue)';
    
    localStorage.setItem('todo', JSON.stringify(todo));
}

//RENDERER CONTENT
async function init() {
    const renderedTasks = await renderTasks();
    if (!renderedTasks || renderedTasks.length === 0) return;

    Array.from(renderedTasks).forEach(box => applyCursorEvents(box));
}
init();

totalTasks();
applyFilterButton();

let margin = {
    top: 10,
    bottom: window.innerHeight - 10
};
allItems().forEach(item => {
    const marginObserver = new IntersectionObserver((entries) => {
        if(item !== element.target) return;
    
        entries.forEach(entry => {
            const rect = entry.target.getBoundingClientRect();
            
            if (rect.bottom > margin.bottom) autoScroll(1);
            if (rect.top < margin.top) autoScroll(-1);
        });
    }, { threshold: [0, 1] });

    marginObserver.observe(item)
});

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

    allItems().forEach(item => {
        const input = item.querySelector('input');
        strikeDescription(input);
    })
});

window.addEventListener('resize', moveFilterButtons);
document.addEventListener('DOMContentLoaded', moveFilterButtons);

