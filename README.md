# TODO APP

![Design preview for the Todo app](./images/desktop-preview.jpg)

## Project description

This a single page application based on [Frontend Mentor Desgin](https://www.frontendmentor.io/challenges/todo-app-Su1_KokOW) where you can create and save tasks <i>to do</i>. You're also able to marks the taks as conclude, exclude them and select using filters (all, active and completed).

## 🔨 Project features

- View the optimal layout for the app depending on their device's screen size;
- See hover states for all interactive elements on the page;
- Add new <i>todos</i> to the list;
- Interaction with the navigator local storage to save the tasks;
- Mark <i>todos</i> as complete;
- Delete <i>todos</i> from the list;
- Filter by all/active/complete <i>todos</i>;
- Clear all completed <i>todos</i>;
- Toggle light and dark mode;
- Drag and drop to reorder items on the list.

## 📖 Extra details

- Aiming a better personalization to the drag and drop (DnD), I decided to develop a whole Dnd system from scratch by not using any native drag event from JS (dragstart, dragover, dragend, etc.);
- This system was developed int two strands: the <b>drag.js</b> and <b>overlap.js</b>.
- The <b>drag.js</b> is responsable for apply the moviment of the the tasks elements next to the cursor by using
`item.style.left` and `item.style.top` property.
- The <b>overlap.js</b> idetifies when a dragged element is overlapping other tasks and applies the interactions of switch/reorder positions;
- The coding process was really challenging, but algo very enjoyable becasue it allows me to learn a lot more of the DOM limitations/features/interactions and the Vanilla JS itself; 

## 💻 Technologies used

<p>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-plain-wordmark.svg" height=50 style="margin-right: 0px;">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-plain-wordmark.svg" height=50 style="margin-right: 5px;">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-plain.svg" height=50 style="margin-right
: 10px;">
</p>

## 🌐 Access

You can access the project page on the this [link](https://todo-app-phi-two-51.vercel.app/) or access the [project files](https://github.com/Gabrield7/todo-app) in github.
