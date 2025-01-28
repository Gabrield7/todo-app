import { getTodo, deleteTask } from "./tasks.js";
import { rect, setElementPosition } from './drag.js';

const tasksList = document.querySelector('.list-tasks');
const filterButtons = document.querySelectorAll('.filter-buttons > button');
const [filterAllBtn, filterActiveBtn, filterCompletedBtn] = filterButtons;
const clearCompletedBtn = document.querySelector('.clear-tasks');

const boxes = () => Array.from(document.getElementsByClassName('task-box'));

const state = { //Stores in a exportable variable the actual selected filter
    selectedFilter: null,
};

function restoreButtonStyle(btn){
    const originalColor = 'var(--dark-grayish-blue)';

    filterButtons.forEach(button => {
        button.style.color = button === btn? 'var(--bright-blue)' : originalColor;
    });
};

function displayElement(filterBtn){
    boxes().forEach(element => {
        const taskElement = element.querySelector('.task');
    
        const isFilterAll = filterBtn === filterAllBtn;
        const isFilterActive = filterBtn === filterActiveBtn;
        
        if(isFilterAll) {
            element.style.display = 'flex';  
        }else {
            const taskState = taskElement.querySelector('input').checked;       
            element.style.display = (isFilterActive ? taskState : !taskState)? 'none':'flex';
        };
    });
};

function applyFilter(filterBtn){
    filterBtn.addEventListener('click', () => {
        const todo = getTodo();

        const taskBoxes = tasksList.querySelectorAll('.task-box');
        displayElement(filterBtn);

        restoreButtonStyle(filterBtn);
        state.selectedFilter = filterBtn; // Updates the selected exportable filter variable

        todo.filter = filterBtn.textContent;
        localStorage.setItem('todo', JSON.stringify(todo)); // Updates the selected filter in LocalStorage

        //Readjustment of the 'element' position in relation to the 'box' position
        taskBoxes.forEach(box => { 
            const item = box.querySelector('.task');
    
            box.setAttribute('x', rect(box).left);
            box.setAttribute('y', rect(box).top);
    
            setElementPosition(item, { positionCallback: rect, referenceItem: box });
        });
    });
};

const applyFilterButton = () => {
    filterButtons.forEach(button => applyFilter(button));

    clearCompletedBtn.addEventListener('click', () => {
        const taskBoxes = tasksList.querySelectorAll('.task-box');

        taskBoxes.forEach(element => {
            const taskState = element.querySelector('input').checked;
            
            if(taskState) deleteTask(element);
        });
    });
};

function moveFilterButtons() {
    const filterButtonsDiv = document.querySelector('.filter-buttons');
    const filterButtonsMobile = document.querySelector('.filter-buttons__mobile');

    filterButtons.forEach(btn => {
        filterButtonsMobile.style.display = 'none';
        if(filterButtonsMobile.contains(btn)){
            filterButtonsDiv.appendChild(btn);
        };
    });

    if (window.innerWidth < 501) {
        filterButtonsMobile.style.display = 'flex';
        filterButtons.forEach(btn => {
            if(filterButtonsDiv.contains(btn)){
                filterButtonsMobile.appendChild(btn);
            }
        });
    };
};

export { state, filterButtons, applyFilterButton, displayElement, moveFilterButtons };
